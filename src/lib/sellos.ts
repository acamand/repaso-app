import type {
  Capitulo,
  CompletedActivity,
  Nivel,
  Sello,
  ViajeProgress,
} from '@/types';
import { listaEtapasEnOrden, loadCapitulo, loadEtapaActivities, loadRuta } from './ruta';

const FECHA_HOY = () => new Date().toISOString().slice(0, 10);

export interface EtapaInfo {
  /** etapaId -> ids de las actividades de esa etapa (de ambos niveles) */
  activityIds: Record<string, string[]>;
  /** etapaId -> criterio de completado del capítulo de la etapa */
  criterios: Record<string, Capitulo['completado_criterio']>;
  /** etapaId -> cuántas actividades temáticas existen para esa etapa, por nivel. */
  totalPorNivel: Record<string, Record<Nivel, number>>;
}

/**
 * Carga una vez todo lo necesario para evaluar sellos: por cada etapa, sus
 * actividades y el criterio del capítulo. Degrada a vacío si algo falla.
 */
export async function loadEtapaInfo(): Promise<EtapaInfo> {
  const ruta = await loadRuta();
  if (!ruta) return { activityIds: {}, criterios: {}, totalPorNivel: {} };
  const etapas = listaEtapasEnOrden(ruta);
  const [actividades, capitulos] = await Promise.all([
    Promise.all(etapas.map((e) => loadEtapaActivities(e.id))),
    Promise.all(etapas.map((e) => loadCapitulo(e.id))),
  ]);
  const activityIds: Record<string, string[]> = {};
  const criterios: Record<string, Capitulo['completado_criterio']> = {};
  const totalPorNivel: Record<string, Record<Nivel, number>> = {};
  etapas.forEach((e, i) => {
    activityIds[e.id] = actividades[i].map((a) => a.id);
    const cap = capitulos[i];
    if (cap) criterios[e.id] = cap.completado_criterio;
    const porNivel: Record<Nivel, number> = { '5-primaria': 0, '1-eso': 0 };
    for (const a of actividades[i]) porNivel[a.nivel] += 1;
    totalPorNivel[e.id] = porNivel;
  });
  return { activityIds, criterios, totalPorNivel };
}

export interface ProgresoSello {
  /** Actividades de la etapa ya intentadas (acierto o fallo), tope en `objetivo`. */
  completadas: number;
  /** `completado_criterio.valor` de esa etapa. */
  objetivo: number;
  /** Actividades temáticas totales que existen para esa etapa y nivel (puede ser mayor que `objetivo`). */
  total: number;
}

/**
 * Progreso del alumno hacia el sello de una etapa. `null` si el criterio no
 * es por número de actividades (p.ej. `siempre`, en cuyo caso el sello se
 * otorga al ver la llegada y no hay nada que mostrar como progreso) o si no
 * hay datos de esa etapa todavía. Usa el mismo criterio de recuento
 * (cualquier actividad intentada, acierto o fallo) que `evaluarSellos`, para
 * que lo que se muestra en pantalla coincida siempre con cuándo se otorga
 * realmente el sello. `total` da el panorama completo (cuántas actividades
 * especiales tiene el país), no solo el objetivo mínimo, para que el alumno
 * entienda el terreno completo y no solo un número parcial.
 */
export function progresoSello(
  etapaId: string,
  nivel: Nivel,
  actividadesCompletadas: Record<string, CompletedActivity>,
  etapaInfo: EtapaInfo,
): ProgresoSello | null {
  const criterio = etapaInfo.criterios[etapaId];
  if (!criterio || criterio.tipo !== 'actividades_etapa_min') return null;
  const ids = etapaInfo.activityIds[etapaId] ?? [];
  const completadas = ids.reduce((acc, id) => acc + (actividadesCompletadas[id] ? 1 : 0), 0);
  const total = etapaInfo.totalPorNivel[etapaId]?.[nivel] ?? ids.length;
  return { completadas: Math.min(completadas, criterio.valor), objetivo: criterio.valor, total };
}

/**
 * Mensaje para etapas con criterio `siempre`: el sello no depende de
 * completar actividades, solo de seleccionar esa etapa como actual y ver su
 * pantalla de llegada. Sin este aviso, esas etapas se quedaban "mudas" en
 * las pantallas de progreso (nada que contar, pero tampoco ninguna
 * explicación), lo que podía hacer que un alumno avanzado se las saltara
 * sin darse cuenta al ir cambiando de etapa en el desplegable.
 */
export function mensajeSelloSiempre(pais: string): string {
  return `Este sello se consigue solo con visitar el país: selecciona ${pais} como tu etapa actual en el inicio y entra en su pantalla de bienvenida. ¡No hace falta hacer actividades para conseguirlo!`;
}

/**
 * Otorga sello a las etapas cuyo criterio `actividades_etapa_min` se cumple.
 * Los criterios `siempre` los gestiona `marcarCapituloVisto` al ver la llegada.
 * Devuelve el viaje original sin tocar si no hay sellos nuevos.
 */
export function evaluarSellos(
  viaje: ViajeProgress,
  actividadesCompletadas: Record<string, CompletedActivity>,
  etapaInfo: EtapaInfo,
): ViajeProgress {
  const nuevos: Record<string, Sello> = { ...viaje.sellos };
  const hoy = FECHA_HOY();
  let cambio = false;

  for (const [etapaId, criterio] of Object.entries(etapaInfo.criterios)) {
    if (nuevos[etapaId]) continue;
    if (criterio.tipo !== 'actividades_etapa_min') continue;
    const ids = etapaInfo.activityIds[etapaId] ?? [];
    const completadasEtapa = ids.reduce(
      (acc, id) => acc + (actividadesCompletadas[id] ? 1 : 0),
      0,
    );
    if (completadasEtapa >= criterio.valor) {
      nuevos[etapaId] = { fecha: hoy };
      cambio = true;
    }
  }

  return cambio ? { ...viaje, sellos: nuevos } : viaje;
}

/**
 * Calcula las estrellas (1-3) de cada etapa con sello, según el % de aciertos
 * entre las actividades de esa etapa que el alumno ha intentado:
 *   1 estrella  = tiene el sello (completó las actividades mínimas)
 *   2 estrellas = más del 70% de aciertos
 *   3 estrellas = más del 90% de aciertos
 * Las estrellas nunca bajan (se guarda la mejor marca), para no penalizar al
 * intentar actividades nuevas. Devuelve el viaje sin tocar si no hay cambios.
 */
export function calcularEstrellas(
  viaje: ViajeProgress,
  actividadesCompletadas: Record<string, CompletedActivity>,
  etapaInfo: EtapaInfo,
): ViajeProgress {
  const nuevas: Record<string, number> = { ...viaje.estrellas };
  let cambio = false;

  for (const etapaId of Object.keys(viaje.sellos)) {
    const ids = etapaInfo.activityIds[etapaId] ?? [];
    const intentadas = ids.filter((id) => actividadesCompletadas[id]);
    let estrellas = 1; // tener el sello ya vale una estrella
    if (intentadas.length > 0) {
      const aciertos = intentadas.filter(
        (id) => actividadesCompletadas[id].acierto === true,
      ).length;
      const pct = aciertos / intentadas.length;
      if (pct > 0.9) estrellas = 3;
      else if (pct > 0.7) estrellas = 2;
    }
    const mejor = Math.max(nuevas[etapaId] ?? 0, estrellas);
    if (nuevas[etapaId] !== mejor) {
      nuevas[etapaId] = mejor;
      cambio = true;
    }
  }

  return cambio ? { ...viaje, estrellas: nuevas } : viaje;
}

/**
 * Marca un capítulo como visto. Si el criterio es `siempre`, otorga el sello
 * en el acto (útil para etapas-travesía sin actividades, como ferries).
 */
export function marcarCapituloVisto(
  viaje: ViajeProgress,
  etapaId: string,
  criterio: Capitulo['completado_criterio'],
): ViajeProgress {
  let next = viaje;
  if (!viaje.capitulosVistos.includes(etapaId)) {
    next = { ...next, capitulosVistos: [...viaje.capitulosVistos, etapaId] };
  }
  if (criterio.tipo === 'siempre' && !viaje.sellos[etapaId]) {
    next = {
      ...next,
      sellos: { ...next.sellos, [etapaId]: { fecha: FECHA_HOY() } },
    };
  }
  return next;
}
