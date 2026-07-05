import { nivelDeXP } from './progress';

export type RecompensaTipo =
  | 'inicio'
  | 'avatar-pelo'
  | 'avatar-ropa'
  | 'avatar-accesorio'
  | 'reto'
  | 'titulo';

export interface NivelDef {
  /** Nivel numérico en el que se alcanza este hito. */
  nivel: number;
  /** Nombre temático del nivel. */
  nombre: string;
  /** Qué desbloquea (texto corto para mostrar). */
  desbloquea: string;
  tipo: RecompensaTipo;
}

/**
 * Hitos con nombre. Entre dos hitos, el nivel conserva el nombre del hito
 * inferior (p.ej. niveles 3 y 4 son ambos "Navegante").
 * Los retos especiales aún no están implementados: solo se anuncian aquí.
 */
export const NIVELES: NivelDef[] = [
  { nivel: 1, nombre: 'Viajero novato', desbloquea: 'El comienzo de la aventura', tipo: 'inicio' },
  { nivel: 2, nombre: 'Copiloto', desbloquea: 'Nueva pieza de avatar: un peinado nuevo', tipo: 'avatar-pelo' },
  { nivel: 3, nombre: 'Navegante', desbloquea: 'Tu primer reto especial', tipo: 'reto' },
  { nivel: 5, nombre: 'Explorador', desbloquea: 'Nueva pieza de avatar: ropa nueva', tipo: 'avatar-ropa' },
  { nivel: 7, nombre: 'Aventurero', desbloquea: 'Reto especial del país en el que estás', tipo: 'reto' },
  { nivel: 10, nombre: 'Expedicionario', desbloquea: 'Nueva pieza de avatar: un accesorio', tipo: 'avatar-accesorio' },
  { nivel: 15, nombre: 'Maestro viajero', desbloquea: 'Título especial en tu perfil', tipo: 'titulo' },
];

/** XP total necesario para alcanzar el nivel numérico `n` (coincide con nivelDeXP). */
export function xpParaNivel(n: number): number {
  return (100 * (n - 1) * n) / 2;
}

/** Hito temático vigente para un nivel numérico: el hito más alto cuyo nivel <= n. */
export function hitoDeNivel(n: number): NivelDef {
  let hito = NIVELES[0];
  for (const m of NIVELES) if (m.nivel <= n) hito = m;
  return hito;
}

/** Nombre temático del nivel `n`. */
export function nombreDeNivel(n: number): string {
  return hitoDeNivel(n).nombre;
}

/** Siguiente hito con nombre por encima del nivel `n` (o null si ya es el máximo). */
export function siguienteHito(n: number): NivelDef | null {
  return NIVELES.find((m) => m.nivel > n) ?? null;
}

export interface EstadoNivel {
  nivel: number;
  nombre: string;
  xp: number;
  /** Siguiente hito temático a conseguir (o null si ya es Maestro viajero). */
  hito: NivelDef | null;
  /** XP que faltan para alcanzar el siguiente hito. */
  xpHastaHito: number;
  /** Progreso 0..1 desde el hito actual hasta el siguiente hito. */
  progresoHito: number;
}

/** Progreso hacia un hito concreto (para las tarjetas de Mis Logros). */
export function progresoHaciaHito(
  xp: number,
  hito: NivelDef,
): { alcanzado: boolean; faltan: number; progreso: number } {
  const objetivo = xpParaNivel(hito.nivel);
  const alcanzado = xp >= objetivo;
  const idx = NIVELES.findIndex((m) => m.nivel === hito.nivel);
  const base = idx > 0 ? xpParaNivel(NIVELES[idx - 1].nivel) : 0;
  const faltan = Math.max(0, objetivo - xp);
  const progreso = objetivo > base ? Math.max(0, Math.min(1, (xp - base) / (objetivo - base))) : 1;
  return { alcanzado, faltan, progreso };
}

/** Hitos recién alcanzados al pasar de `oldXp` a `newXp` (para la celebración). */
export function hitosNuevos(oldXp: number, newXp: number): NivelDef[] {
  return NIVELES.filter((m) => {
    const t = xpParaNivel(m.nivel);
    return t > oldXp && t <= newXp;
  });
}

/** Estado de nivel listo para pintar en Home y en Mis Logros. */
export function estadoNivel(xp: number): EstadoNivel {
  const { nivel } = nivelDeXP(xp);
  const nombre = nombreDeNivel(nivel);
  const hito = siguienteHito(nivel);
  if (!hito) {
    return { nivel, nombre, xp, hito: null, xpHastaHito: 0, progresoHito: 1 };
  }
  const base = xpParaNivel(hitoDeNivel(nivel).nivel);
  const objetivo = xpParaNivel(hito.nivel);
  const xpHastaHito = Math.max(0, objetivo - xp);
  const progresoHito = objetivo > base ? Math.max(0, Math.min(1, (xp - base) / (objetivo - base))) : 1;
  return { nivel, nombre, xp, hito, xpHastaHito, progresoHito };
}
