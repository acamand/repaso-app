/**
 * Icono representativo de un sello a partir de la descripción del diseño en
 * capitulo.json (p.ej. "Lago finlandés con sauna de madera..." -> 🧖). No hay
 * ilustraciones propias por país, así que esto es lo que da carácter visual
 * distinto a cada sello sin necesitar assets nuevos. Reglas en orden de
 * prioridad: la primera que coincide gana, así que los elementos más
 * distintivos/protagonistas de cada descripción van primero y los términos
 * genéricos de fondo (bosque, lago, mar) van al final.
 */
const REGLAS: Array<[RegExp, string]> = [
  [/torre eiffel/i, '🗼'],
  [/torre de gediminas|torres? medievales/i, '🏯'],
  [/puerta de brandeburgo/i, '🏛️'],
  [/castillo/i, '🏰'],
  [/mezquita|catedral/i, '🕌'],
  [/gato negro/i, '🐈‍⬛'],
  [/bisonte/i, '🦬'],
  [/alce/i, '🦌'],
  [/ciclista|tour de francia/i, '🚴'],
  [/bicicleta/i, '🚲'],
  [/patatas fritas/i, '🍟'],
  [/gofre/i, '🧇'],
  [/pretzel/i, '🥨'],
  [/baguette/i, '🥖'],
  [/bal[oó]n de baloncesto|baloncesto/i, '🏀'],
  [/ferry/i, '⛴️'],
  [/globo terr[aá]queo/i, '🌐'],
  [/sauna/i, '🧖'],
  [/wifi/i, '📶'],
  [/engranaje|industrial/i, '⚙️'],
  [/autocaravana/i, '🚐'],
  [/bandera de meta/i, '🏁'],
  [/sol de medianoche/i, '☀️'],
  [/molino/i, '🌬️'],
  [/art nouveau|fachada/i, '🏛️'],
  [/lago/i, '🏞️'],
  [/bosque/i, '🌲'],
  [/mar b[aá]ltico|b[aá]ltico/i, '🌊'],
];

/** Icono de repuesto cuando el diseño aún no está definido en el contenido. */
const ICONO_PENDIENTE = '📍';

export function iconoSello(descripcion: string): string {
  if (!descripcion || descripcion.trim().toUpperCase() === 'PENDIENTE') return ICONO_PENDIENTE;
  const regla = REGLAS.find(([regex]) => regex.test(descripcion));
  return regla ? regla[1] : ICONO_PENDIENTE;
}

/** Texto de la descripción listo para mostrar al alumno (nunca el literal "PENDIENTE"). */
export function descripcionSelloVisible(descripcion: string): string | null {
  if (!descripcion || descripcion.trim().toUpperCase() === 'PENDIENTE') return null;
  return descripcion;
}
