interface Props {
  /** Número de estrellas conseguidas (0-3). */
  conseguidas: number;
  total?: number;
  /** Tamaño en px de cada estrella. */
  size?: number;
  className?: string;
}

/** Fila de estrellas: las conseguidas en dorado, las demás como contorno vacío. */
export function Estrellas({ conseguidas, total = 3, size = 16, className = '' }: Props) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      aria-label={`${conseguidas} de ${total} estrellas`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <Estrella key={i} llena={i < conseguidas} size={size} />
      ))}
    </div>
  );
}

function Estrella({ llena, size }: { llena: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={llena ? '#F2C14E' : 'none'}
      stroke={llena ? '#F2C14E' : '#A89F8C'}
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.05 1.1-6.47L2.6 9.35l6.5-.95L12 2.5z" />
    </svg>
  );
}
