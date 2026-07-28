/**
 * Interpreta un número escrito por el alumno admitiendo tanto la notación
 * española (punto de millares, coma decimal: "20.000", "3,5") como la
 * notación simple sin separadores ("20000", "3.5"). Sin esto, `parseFloat`
 * interpreta cualquier punto como separador decimal y "20.000" se lee como
 * 20 en vez de 20000.
 */
export function parseNumeroEs(input: string): number {
  let s = input.trim();
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    // Con los dos presentes, el que aparece más a la derecha es el decimal.
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Solo coma: convención española, es el separador decimal.
    s = s.replace(',', '.');
  } else if (hasDot) {
    // Solo punto(s): si el grupo antes del primer punto no es "0" (ni vacío)
    // y el último grupo tiene exactamente 3 dígitos, es notación de
    // millares ("20.000", "1.234.567") y se quitan los puntos. Si no
    // (p.ej. "3.5" o "0.917"), se trata como separador decimal normal.
    const partes = s.split('.');
    const primero = partes[0];
    const ultimo = partes[partes.length - 1];
    const esNotacionDeMillares =
      partes.length > 1 && ultimo.length === 3 && primero !== '' && primero !== '0';
    if (esNotacionDeMillares) {
      s = s.replace(/\./g, '');
    }
  }

  return parseFloat(s);
}
