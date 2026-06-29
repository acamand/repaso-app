import type {
  Activity,
  CompletedActivity,
  PerPerfilProgress,
  Profile,
  ProgressState,
} from '@/types';
import { readState, writeState } from './storage';

const FECHA_HOY = () => new Date().toISOString().slice(0, 10);

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
  };
}

function emptyState(): ProgressState {
  return { perfiles: [], perfilActivo: null, porPerfil: {} };
}

export function loadProgress(): ProgressState {
  return readState<ProgressState>(emptyState());
}

export function saveProgress(state: ProgressState): void {
  writeState(state);
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

  const hoy = FECHA_HOY();
  const xpGanado = acierto ? activity.xp : Math.floor(activity.xp / 2);

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

  const nuevoProgreso: PerPerfilProgress = {
    ...actual,
    xpTotal: actual.xpTotal + xpGanado,
    rachaDias: racha,
    ultimaActividadFecha: hoy,
    actividadesCompletadas: { ...actual.actividadesCompletadas, [activity.id]: completada },
    tiempoHoyS: actual.tiempoHoyS + tiempoInvertidoS,
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
