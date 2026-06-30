import type { Activity, MateriaIndex, Materia, Nivel } from '@/types';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

function url(path: string): string {
  return `${base}/content/${path}`;
}

export async function loadMateriaIndex(nivel: Nivel, materia: Materia): Promise<MateriaIndex> {
  const res = await fetch(url(`${nivel}/${materia}/_index.json`));
  if (!res.ok) throw new Error(`No se pudo cargar el índice de ${nivel}/${materia}`);
  return res.json();
}

export async function loadUnidad(
  nivel: Nivel,
  materia: Materia,
  archivo: string,
): Promise<Activity[]> {
  const res = await fetch(url(`${nivel}/${materia}/${archivo}`));
  if (!res.ok) throw new Error(`No se pudo cargar ${archivo}`);
  return res.json();
}

export async function loadAllActivities(nivel: Nivel, materia: Materia): Promise<Activity[]> {
  const indice = await loadMateriaIndex(nivel, materia);
  const arrays = await Promise.all(
    indice.unidades.map((u) => loadUnidad(nivel, materia, u.archivo)),
  );
  return arrays.flat();
}

interface RutaViaje {
  fases?: Array<{ etapas?: Array<{ id: string }> }>;
}

interface EtapaIndex {
  unidades: Array<{ archivo: string }>;
}

async function loadJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(url(path));
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function listEtapas(): Promise<string[]> {
  const ruta = await loadJSON<RutaViaje>('viaje-2026/_ruta.json');
  if (!ruta?.fases) return [];
  const ids: string[] = [];
  for (const fase of ruta.fases) {
    for (const etapa of fase.etapas ?? []) {
      ids.push(etapa.id);
    }
  }
  return ids;
}

async function loadEtapa(etapaId: string): Promise<Activity[]> {
  const idx = await loadJSON<EtapaIndex>(`viaje-2026/${etapaId}/_index.json`);
  if (!idx) return [];
  const arrays = await Promise.all(
    idx.unidades.map(async (u) => {
      const arr = await loadJSON<Activity[]>(`viaje-2026/${etapaId}/${u.archivo}`);
      return arr ?? [];
    }),
  );
  return arrays.flat();
}

export async function loadAllViajeActivities(): Promise<Activity[]> {
  const etapas = await listEtapas();
  const arrays = await Promise.all(etapas.map(loadEtapa));
  return arrays.flat();
}
