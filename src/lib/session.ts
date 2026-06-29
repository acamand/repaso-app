import type { Activity, DailySession, Nivel, PerPerfilProgress } from '@/types';
import { loadAllActivities } from './content';

const LIMITE_DIARIO_S = 60 * 60; // 1 hora absoluta
const OBJETIVO_NORMAL_S = 25 * 60; // sesión normal apuntada a ~25 min

/**
 * Construye la sesión del día:
 *  1. Calentamiento — 1 actividad corta (dificultad 1)
 *  2. Actividad del día — 1 actividad nueva o de la unidad actual
 *  3. Repaso — 2-3 actividades de saberes ya tocados (mezcla digital y cuaderno)
 *  4. Bonus opcional — 1 actividad extra si aún queda tiempo
 *
 *  Nunca propone más actividades cuando el alumno ya ha invertido `LIMITE_DIARIO_S` hoy.
 */
export async function buildDailySession(
  nivel: Nivel,
  progress: PerPerfilProgress,
): Promise<DailySession> {
  const mates = await loadAllActivities(nivel, 'matematicas').catch(() => []);
  const lengua = await loadAllActivities(nivel, 'lengua').catch(() => []);
  const todas = [...mates, ...lengua];

  const completadas = new Set(Object.keys(progress.actividadesCompletadas));
  const tiempoYaInvertidoHoy = progress.tiempoHoyS;
  const presupuesto = Math.max(0, OBJETIVO_NORMAL_S - tiempoYaInvertidoHoy);

  const nuevas = todas.filter((a) => !completadas.has(a.id));
  const yaHechas = todas.filter((a) => completadas.has(a.id));

  // Semilla determinista por fecha + perfil para que la sesión sea estable durante el día.
  const seed = hash(new Date().toISOString().slice(0, 10));
  const sample = pickN(nuevas, seed);
  const repaso = pickN(yaHechas, seed + 1);

  const seleccion: Activity[] = [];
  let presupuestoRestante = presupuesto;

  // 1. Calentamiento
  const calentamiento = sample.find((a) => a.dificultad === 1 && a.formato === 'digital');
  if (calentamiento) {
    seleccion.push(calentamiento);
    presupuestoRestante -= calentamiento.tiempo_estimado_s;
  }

  // 2. Actividad del día
  const delDia = sample.find((a) => !seleccion.includes(a));
  if (delDia && presupuestoRestante >= delDia.tiempo_estimado_s) {
    seleccion.push(delDia);
    presupuestoRestante -= delDia.tiempo_estimado_s;
  }

  // 3. Repaso (2-3)
  for (const a of repaso) {
    if (seleccion.length >= 5) break;
    if (presupuestoRestante < a.tiempo_estimado_s) break;
    if (seleccion.includes(a)) continue;
    seleccion.push(a);
    presupuestoRestante -= a.tiempo_estimado_s;
  }

  // Si no hay repaso suficiente (alumno nuevo), rellenar con más actividades nuevas.
  if (seleccion.length < 4) {
    for (const a of sample) {
      if (seleccion.length >= 5) break;
      if (presupuestoRestante < a.tiempo_estimado_s) break;
      if (seleccion.includes(a)) continue;
      seleccion.push(a);
      presupuestoRestante -= a.tiempo_estimado_s;
    }
  }

  const duracionEstimadaS = seleccion.reduce((acc, a) => acc + a.tiempo_estimado_s, 0);
  return { fecha: new Date().toISOString().slice(0, 10), actividades: seleccion, duracionEstimadaS };
}

export function tiempoRestanteHoyS(progress: PerPerfilProgress): number {
  return Math.max(0, LIMITE_DIARIO_S - progress.tiempoHoyS);
}

export function alcanzadoLimiteDiario(progress: PerPerfilProgress): boolean {
  return progress.tiempoHoyS >= LIMITE_DIARIO_S;
}

// ----- Utilidades -----

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickN<T>(arr: T[], seed: number): T[] {
  // Barajado pseudo-aleatorio determinista.
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
