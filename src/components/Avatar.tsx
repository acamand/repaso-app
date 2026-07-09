import type { AvatarConfig } from '@/types';

interface Props {
  config: AvatarConfig;
  size?: number;
}

/**
 * Avatar modular en SVG. Cada parte (fondo, pelo, ropa, accesorio) se dibuja
 * según `config`; las piezas nuevas se desbloquean por nivel (ver
 * src/lib/avatarPiezas.ts) y se aplican aquí sin distinción — el componente
 * siempre pinta lo que haya en `config`, esté o no desbloqueado ahora mismo.
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
      <FondoDecoracion fondo={config.fondo} />

      {/* Bufanda / mochila se dibujan detrás del cuerpo para que asomen bien */}
      {config.accesorio === 'mochila' && (
        <g>
          <path d="M14 50 Q10 52 12 62 L18 62 Q16 54 20 50 Z" fill="#8A6A46" />
          <path d="M50 50 Q54 52 52 62 L46 62 Q48 54 44 50 Z" fill="#8A6A46" />
        </g>
      )}

      {/* Cabeza */}
      <circle cx="32" cy="28" r="12" fill="#F2C7A8" />

      {/* Pelo */}
      <PeloForma pelo={config.pelo} color={peloColor} />

      {/* Ojos */}
      <circle cx="28" cy="29" r="1.5" fill="#0F2027" />
      <circle cx="36" cy="29" r="1.5" fill="#0F2027" />
      {/* Sonrisa */}
      <path d="M28 34 Q32 37 36 34" stroke="#0F2027" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Ropa */}
      <RopaForma ropa={config.ropa} color={ropaColor} />

      {/* Bufanda por encima de la ropa, alrededor del cuello */}
      {config.accesorio === 'bufanda' && (
        <g>
          <path d="M22 43 Q32 49 42 43 L42 47 Q32 53 22 47 Z" fill="#C44545" />
          <rect x="19" y="46" width="5" height="11" rx="1.5" fill="#C44545" transform="rotate(-8 21 51)" />
        </g>
      )}

      {/* Gorro: se dibuja sobre el pelo, cubriendo la parte superior */}
      {config.accesorio === 'gorro' && (
        <g>
          <path d="M19 22 Q32 6 45 22 Q45 26 41 25 Q32 15 23 25 Q19 26 19 22 Z" fill="#6B9080" />
          <circle cx="32" cy="9" r="2.4" fill="#F5F2EC" />
        </g>
      )}

      {/* Gafas */}
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

function PeloForma({ pelo, color }: { pelo: string; color: string }) {
  if (pelo === 'coleta') {
    return (
      <g>
        <path d="M20 24 Q32 9 44 23 L44 26 Q32 18 20 26 Z" fill={color} />
        <path
          d="M43 21 Q52 23 49 33 Q47 37 44 34"
          fill={color}
        />
      </g>
    );
  }
  // Estilo por defecto (oscuro, rubio, pelirrojo): flequillo simple.
  return <path d="M20 24 Q32 8 44 24 L44 28 Q32 18 20 28 Z" fill={color} />;
}

function RopaForma({ ropa, color }: { ropa: string; color: string }) {
  if (ropa === 'chaleco') {
    return (
      <g>
        <path d="M16 64 Q16 48 32 46 Q48 48 48 64 Z" fill={color} />
        <line x1="32" y1="47" x2="32" y2="64" stroke="#00000030" strokeWidth="1.4" />
        <rect x="20" y="53" width="6" height="7" rx="1.3" fill="#00000022" />
        <rect x="38" y="53" width="6" height="7" rx="1.3" fill="#00000022" />
      </g>
    );
  }
  return <path d="M16 64 Q16 48 32 46 Q48 48 48 64 Z" fill={color} />;
}

function FondoDecoracion({ fondo }: { fondo: string }) {
  switch (fondo) {
    case 'bosque':
      return (
        <g fill="#5C8A5C">
          <path d="M6 64 L12 50 L18 64 Z" />
          <path d="M46 64 L53 48 L60 64 Z" />
        </g>
      );
    case 'montana':
      return (
        <g>
          <path d="M-2 64 L16 38 L30 58 L40 44 L60 64 Z" fill="#9B93B0" />
          <path d="M16 38 L21 46 L11 46 Z" fill="#F5F2EC" />
          <path d="M40 44 L44 50 L36 50 Z" fill="#F5F2EC" />
        </g>
      );
    case 'atardecer':
      return (
        <g>
          <circle cx="48" cy="16" r="9" fill="#F2C14E" opacity="0.9" />
          <rect x="0" y="50" width="64" height="14" fill="#B85C38" opacity="0.35" />
        </g>
      );
    case 'ciudad':
      return (
        <g fill="#8A8578">
          <rect x="4" y="42" width="10" height="22" />
          <rect x="16" y="34" width="10" height="30" />
          <rect x="38" y="40" width="10" height="24" />
          <rect x="50" y="30" width="10" height="34" />
        </g>
      );
    case 'aurora':
      return (
        <g strokeWidth="3" fill="none" opacity="0.8">
          <path d="M0 14 Q16 6 32 14 T64 14" stroke="#6B9080" />
          <path d="M0 22 Q16 14 32 22 T64 22" stroke="#4A8B8B" />
          <path d="M0 30 Q16 24 32 30 T64 30" stroke="#8A6FB0" />
          <circle cx="10" cy="8" r="0.8" fill="#F5F2EC" stroke="none" />
          <circle cx="50" cy="6" r="0.8" fill="#F5F2EC" stroke="none" />
          <circle cx="30" cy="4" r="0.8" fill="#F5F2EC" stroke="none" />
        </g>
      );
    default:
      return null;
  }
}

const fondoColores: Record<string, string> = {
  arena: '#EAE4D7',
  cielo: '#CDE3EE',
  bosque: '#D6E3D2',
  montana: '#C9C2D6',
  atardecer: '#F4D5C0',
  ciudad: '#D8D3C8',
  aurora: '#1B2A4A',
};
const ropaColores: Record<string, string> = {
  azul: '#2E5C7E',
  cobre: '#B85C38',
  salvia: '#6B9080',
  mostaza: '#D7A330',
  chaleco: '#8A9A5B',
};
const peloColores: Record<string, string> = {
  oscuro: '#3A2A1F',
  rubio: '#C9A35B',
  pelirrojo: '#B85C38',
  coleta: '#6B4A2F',
};

export const AVATAR_OPCIONES = {
  pelo: Object.keys(peloColores),
  ropa: Object.keys(ropaColores),
  fondo: Object.keys(fondoColores),
  accesorio: ['ninguno', 'gorro', 'bufanda', 'gafas', 'mochila'],
} as const;

export function avatarPorDefecto(): AvatarConfig {
  return { base: 'explorer-1', pelo: 'oscuro', ropa: 'azul', fondo: 'arena', accesorio: 'ninguno' };
}
