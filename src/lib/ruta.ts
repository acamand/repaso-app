import type { Activity, Capitulo, DatosPais, Etapa, Nivel, Ruta } from '@/types';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

function url(path: string): string {
  return `${base}/content/${path}`;
}

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(url(path));
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** ID de la primera etapa del viaje. Usado para inicializar el viaje de un perfil nuevo. */
export const PRIMERA_ETAPA_ID = 'espana-ida';

export async function loadRuta(): Promise<Ruta | null> {
  return fetchJSON<Ruta>('viaje-2026/_ruta.json');
}

export async function loadCapitulo(etapaId: string): Promise<Capitulo | null> {
  return fetchJSON<Capitulo>(`viaje-2026/${etapaId}/capitulo.json`);
}

interface EtapaIndex {
  unidades: Array<{ archivo: string }>;
}

/** Actividades de una etapa (todas, sin filtrar por nivel). Vacío si la etapa no tiene contenido aún. */
export async function loadEtapaActivities(etapaId: string): Promise<Activity[]> {
  const idx = await fetchJSON<EtapaIndex>(`viaje-2026/${etapaId}/_index.json`);
  if (!idx) return [];
  const arrays = await Promise.all(
    idx.unidades.map(async (u) => {
      const arr = await fetchJSON<Activity[]>(`viaje-2026/${etapaId}/${u.archivo}`);
      return arr ?? [];
    }),
  );
  return arrays.flat();
}

export async function loadEtapaActivitiesByNivel(
  etapaId: string,
  nivel: Nivel,
): Promise<Activity[]> {
  const all = await loadEtapaActivities(etapaId);
  return all.filter((a) => a.nivel === nivel);
}

/** Recorre todas las etapas de la ruta y concatena sus actividades. */
export async function loadAllViajeActivities(): Promise<Activity[]> {
  const ruta = await loadRuta();
  if (!ruta) return [];
  const etapas = listaEtapasEnOrden(ruta);
  const arrays = await Promise.all(etapas.map((e) => loadEtapaActivities(e.id)));
  return arrays.flat();
}

/** Etapas en orden, aplanando todas las fases. */
export function listaEtapasEnOrden(ruta: Ruta): Etapa[] {
  return ruta.fases.flatMap((f) => f.etapas);
}

export function getEtapa(ruta: Ruta, etapaId: string): Etapa | null {
  for (const fase of ruta.fases) {
    const etapa = fase.etapas.find((e) => e.id === etapaId);
    if (etapa) return etapa;
  }
  return null;
}

export function getDatosPais(ruta: Ruta, pais: string): DatosPais | null {
  return ruta.datos_paises[pais] ?? null;
}
