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

/**
 * Carga los «Retos del camino» de un nivel (de ambas materias). Degrada a []
 * si el archivo aún no existe en el banco.
 */
export async function loadRetos(nivel: Nivel): Promise<Activity[]> {
  const materias: Materia[] = ['lengua', 'matematicas'];
  const arrays = await Promise.all(
    materias.map(async (m) => {
      try {
        return await loadUnidad(nivel, m, 'retos-especiales.json');
      } catch {
        return [];
      }
    }),
  );
  return arrays.flat();
}
