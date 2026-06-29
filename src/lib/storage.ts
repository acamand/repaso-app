// Wrapper sencillo sobre localStorage con manejo de errores y serialización JSON.

const KEY = 'repaso-app:v1';

export function readState<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('No se pudo leer el estado guardado:', err);
    return fallback;
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
