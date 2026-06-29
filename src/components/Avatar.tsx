import type { AvatarConfig } from '@/types';

interface Props {
  config: AvatarConfig;
  size?: number;
}

/**
 * Avatar modular en SVG. Las piezas son simples placeholders para empezar;
 * la idea es que se vayan desbloqueando más opciones con XP.
 */
export function Avatar({ config, size = 64 }: Props) {
  const fondoColor = fondoColores[config.fondo] ?? '#EAE4D7';
  const ropaColor = ropaColores[config.ropa] ?? '#2E5C7E';
  const peloColor = peloColores[config.pelo] ?? '#3A2A1F';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Avatar"
      className="rounded-full overflow-hidden shadow-card"
    >
      <rect width="64" height="64" fill={fondoColor} />
      {/* Cabeza */}
      <circle cx="32" cy="28" r="12" fill="#F2C7A8" />
      {/* Pelo */}
      <path d="M20 24 Q32 8 44 24 L44 28 Q32 18 20 28 Z" fill={peloColor} />
      {/* Ojos */}
      <circle cx="28" cy="29" r="1.5" fill="#0F2027" />
      <circle cx="36" cy="29" r="1.5" fill="#0F2027" />
      {/* Sonrisa */}
      <path d="M28 34 Q32 37 36 34" stroke="#0F2027" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Ropa */}
      <path d="M16 64 Q16 48 32 46 Q48 48 48 64 Z" fill={ropaColor} />
      {/* Accesorio (opcional) */}
      {config.accesorio === 'gafas' && (
        <g stroke="#0F2027" strokeWidth="1.2" fill="none">
          <circle cx="28" cy="29" r="3" />
          <circle cx="36" cy="29" r="3" />
          <line x1="31" y1="29" x2="33" y2="29" />
        </g>
      )}
    </svg>
  );
}

const fondoColores: Record<string, string> = {
  arena: '#EAE4D7',
  cielo: '#CDE3EE',
  bosque: '#D6E3D2',
  atardecer: '#F4D5C0',
};
const ropaColores: Record<string, string> = {
  azul: '#2E5C7E',
  cobre: '#B85C38',
  salvia: '#6B9080',
  mostaza: '#D7A330',
};
const peloColores: Record<string, string> = {
  oscuro: '#3A2A1F',
  rubio: '#C9A35B',
  pelirrojo: '#B85C38',
  blanco: '#E8E5DE',
};

export const AVATAR_OPCIONES = {
  pelo: Object.keys(peloColores),
  ropa: Object.keys(ropaColores),
  fondo: Object.keys(fondoColores),
  accesorio: ['ninguno', 'gafas'],
} as const;

export function avatarPorDefecto(): AvatarConfig {
  return { base: 'explorer-1', pelo: 'oscuro', ropa: 'azul', fondo: 'arena' };
}
