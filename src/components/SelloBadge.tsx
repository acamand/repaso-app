import { iconoSello } from '@/lib/selloIcono';

interface Props {
  codigo: string;
  descripcion: string;
  colorFondo: string;
  colorTexto: string;
  /** Fecha ISO en que se consiguió, si ya está ganado (se muestra como matasellos). */
  fecha?: string;
  size?: number;
  className?: string;
}

/** Insignia con forma de sello de pasaporte: anillo de matasellos, icono según la descripción del diseño y código de país. */
export function SelloBadge({ codigo, descripcion, colorFondo, colorTexto, fecha, size = 80, className = '' }: Props) {
  const icono = iconoSello(descripcion);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 drop-shadow-md ${className}`}
      role="img"
      aria-label={descripcion}
    >
      <title>{descripcion}</title>
      <circle cx="50" cy="50" r="47" fill={colorFondo} stroke={colorTexto} strokeWidth="3" />
      <circle cx="50" cy="50" r="39" fill="none" stroke={colorTexto} strokeWidth="1.5" strokeDasharray="3 3.5" opacity="0.7" />
      <text x="50" y="46" textAnchor="middle" fontSize="26">
        {icono}
      </text>
      <text x="50" y={fecha ? '68' : '72'} textAnchor="middle" fontSize="15" fontWeight="700" fill={colorTexto}>
        {codigo}
      </text>
      {fecha && (
        <text x="50" y="82" textAnchor="middle" fontSize="8" fill={colorTexto} opacity="0.85" fontFamily="monospace">
          {formateaFecha(fecha)}
        </text>
      )}
    </svg>
  );
}

function formateaFecha(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}`;
}
