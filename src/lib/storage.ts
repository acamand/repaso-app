// Wrapper sencillo sobre localStorage con manejo de errores y serialización JSON.
//
// La clave NUNCA debe cambiar: es donde vive el progreso real de los alumnos.
// El versionado de la estructura guardada se gestiona dentro del propio JSON
// (campo `version`, ver progress.ts), no cambiando esta clave.
const KEY = 'repaso-app:v1';

/**
 * Lee el JSON guardado sin asumir su forma. Úsalo junto con una función de
 * migración/saneado (ver `migrarEstado` en progress.ts) antes de tratarlo
 * como un ProgressState válido: un dato guardado con una estructura antigua
 * (o parcialmente corrupto) sigue siendo JSON válido, solo que con campos de
 * más o de menos, así que nunca debe descartarse solo por eso.
 */
export function readRaw(): unknown {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('No se pudo leer el estado guardado (JSON corrupto):', err);
    return null;
  }
}

export function writeState<T>(state: T): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('No se pudo guardar el estado:', err);
  }
}

export function resetState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    console.warn('No se pudo resetear el estado:', err);
  }
}
