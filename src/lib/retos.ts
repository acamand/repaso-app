import type { Activity, CompletedActivity } from '@/types';

/** Título legible de un reto: la primera línea del enunciado, sin el emoji. */
export function tituloReto(a: Activity): string {
  const primera = a.enunciado.split('\n')[0].trim();
  return primera.replace(/^🏆\s*/, '');
}

/** Nivel del alumno requerido para desbloquear un reto (1 si no se especifica). */
export function nivelDesbloqueoReto(reto: Activity): number {
  return reto.nivel_desbloqueo ?? 1;
}

/**
 * ¿Ha completado el alumno con éxito TODOS los Retos del Camino normales de
 * su nivel (los que se desbloquean por nivel de FP), sin contar el propio
 * Gran Reto Final? Es la mitad "retos" del criterio de desbloqueo del Gran
 * Reto Final: culminación real de todos los retos, no un camino aparte.
 */
export function todosLosRetosCompletados(
  retos: Activity[],
  actividadesCompletadas: Record<string, CompletedActivity>,
): boolean {
  const normales = retos.filter((r) => r.esReto && !r.desbloqueo_pasaporte_completo);
  return normales.length > 0 && normales.every((r) => actividadesCompletadas[r.id]?.acierto === true);
}

/**
 * ¿Este reto ya está disponible? El reto final del viaje
 * (`desbloqueo_pasaporte_completo`) ignora el nivel por completo: hacen
 * falta a la vez el pasaporte completo Y haber superado ya todos los demás
 * Retos del Camino (`todosLosRetosCompletados`). El resto de retos sigue la
 * regla habitual de nivel mínimo.
 */
export function retoDesbloqueado(
  reto: Activity,
  nivelActual: number,
  pasaporteCompleto: boolean,
  todosRetosCompletados: boolean,
): boolean {
  if (reto.desbloqueo_pasaporte_completo) return pasaporteCompleto && todosRetosCompletados;
  return nivelDesbloqueoReto(reto) <= nivelActual;
}

/** Retos que se desbloquean exactamente al pasar de `nivelAnterior` a `nivelNuevo`. */
export function retosNuevosEntreNiveles(
  retos: Activity[],
  nivelAnterior: number,
  nivelNuevo: number,
): Activity[] {
  if (nivelNuevo <= nivelAnterior) return [];
  return retos.filter((r) => {
    const n = nivelDesbloqueoReto(r);
    return n > nivelAnterior && n <= nivelNuevo;
  });
}
