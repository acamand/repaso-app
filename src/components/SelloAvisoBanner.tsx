interface Props {
  colorFondo: string;
  colorTexto: string;
  icono: string;
  titulo: string;
  detalle?: string;
}

/**
 * Aviso muy visible (banda de color, no un icono discreto) de que la
 * actividad actual cuenta para el sello de un país. Se usa en dos momentos
 * dentro de la sesión: antes de resolver (para que el alumno sepa que es
 * especial) y justo tras comprobar el resultado (para reforzar cuánto le
 * queda), con el mismo estilo llamativo para que sea imposible pasarla por
 * alto aunque el alumno vaya directo a resolver sin pararse a leer.
 */
export function SelloAvisoBanner({ colorFondo, colorTexto, icono, titulo, detalle }: Props) {
  return (
    <div
      className="rounded-soft px-4 py-3 mb-3 flex items-start gap-2.5 shadow-card"
      style={{ backgroundColor: colorFondo, color: colorTexto }}
    >
      <span className="text-xl leading-none shrink-0" aria-hidden>
        {icono}
      </span>
      <div className="text-sm leading-snug">
        <p className="font-semibold">{titulo}</p>
        {detalle && <p className="opacity-90 mt-0.5">{detalle}</p>}
      </div>
    </div>
  );
}
