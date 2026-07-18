import type {
  Activity,
  AvatarConfig,
  CompletedActivity,
  PerPerfilProgress,
  Profile,
  ProgressState,
  ViajeProgress,
} from '@/types';
import { readRaw, writeState } from './storage';
import { PRIMERA_ETAPA_ID } from './ruta';
import { avatarPorDefecto, idsPiezasDesbloqueadas } from './avatarPiezas';

const FECHA_HOY = () => new Date().toISOString().slice(0, 10);

/**
 * Versión del esquema de ProgressState guardado en localStorage.
 *
 * El progreso del alumno es sagrado: nunca debe perderse por un cambio en la
 * estructura de datos. Cuando añadas o cambies un campo:
 *   1. Incrementa CURRENT_VERSION.
 *   2. Añade al final de MIGRATIONS la función que transforma la versión
 *      anterior en la nueva. Debe ser ADITIVA (rellena valores por defecto
 *      para lo nuevo) y nunca debe borrar datos ya guardados.
 * `migrarEstado` aplica todas las migraciones pendientes en orden y, además,
 * pasa el resultado por un saneado defensivo (`sanearProgressState`) que
 * garantiza la forma correcta incluso si una migración tiene un fallo o el
 * JSON guardado está parcialmente corrupto.
 */
export const CURRENT_VERSION = 2;

type RawState = Record<string, unknown>;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// Ids de etapa que cambiaron de nombre al reordenar la ruta del viaje en
// julio de 2026 (Escandinavia ahora se entra por Suecia con ferry desde
// Alemania; países bálticos y Polonia pasan a la bajada). Solo se usa en la
// migración v1 -> v2, para no perder sellos/estrellas ya conseguidos con el
// id antiguo: `_ruta.json` ya usa los ids nuevos directamente.
const ETAPA_ID_RENOMBRADAS: Record<string, string> = {
  'suecia': 'suecia-ida',
  'finlandia': 'finlandia-ida',
  'paises-bajos': 'paises-bajos-vuelta',
  'ferry-tallinn-helsinki': 'ferry-finlandia-estonia',
  'ferry-malmo-alemania': 'ferry-alemania-malmo',
};

/** Renombra las claves de un objeto etapaId -> valor según ETAPA_ID_RENOMBRADAS. */
function renombrarClavesEtapa(v: unknown): unknown {
  if (!isObject(v)) return v;
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(v)) {
    out[ETAPA_ID_RENOMBRADAS[k] ?? k] = val;
  }
  return out;
}

const MIGRATIONS: Array<(raw: RawState) => RawState> = [
  // v0 -> v1: primera versión formal del esquema versionado. No había ningún
  // campo que reubicar todavía — el saneado defensivo de
  // `sanearProgressState` (que se aplica siempre, después de las
  // migraciones) ya rellena por su cuenta todo lo añadido antes de que
  // existiera este sistema (avatar del perfil, viaje, tutorialVisto,
  // piezasAvatarDesbloqueadas…).
  (raw) => raw,

  // v1 -> v2: reordenación de la ruta de julio 2026 (ver ETAPA_ID_RENOMBRADAS
  // arriba). Remapea los ids de etapa dentro de `viaje` de cada perfil, para
  // que un alumno que ya hubiera conseguido el sello de, p.ej., "suecia" no
  // lo pierda solo porque esa etapa ahora se llama "suecia-ida".
  (raw) => {
    const porPerfilRaw = raw.porPerfil;
    if (!isObject(porPerfilRaw)) return raw;
    const porPerfil: Record<string, unknown> = {};
    for (const [perfilId, p] of Object.entries(porPerfilRaw)) {
      if (!isObject(p) || !isObject(p.viaje)) {
        porPerfil[perfilId] = p;
        continue;
      }
      const viajeRaw = p.viaje;
      const etapaActualId =
        typeof viajeRaw.etapaActualId === 'string'
          ? (ETAPA_ID_RENOMBRADAS[viajeRaw.etapaActualId] ?? viajeRaw.etapaActualId)
          : viajeRaw.etapaActualId;
      const capitulosVistosRaw = viajeRaw.capitulosVistos;
      porPerfil[perfilId] = {
        ...p,
        viaje: {
          ...viajeRaw,
          etapaActualId,
          sellos: renombrarClavesEtapa(viajeRaw.sellos),
          estrellas: renombrarClavesEtapa(viajeRaw.estrellas),
          capitulosVistos: Array.isArray(capitulosVistosRaw)
            ? capitulosVistosRaw.map((id) => (typeof id === 'string' ? (ETAPA_ID_RENOMBRADAS[id] ?? id) : id))
            : capitulosVistosRaw,
        },
      };
    }
    return { ...raw, porPerfil };
  },
];

function stringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function defaultViajeProgress(): ViajeProgress {
  return {
    etapaActualId: PRIMERA_ETAPA_ID,
    capitulosVistos: [],
    sellos: {},
    estrellas: {},
    curiosidadesVistas: [],
  };
}

function emptyPerfilProgress(): PerPerfilProgress {
  return {
    xpTotal: 0,
    rachaDias: 0,
    ultimaActividadFecha: null,
    actividadesCompletadas: {},
    saberesDominados: [],
    logrosDesbloqueados: [],
    tiempoHoyS: 0,
    fechaHoy: null,
    viaje: defaultViajeProgress(),
    tutorialVisto: false,
    piezasAvatarDesbloqueadas: idsPiezasDesbloqueadas(1),
  };
}

function emptyState(): ProgressState {
  return { perfiles: [], perfilActivo: null, porPerfil: {} };
}

// ---------- Saneado defensivo ----------
// Ante un campo ausente o de tipo inesperado, cada función devuelve un valor
// por defecto en vez de lanzar: un fallo aquí rompería el render de toda la
// app y dejaría el progreso guardado inaccesible (aunque siga intacto en
// localStorage). Se usan tanto al cargar el estado como al restaurar una
// copia de seguridad importada manualmente.

function hydrateAvatar(raw: unknown): AvatarConfig {
  const base = avatarPorDefecto();
  if (!isObject(raw)) return base;
  return {
    base: typeof raw.base === 'string' ? raw.base : base.base,
    pelo: typeof raw.pelo === 'string' ? raw.pelo : base.pelo,
    ropa: typeof raw.ropa === 'string' ? raw.ropa : base.ropa,
    fondo: typeof raw.fondo === 'string' ? raw.fondo : base.fondo,
    accesorio: typeof raw.accesorio === 'string' ? raw.accesorio : base.accesorio,
  };
}

/** Sanea un perfil. Devuelve null solo si falta el `id` (imposible de enlazar con su progreso). */
export function hydrateProfile(raw: unknown): Profile | null {
  if (!isObject(raw) || typeof raw.id !== 'string' || !raw.id) return null;
  return {
    id: raw.id,
    nombre: typeof raw.nombre === 'string' && raw.nombre.trim() ? raw.nombre : 'Explorador',
    nivel: raw.nivel === '1-eso' ? '1-eso' : '5-primaria',
    avatar: hydrateAvatar(raw.avatar),
    creado: typeof raw.creado === 'number' ? raw.creado : Date.now(),
  };
}

function hydrateViaje(raw: unknown): ViajeProgress {
  const base = defaultViajeProgress();
  if (!isObject(raw)) return base;
  return {
    etapaActualId: typeof raw.etapaActualId === 'string' ? raw.etapaActualId : base.etapaActualId,
    capitulosVistos: Array.isArray(raw.capitulosVistos) ? stringArray(raw.capitulosVistos) : base.capitulosVistos,
    sellos: isObject(raw.sellos) ? (raw.sellos as ViajeProgress['sellos']) : base.sellos,
    estrellas: isObject(raw.estrellas) ? (raw.estrellas as ViajeProgress['estrellas']) : base.estrellas,
    curiosidadesVistas: Array.isArray(raw.curiosidadesVistas)
      ? stringArray(raw.curiosidadesVistas)
      : base.curiosidadesVistas,
  };
}

/** Sanea el progreso de un perfil, rellenando cualquier campo ausente o con tipo inesperado. */
export function hydratePerfilProgress(raw: unknown): PerPerfilProgress {
  const p = isObject(raw) ? raw : {};
  const xpTotal = typeof p.xpTotal === 'number' && Number.isFinite(p.xpTotal) && p.xpTotal >= 0 ? p.xpTotal : 0;
  return {
    xpTotal,
    rachaDias: typeof p.rachaDias === 'number' && Number.isFinite(p.rachaDias) ? p.rachaDias : 0,
    ultimaActividadFecha: typeof p.ultimaActividadFecha === 'string' ? p.ultimaActividadFecha : null,
    actividadesCompletadas: isObject(p.actividadesCompletadas)
      ? (p.actividadesCompletadas as Record<string, CompletedActivity>)
      : {},
    saberesDominados: stringArray(p.saberesDominados),
    logrosDesbloqueados: stringArray(p.logrosDesbloqueados),
    tiempoHoyS: typeof p.tiempoHoyS === 'number' && Number.isFinite(p.tiempoHoyS) ? p.tiempoHoyS : 0,
    fechaHoy: typeof p.fechaHoy === 'string' ? p.fechaHoy : null,
    viaje: hydrateViaje(p.viaje),
    tutorialVisto: p.tutorialVisto === true,
    // Si faltaba (perfil anterior a esta función), se recalcula según el
    // nivel YA alcanzado: así no se le "roban" al alumno piezas que ya se
    // había ganado antes de que este campo existiera.
    piezasAvatarDesbloqueadas: Array.isArray(p.piezasAvatarDesbloqueadas)
      ? stringArray(p.piezasAvatarDesbloqueadas)
      : idsPiezasDesbloqueadas(nivelDeXP(xpTotal).nivel),
  };
}

function hydratePorPerfil(raw: unknown): Record<string, PerPerfilProgress> {
  const out: Record<string, PerPerfilProgress> = {};
  if (!isObject(raw)) return out;
  for (const [id, p] of Object.entries(raw)) {
    out[id] = hydratePerfilProgress(p);
  }
  return out;
}

/** Saneado final: garantiza la forma correcta de ProgressState pase lo que pase antes. */
function sanearProgressState(raw: RawState): ProgressState {
  return {
    perfiles: Array.isArray(raw.perfiles)
      ? raw.perfiles.map(hydrateProfile).filter((p): p is Profile => p !== null)
      : [],
    perfilActivo: typeof raw.perfilActivo === 'string' ? raw.perfilActivo : null,
    porPerfil: hydratePorPerfil(raw.porPerfil),
  };
}

/** Aplica las migraciones pendientes (desde la versión guardada hasta CURRENT_VERSION) y sanea el resultado. */
export function migrarEstado(raw: unknown): ProgressState {
  let s: RawState = isObject(raw) ? raw : {};
  const desde = typeof s.version === 'number' && s.version >= 0 ? Math.floor(s.version) : 0;
  for (let v = desde; v < CURRENT_VERSION; v++) {
    const paso = MIGRATIONS[v];
    if (!paso) break; // no debería faltar, pero un paso ausente no debe romper la carga
    s = paso(s);
  }
  return sanearProgressState(s);
}

export function loadProgress(): ProgressState {
  try {
    const raw = readRaw();
    if (raw === null) return emptyState();
    return migrarEstado(raw);
  } catch (err) {
    // El progreso nunca debe perderse en silencio por un fallo inesperado
    // aquí: se registra el error para poder diagnosticarlo, pero como último
    // recurso se cae a un estado vacío en vez de dejar la app rota.
    console.error('Error migrando el progreso guardado, se usa estado vacío:', err);
    return emptyState();
  }
}

export function saveProgress(state: ProgressState): void {
  writeState({ ...state, version: CURRENT_VERSION });
}

export function addProfile(state: ProgressState, profile: Profile): ProgressState {
  return {
    ...state,
    perfiles: [...state.perfiles, profile],
    perfilActivo: profile.id,
    porPerfil: { ...state.porPerfil, [profile.id]: emptyPerfilProgress() },
  };
}

export function setActiveProfile(state: ProgressState, profileId: string): ProgressState {
  return { ...state, perfilActivo: profileId };
}

/** Guarda una nueva configuración de avatar para el perfil activo. */
export function setAvatarConfig(state: ProgressState, config: AvatarConfig): ProgressState {
  const perfilId = state.perfilActivo;
  if (!perfilId) return state;
  return {
    ...state,
    perfiles: state.perfiles.map((p) => (p.id === perfilId ? { ...p, avatar: config } : p)),
  };
}

/** Marca el tutorial narrativo como visto para el perfil activo. */
export function setTutorialVisto(state: ProgressState): ProgressState {
  const perfilId = state.perfilActivo;
  if (!perfilId) return state;
  const actual = state.porPerfil[perfilId];
  if (!actual || actual.tutorialVisto) return state;
  return {
    ...state,
    porPerfil: { ...state.porPerfil, [perfilId]: { ...actual, tutorialVisto: true } },
  };
}

/** Cambia la etapa actual del perfil activo. */
export function setEtapaActual(state: ProgressState, etapaId: string): ProgressState {
  const perfilId = state.perfilActivo;
  if (!perfilId) return state;
  const actual = state.porPerfil[perfilId];
  if (!actual) return state;
  if (actual.viaje.etapaActualId === etapaId) return state;
  return {
    ...state,
    porPerfil: {
      ...state.porPerfil,
      [perfilId]: { ...actual, viaje: { ...actual.viaje, etapaActualId: etapaId } },
    },
  };
}

/** Guarda la lista de curiosidades diarias ya vistas del perfil activo. */
export function setCuriosidadesVistas(
  state: ProgressState,
  vistas: string[],
): ProgressState {
  const perfilId = state.perfilActivo;
  if (!perfilId) return state;
  const actual = state.porPerfil[perfilId];
  if (!actual) return state;
  return {
    ...state,
    porPerfil: {
      ...state.porPerfil,
      [perfilId]: { ...actual, viaje: { ...actual.viaje, curiosidadesVistas: vistas } },
    },
  };
}

/**
 * Restaura (o añade) un perfil y su progreso desde una copia de seguridad
 * importada manualmente. Los datos se sanean igual que al cargar desde
 * localStorage, así que una copia parcialmente corrupta o de una versión
 * antigua de la app se recupera igual de bien. Si ya existe un perfil con
 * el mismo id se sobrescribe (recuperación); si no, se añade como nuevo.
 * El resto de perfiles guardados no se toca.
 *
 * Nunca lanza (igual que el resto de funciones de este módulo que
 * transforman ProgressState): si el perfil de la copia no trae un `id`
 * válido se le asigna uno nuevo, en vez de descartar la restauración.
 */
export function restoreFromBackup(
  state: ProgressState,
  rawProfile: unknown,
  rawProgress: unknown,
): ProgressState {
  const perfil = hydrateProfile(rawProfile) ?? hydrateProfile({ ...Object(rawProfile), id: crypto.randomUUID() })!;
  const progreso = hydratePerfilProgress(rawProgress);
  const yaExiste = state.perfiles.some((p) => p.id === perfil.id);
  const perfiles = yaExiste
    ? state.perfiles.map((p) => (p.id === perfil.id ? perfil : p))
    : [...state.perfiles, perfil];
  return {
    ...state,
    perfiles,
    perfilActivo: perfil.id,
    porPerfil: { ...state.porPerfil, [perfil.id]: progreso },
  };
}

/** Devuelve el progreso del perfil activo (o uno vacío si no hay perfil). */
export function getActiveProgress(state: ProgressState): PerPerfilProgress {
  if (!state.perfilActivo) return emptyPerfilProgress();
  return state.porPerfil[state.perfilActivo] ?? emptyPerfilProgress();
}

/** Resetea el tiempo invertido hoy si ha cambiado el día. */
export function rolloverDay(progress: PerPerfilProgress): PerPerfilProgress {
  const hoy = FECHA_HOY();
  if (progress.fechaHoy === hoy) return progress;
  return { ...progress, fechaHoy: hoy, tiempoHoyS: 0 };
}

export function recordActivity(
  state: ProgressState,
  activity: Activity,
  acierto: boolean,
  intentos: number,
  tiempoInvertidoS: number,
): ProgressState {
  const perfilId = state.perfilActivo;
  if (!perfilId) return state;
  const actual = rolloverDay(state.porPerfil[perfilId] ?? emptyPerfilProgress());

  // Los retos especiales son de una sola vez: si ya se superaron con éxito,
  // no se registra nada más (ni XP, ni intentos), sea cual sea la vía por la
  // que se hayan vuelto a intentar. Red de seguridad además del filtro del
  // planificador de sesión (session.ts) y del bloqueo en la pantalla de Retos.
  if (activity.esReto && actual.actividadesCompletadas[activity.id]?.acierto === true) {
    return { ...state, porPerfil: { ...state.porPerfil, [perfilId]: actual } };
  }

  const hoy = FECHA_HOY();
  // Solo el acierto otorga XP. Los fallos no penalizan pero tampoco premian:
  // la actividad sigue disponible para repetir sin cuarentena (ver session.ts).
  const xpGanado = acierto ? activity.xp : 0;

  const yaCompletada = actual.actividadesCompletadas[activity.id];
  const completada: CompletedActivity = {
    fecha: hoy,
    acierto,
    intentos: (yaCompletada?.intentos ?? 0) + intentos,
    xpGanado: (yaCompletada?.xpGanado ?? 0) + xpGanado,
  };

  // Racha: si la última actividad fue ayer, +1. Si fue hoy, igual. Si no, reset a 1.
  const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let racha = actual.rachaDias;
  if (actual.ultimaActividadFecha === hoy) {
    // ya contaba para hoy
  } else if (actual.ultimaActividadFecha === ayer || actual.ultimaActividadFecha === null) {
    racha = (actual.rachaDias || 0) + 1;
  } else {
    racha = 1;
  }

  const nuevoXpTotal = actual.xpTotal + xpGanado;

  const nuevoProgreso: PerPerfilProgress = {
    ...actual,
    xpTotal: nuevoXpTotal,
    rachaDias: racha,
    ultimaActividadFecha: hoy,
    actividadesCompletadas: { ...actual.actividadesCompletadas, [activity.id]: completada },
    tiempoHoyS: actual.tiempoHoyS + tiempoInvertidoS,
    // Recalculado siempre desde el nivel actual: así el guardarropa nunca se
    // desincroniza del XP real (mismo patrón que estrellas/sellos del viaje).
    piezasAvatarDesbloqueadas: idsPiezasDesbloqueadas(nivelDeXP(nuevoXpTotal).nivel),
  };

  return { ...state, porPerfil: { ...state.porPerfil, [perfilId]: nuevoProgreso } };
}

/** Calcula el nivel (1, 2, 3, …) a partir del XP total. */
export function nivelDeXP(xp: number): { nivel: number; siguienteEn: number; progreso: number } {
  // Curva suave: nivel n requiere 100 * n * (n+1) / 2 XP
  let n = 1;
  while ((100 * n * (n + 1)) / 2 <= xp) n++;
  const previo = (100 * (n - 1) * n) / 2;
  const siguiente = (100 * n * (n + 1)) / 2;
  return {
    nivel: n,
    siguienteEn: siguiente - xp,
    progreso: (xp - previo) / (siguiente - previo),
  };
}
