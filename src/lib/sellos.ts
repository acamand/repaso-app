import type {
  Capitulo,
  CompletedActivity,
  Sello,
  ViajeProgress,
} from '@/types';
import { listaEtapasEnOrden, loadCapitulo, loadEtapaActivities, loadRuta } from './ruta';

const FECHA_HOY = () => new Date().toISOString().slice(0, 10);

export interface EtapaInfo {
  /** etapaId -> ids de las actividades de esa etapa */
  activityIds: Record<string, string[]>;
  /** etapaId -> criterio de completado del capítulo de la etapa */
  criterios: Record<string, Capitulo['completado_criterio']>;
}

/**
 * Carga una vez todo lo necesario para evaluar sellos: por cada etapa, sus
 * actividades y el criterio del capítulo. Degrada a vacío si algo falla.
 */
export async function loadEtapaInfo(): Promise<EtapaInfo> {
  const ruta = await loadRuta();
  if (!ruta) return { activityIds: {}, criterios: {} };
  const etapas = listaEtapasEnOrden(ruta);
  const [actividades, capitulos] = await Promise.all([
    Promise.all(etapas.map((e) => loadEtapaActivities(e.id))),
    Promise.all(etapas.map((e) => loadCapitulo(e.id))),
  ]);
  const activityIds: Record<string, string[]> = {};
  const criterios: Record<string, Capitulo['completado_criterio']> = {};
  etapas.forEach((e, i) => {
    activityIds[e.id] = actividades[i].map((a) => a.id);
    const cap = capitulos[i];
    if (cap) criterios[e.id] = cap.completado_criterio;
  });
  return { activityIds, criterios };
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
