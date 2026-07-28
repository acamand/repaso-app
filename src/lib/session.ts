import type { Activity, DailySession, Nivel, PerPerfilProgress } from '@/types';
import { loadAllActivities } from './content';
import { nivelDeXP } from './progress';
import { retoDesbloqueado } from './retos';
import { loadEtapaActivitiesByNivel } from './ruta';

const LIMITE_DIARIO_S = 60 * 60;
const OBJETIVO_NORMAL_S = 25 * 60;
const COOLDOWN_DIAS = 3;
const SESION_OBJETIVO = 5;
/** Cuántas actividades de la etapa actual intentar meter por sesión (tras el calentamiento). */
const SLOTS_ETAPA = 2;

export async function buildDailySession(
  nivel: Nivel,
  progress: PerPerfilProgress,
): Promise<DailySession> {
  const etapaActualId = progress.viaje.etapaActualId;
  const [mates, lengua, viajeEtapa] = await Promise.all([
    loadAllActivities(nivel, 'matematicas').catch(() => []),
    loadAllActivities(nivel, 'lengua').catch(() => []),
    loadEtapaActivitiesByNivel(etapaActualId, nivel).catch(() => []),
  ]);

  const todas = [...mates, ...lengua, ...viajeEtapa];

  // `retos-especiales.json` está listado como una unidad más dentro del
  // índice curricular de cada materia (para que `loadRetos` no sea la única
  // vía de acceso), así que `mates`/`lengua` ya incluyen TODOS los retos de
  // TODOS los niveles, sin filtrar. Aquí se filtran dos cosas antes de
  // calcular `eligible`, para que ni siquiera el fallback a "todas" (cuando
  // todo lo demás está en cuarentena) pueda reintroducirlas:
  //  - Retos ya superados con éxito: son de una sola vez, se excluyen para
  //    siempre.
  //  - Retos cuyo `nivel_desbloqueo` el alumno todavía no ha alcanzado: sin
  //    este filtro, un reto pensado para mucho más adelante podía colarse en
  //    la sesión diaria normal (la pantalla de Retos si aplica bien este
  //    filtro, pero es solo una vía secundaria; la sesión diaria es la
  //    principal).
  const nivelActual = nivelDeXP(progress.xpTotal).nivel;
  const sinRetosSuperados = todas.filter((a) => {
    const reg = progress.actividadesCompletadas[a.id];
    if (a.esReto && reg?.acierto === true) return false;
    if (a.esReto && !retoDesbloqueado(a, nivelActual)) return false;
    return true;
  });

  const hoy = new Date().toISOString().slice(0, 10);
  const limiteCooldown = isoMinusDays(hoy, COOLDOWN_DIAS);

  const eligible = sinRetosSuperados.filter((a) => {
    const reg = progress.actividadesCompletadas[a.id];
    if (!reg) return true;
    // Las actividades falladas vuelven al pool sin esperar; solo las acertadas
    // entran en la cuarentena de COOLDOWN_DIAS para evitar memorización.
    if (!reg.acierto) return true;
    return reg.fecha < limiteCooldown;
  });

  const pool = eligible.length > 0 ? eligible : sinRetosSuperados;

  const seed = hashStr(hoy + ':' + nivel + ':' + etapaActualId);
  const sample = shuffle(pool, seed);

  // Cada sesión se dimensiona a OBJETIVO_NORMAL_S (25 min), pero sin superar
  // lo que quede hasta el límite diario duro (60 min). OJO: no restar aquí
  // directamente `progress.tiempoHoyS` a OBJETIVO_NORMAL_S — tiempoHoyS es un
  // acumulado de TODO el día (tiempo real de reloj, no la suma de
  // tiempo_estimado_s), así que tras una sola sesión ya puede superar los 25
  // min aunque quede mucho margen hasta el límite duro; eso dejaba
  // presupuestoTotal en 0 y la sesión completamente vacía en cuanto se pedía
  // una segunda sesión el mismo día, bloqueando la app aunque hubiera
  // cientos de actividades disponibles.
  const restanteHastaLimiteDiario = Math.max(0, LIMITE_DIARIO_S - progress.tiempoHoyS);
  const presupuestoTotal = Math.min(OBJETIVO_NORMAL_S, restanteHastaLimiteDiario);
  const seleccion: Activity[] = [];
  let presupuesto = presupuestoTotal;

  // 1. Calentamiento (cualquier materia o etapa).
  const calentamiento = sample.find((a) => a.dificultad === 1 && a.formato === 'digital');
  if (calentamiento && calentamiento.tiempo_estimado_s <= presupuesto) {
    seleccion.push(calentamiento);
    presupuesto -= calentamiento.tiempo_estimado_s;
  }

  // 2. Hasta SLOTS_ETAPA actividades de la etapa actual, justo después.
  const etapaIds = new Set(viajeEtapa.map((a) => a.id));
  let viajeSlots = 0;
  for (const a of sample) {
    if (viajeSlots >= SLOTS_ETAPA) break;
    if (seleccion.includes(a)) continue;
    if (!etapaIds.has(a.id)) continue;
    if (a.tiempo_estimado_s > presupuesto) continue;
    seleccion.push(a);
    presupuesto -= a.tiempo_estimado_s;
    viajeSlots++;
  }

  // 3. Resto, alternando materias.
  const restantes = sample.filter((a) => !seleccion.includes(a));
  let ultimaMateria: string | null = seleccion[seleccion.length - 1]?.materia ?? null;

  while (seleccion.length < SESION_OBJETIVO && presupuesto > 0 && restantes.length > 0) {
    let idx = restantes.findIndex(
      (a) => a.materia !== ultimaMateria && a.tiempo_estimado_s <= presupuesto,
    );
    if (idx === -1) {
      idx = restantes.findIndex((a) => a.tiempo_estimado_s <= presupuesto);
    }
    if (idx === -1) break;
    const elegida = restantes.splice(idx, 1)[0];
    seleccion.push(elegida);
    presupuesto -= elegida.tiempo_estimado_s;
    ultimaMateria = elegida.materia;
  }

  const duracionEstimadaS = seleccion.reduce((acc, a) => acc + a.tiempo_estimado_s, 0);
  return { fecha: hoy, actividades: seleccion, duracionEstimadaS };
}

export function tiempoRestanteHoyS(progress: PerPerfilProgress): number {
  return Math.max(0, LIMITE_DIARIO_S - progress.tiempoHoyS);
}

export function alcanzadoLimiteDiario(progress: PerPerfilProgress): boolean {
  return progress.tiempoHoyS >= LIMITE_DIARIO_S;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isoMinusDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
