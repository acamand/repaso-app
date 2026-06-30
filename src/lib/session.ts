import type { Activity, DailySession, Nivel, PerPerfilProgress } from '@/types';
import { loadAllActivities, loadAllViajeActivities } from './content';

const LIMITE_DIARIO_S = 60 * 60;
const OBJETIVO_NORMAL_S = 25 * 60;
const COOLDOWN_DIAS = 3;
const SESION_OBJETIVO = 5;

export async function buildDailySession(
  nivel: Nivel,
  progress: PerPerfilProgress,
): Promise<DailySession> {
  const [mates, lengua, viaje] = await Promise.all([
    loadAllActivities(nivel, 'matematicas').catch(() => []),
    loadAllActivities(nivel, 'lengua').catch(() => []),
    loadAllViajeActivities().catch(() => []),
  ]);

  const viajeNivel = viaje.filter((a) => a.nivel === nivel);
  const todas = [...mates, ...lengua, ...viajeNivel];

  const hoy = new Date().toISOString().slice(0, 10);
  const limiteCooldown = isoMinusDays(hoy, COOLDOWN_DIAS);

  const eligible = todas.filter((a) => {
    const reg = progress.actividadesCompletadas[a.id];
    if (!reg) return true;
    return reg.fecha < limiteCooldown;
  });

  const pool = eligible.length > 0 ? eligible : todas;

  const seed = hashStr(hoy + ':' + nivel);
  const sample = shuffle(pool, seed);

  const presupuestoTotal = Math.max(0, OBJETIVO_NORMAL_S - progress.tiempoHoyS);
  const seleccion: Activity[] = [];
  let presupuesto = presupuestoTotal;

  const calentamiento = sample.find((a) => a.dificultad === 1 && a.formato === 'digital');
  if (calentamiento && calentamiento.tiempo_estimado_s <= presupuesto) {
    seleccion.push(calentamiento);
    presupuesto -= calentamiento.tiempo_estimado_s;
  }

  const restantes = sample.filter((a) => !seleccion.includes(a));
  let ultimaMateria: string | null = seleccion[0]?.materia ?? null;

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
