interface Props {
  quien: 'marco' | 'marta';
  size?: number;
  className?: string;
}

/**
 * Retratos SVG planos de los dos guías del viaje.
 * Marco: veterano con sombrero de explorador y barba. Marta: joven con coleta.
 */
export function Personaje({ quien, size = 96, className = '' }: Props) {
  return quien === 'marco' ? (
    <Marco size={size} className={className} />
  ) : (
    <Marta size={size} className={className} />
  );
}

function Marco({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className} role="img" aria-label="Marco">
      <circle cx="48" cy="48" r="48" fill="#EAE4D7" />
      {/* cuello */}
      <rect x="40" y="60" width="16" height="12" fill="#E0A985" />
      {/* camisa exploradora */}
      <path d="M26 96 Q26 70 48 68 Q70 70 70 96 Z" fill="#6B9080" />
      <path d="M48 68 L48 96" stroke="#5A7A6C" strokeWidth="1.5" />
      {/* cara */}
      <circle cx="48" cy="46" r="18" fill="#F2C7A8" />
      {/* barba */}
      <path d="M32 48 Q48 74 64 48 Q60 62 48 64 Q36 62 32 48 Z" fill="#8A7355" />
      {/* ojos */}
      <circle cx="42" cy="45" r="2" fill="#0F2027" />
      <circle cx="54" cy="45" r="2" fill="#0F2027" />
      {/* sonrisa */}
      <path d="M42 54 Q48 58 54 54" stroke="#0F2027" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* sombrero de explorador */}
      <path d="M26 34 Q48 28 70 34 Q72 37 68 38 L28 38 Q24 37 26 34 Z" fill="#B85C38" />
      <path d="M33 34 Q33 22 48 22 Q63 22 63 34 Z" fill="#B85C38" />
      <rect x="33" y="31" width="30" height="4" fill="#8A4327" />
    </svg>
  );
}

function Marta({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className} role="img" aria-label="Marta">
      <circle cx="48" cy="48" r="48" fill="#EAE4D7" />
      {/* cuello */}
      <rect x="41" y="60" width="14" height="12" fill="#E0A985" />
      {/* camiseta */}
      <path d="M26 96 Q26 70 48 68 Q70 70 70 96 Z" fill="#2E5C7E" />
      {/* coletas */}
      <circle cx="28" cy="44" r="9" fill="#6B4A2F" />
      <circle cx="68" cy="44" r="9" fill="#6B4A2F" />
      {/* pelo */}
      <path d="M28 44 Q28 24 48 24 Q68 24 68 44 Q68 34 48 34 Q28 34 28 44 Z" fill="#6B4A2F" />
      {/* cara */}
      <circle cx="48" cy="46" r="17" fill="#F2C7A8" />
      {/* flequillo */}
      <path d="M31 40 Q40 30 48 30 Q56 30 65 40 Q56 36 48 36 Q40 36 31 40 Z" fill="#6B4A2F" />
      {/* ojos */}
      <circle cx="42" cy="46" r="2" fill="#0F2027" />
      <circle cx="54" cy="46" r="2" fill="#0F2027" />
      {/* mejillas */}
      <circle cx="39" cy="52" r="2.5" fill="#E9A28E" opacity="0.6" />
      <circle cx="57" cy="52" r="2.5" fill="#E9A28E" opacity="0.6" />
      {/* sonrisa */}
      <path d="M42 54 Q48 59 54 54" stroke="#0F2027" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
