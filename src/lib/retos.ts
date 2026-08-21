import type { Activity } from '@/types';

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
 * ¿Este reto ya está disponible? El reto final del viaje
 * (`desbloqueo_pasaporte_completo`) ignora el nivel por completo y se rige
 * solo por si el pasaporte está completo; el resto sigue la regla habitual
 * de nivel mínimo.
 */
export function retoDesbloqueado(
  reto: Activity,
  nivelActual: number,
  pasaporteCompleto: boolean,
): boolean {
  if (reto.desbloqueo_pasaporte_completo) return pasaporteCompleto;
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
