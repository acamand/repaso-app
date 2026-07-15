import type { AvatarConfig } from '@/types';

export function avatarPorDefecto(): AvatarConfig {
  return { base: 'explorer-1', pelo: 'oscuro', ropa: 'azul', fondo: 'arena', accesorio: 'ninguno' };
}

export type CategoriaPieza = 'pelo' | 'ropa' | 'fondo' | 'accesorio';

export interface PiezaAvatar {
  categoria: CategoriaPieza;
  /** Valor que se guarda en AvatarConfig (p.ej. 'coleta', 'chaleco'). */
  valor: string;
  /** Nombre legible para el guardarropa y las celebraciones. */
  nombre: string;
  /** Nivel en el que se desbloquea. 1 = disponible desde el principio. */
  nivel: number;
}

/**
 * Catálogo completo de piezas de avatar. Las de nivel 1 están disponibles
 * desde el principio; el resto se desbloquea al alcanzar ese nivel exacto.
 * Coherente con los hitos de `NIVELES` en niveles.ts: los tres hitos de tipo
 * avatar-* (2, 5, 10) desbloquean exactamente la pieza «estrella» de esa
 * categoría, y algunos hitos de reto/título traen una pieza extra de regalo.
 */
export const PIEZAS_AVATAR: PiezaAvatar[] = [
  // --- Pelo ---
  { categoria: 'pelo', valor: 'oscuro', nombre: 'Moreno', nivel: 1 },
  { categoria: 'pelo', valor: 'rubio', nombre: 'Rubio', nivel: 1 },
  { categoria: 'pelo', valor: 'pelirrojo', nombre: 'Pelirrojo', nivel: 1 },
  { categoria: 'pelo', valor: 'coleta', nombre: 'Coleta aventurera', nivel: 2 },

  // --- Ropa ---
  { categoria: 'ropa', valor: 'azul', nombre: 'Camiseta azul', nivel: 1 },
  { categoria: 'ropa', valor: 'cobre', nombre: 'Camiseta cobre', nivel: 1 },
  { categoria: 'ropa', valor: 'salvia', nombre: 'Camiseta salvia', nivel: 1 },
  { categoria: 'ropa', valor: 'mostaza', nombre: 'Camiseta mostaza', nivel: 1 },
  { categoria: 'ropa', valor: 'chaleco', nombre: 'Chaleco explorador', nivel: 5 },

  // --- Fondo ---
  { categoria: 'fondo', valor: 'arena', nombre: 'Arena', nivel: 1 },
  { categoria: 'fondo', valor: 'cielo', nombre: 'Cielo', nivel: 1 },
  { categoria: 'fondo', valor: 'bosque', nombre: 'Bosque', nivel: 3 },
  { categoria: 'fondo', valor: 'montana', nombre: 'Montaña', nivel: 3 },
  { categoria: 'fondo', valor: 'atardecer', nombre: 'Atardecer', nivel: 8 },
  { categoria: 'fondo', valor: 'ciudad', nombre: 'Ciudad', nivel: 8 },
  { categoria: 'fondo', valor: 'aurora', nombre: 'Aurora boreal', nivel: 15 },

  // --- Accesorio ---
  { categoria: 'accesorio', valor: 'ninguno', nombre: 'Sin accesorio', nivel: 1 },
  { categoria: 'accesorio', valor: 'gorro', nombre: 'Gorro', nivel: 1 },
  { categoria: 'accesorio', valor: 'bufanda', nombre: 'Bufanda', nivel: 1 },
  { categoria: 'accesorio', valor: 'gafas', nombre: 'Gafas de explorador', nivel: 10 },
  { categoria: 'accesorio', valor: 'mochila', nombre: 'Mochila viajera', nivel: 15 },
];

/** Todas las piezas ya desbloqueadas para un nivel dado (incluye las de inicio). */
export function piezasDesbloqueadas(nivel: number): PiezaAvatar[] {
  return PIEZAS_AVATAR.filter((p) => p.nivel <= nivel);
}

/** Piezas que se desbloquean exactamente AL alcanzar ese nivel (para celebraciones). */
export function piezasEnNivel(nivel: number): PiezaAvatar[] {
  return PIEZAS_AVATAR.filter((p) => p.nivel === nivel);
}

/** Piezas nuevas al pasar de `nivelAnterior` a `nivelNuevo` (ambos inclusive del rango intermedio). */
export function piezasNuevasEntreNiveles(nivelAnterior: number, nivelNuevo: number): PiezaAvatar[] {
  if (nivelNuevo <= nivelAnterior) return [];
  return PIEZAS_AVATAR.filter((p) => p.nivel > nivelAnterior && p.nivel <= nivelNuevo);
}

/** IDs `categoria:valor` de las piezas desbloqueadas a un nivel dado (para persistir en el progreso). */
export function idsPiezasDesbloqueadas(nivel: number): string[] {
  return piezasDesbloqueadas(nivel).map((p) => `${p.categoria}:${p.valor}`);
}

export function idPieza(categoria: CategoriaPieza, valor: string): string {
  return `${categoria}:${valor}`;
}

/** ¿Está desbloqueada esta pieza según la lista persistida de IDs? */
export function estaDesbloqueada(
  desbloqueadas: string[],
  categoria: CategoriaPieza,
  valor: string,
): boolean {
  return desbloqueadas.includes(idPieza(categoria, valor));
}

export function buscarPieza(categoria: CategoriaPieza, valor: string): PiezaAvatar | undefined {
  return PIEZAS_AVATAR.find((p) => p.categoria === categoria && p.valor === valor);
}

/** Aplica una pieza a una configuración de avatar existente. */
export function aplicarPieza(config: AvatarConfig, pieza: PiezaAvatar): AvatarConfig {
  return { ...config, [pieza.categoria]: pieza.valor };
}
