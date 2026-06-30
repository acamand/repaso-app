interface Props {
  /** Código ISO alpha-2 del país (ES, FR, …) o "BAL" para travesía marítima. */
  codigo: string;
  className?: string;
}

// Banderas sencillas: franjas de color + cruces nórdicas, sin escudos.
// ViewBox 60x40 (proporción 3:2) — la mayoría son aproximaciones visuales suficientes.
export function Flag({ codigo, className = '' }: Props) {
  const cn = `inline-block ${className}`;
  switch (codigo) {
    case 'ES':
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de España">
          <rect width="60" height="10" fill="#AA151B" />
          <rect y="10" width="60" height="20" fill="#F1BF00" />
          <rect y="30" width="60" height="10" fill="#AA151B" />
        </svg>
      );
    case 'FR':
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Francia">
          <rect width="20" height="40" fill="#0055A4" />
          <rect x="20" width="20" height="40" fill="#FFFFFF" />
          <rect x="40" width="20" height="40" fill="#EF4135" />
        </svg>
      );
    case 'BE':
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Bélgica">
          <rect width="20" height="40" fill="#000000" />
          <rect x="20" width="20" height="40" fill="#FAE042" />
          <rect x="40" width="20" height="40" fill="#ED2939" />
        </svg>
      );
    case 'NL':
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Países Bajos">
          <rect width="60" height="13.33" fill="#AE1C28" />
          <rect y="13.33" width="60" height="13.34" fill="#FFFFFF" />
          <rect y="26.67" width="60" height="13.33" fill="#21468B" />
        </svg>
      );
    case 'DE':
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Alemania">
          <rect width="60" height="13.33" fill="#000000" />
          <rect y="13.33" width="60" height="13.34" fill="#DD0000" />
          <rect y="26.67" width="60" height="13.33" fill="#FFCE00" />
        </svg>
      );
    case 'PL':
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Polonia">
          <rect width="60" height="20" fill="#FFFFFF" stroke="#D9D2C2" strokeWidth="0.3" />
          <rect y="20" width="60" height="20" fill="#DC143C" />
        </svg>
      );
    case 'LT':
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Lituania">
          <rect width="60" height="13.33" fill="#FDB913" />
          <rect y="13.33" width="60" height="13.34" fill="#006A44" />
          <rect y="26.67" width="60" height="13.33" fill="#C1272D" />
        </svg>
      );
    case 'LV':
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Letonia">
          <rect width="60" height="16" fill="#9E1B32" />
          <rect y="16" width="60" height="8" fill="#FFFFFF" />
          <rect y="24" width="60" height="16" fill="#9E1B32" />
        </svg>
      );
    case 'EE':
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Estonia">
          <rect width="60" height="13.33" fill="#0072CE" />
          <rect y="13.33" width="60" height="13.34" fill="#000000" />
          <rect y="26.67" width="60" height="13.33" fill="#FFFFFF" stroke="#D9D2C2" strokeWidth="0.3" />
        </svg>
      );
    case 'FI':
      // Cruz nórdica azul sobre blanco (desplazada al palo).
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Finlandia">
          <rect width="60" height="40" fill="#FFFFFF" stroke="#D9D2C2" strokeWidth="0.3" />
          <rect y="16" width="60" height="8" fill="#003580" />
          <rect x="18" width="8" height="40" fill="#003580" />
        </svg>
      );
    case 'NO':
      // Cruz nórdica azul con borde blanco sobre rojo.
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Noruega">
          <rect width="60" height="40" fill="#EF2B2D" />
          <rect y="14" width="60" height="12" fill="#FFFFFF" />
          <rect x="16" width="12" height="40" fill="#FFFFFF" />
          <rect y="17" width="60" height="6" fill="#002868" />
          <rect x="19" width="6" height="40" fill="#002868" />
        </svg>
      );
    case 'SE':
      // Cruz nórdica amarilla sobre azul.
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Suecia">
          <rect width="60" height="40" fill="#006AA7" />
          <rect y="16" width="60" height="8" fill="#FECC00" />
          <rect x="18" width="8" height="40" fill="#FECC00" />
        </svg>
      );
    case 'DK':
      // Cruz nórdica blanca sobre rojo.
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Bandera de Dinamarca">
          <rect width="60" height="40" fill="#C8102E" />
          <rect y="16" width="60" height="8" fill="#FFFFFF" />
          <rect x="18" width="8" height="40" fill="#FFFFFF" />
        </svg>
      );
    case 'BAL':
      // Travesía marítima: agua estilizada, sin texto.
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label="Travesía marítima">
          <rect width="60" height="40" fill="#9DBED1" />
          <path d="M0 22 Q15 16 30 22 T60 22 L60 40 L0 40 Z" fill="#3A6E8F" />
          <path d="M0 28 Q15 22 30 28 T60 28" stroke="#FFFFFF" strokeWidth="0.6" fill="none" opacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 60 40" className={cn} aria-label={codigo}>
          <rect width="60" height="40" fill="#EAE4D7" />
          <text x="30" y="25" textAnchor="middle" fontSize="14" fontFamily="serif" fill="#5C5546">
            {codigo}
          </text>
        </svg>
      );
  }
}
