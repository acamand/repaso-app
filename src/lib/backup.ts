import type { PerPerfilProgress, Profile } from '@/types';

const TIPO = 'park4learn-backup';

export interface BackupPayload {
  tipo: typeof TIPO;
  version: number;
  exportadoEn: string; // ISO
  profile: Profile;
  progress: PerPerfilProgress;
}

export function crearBackup(profile: Profile, progress: PerPerfilProgress): BackupPayload {
  return {
    tipo: TIPO,
    version: 1,
    exportadoEn: new Date().toISOString(),
    profile,
    progress,
  };
}

/** Codifica el backup como un único código de texto, fácil de copiar y pegar. */
export function codificarBackup(backup: BackupPayload): string {
  const json = JSON.stringify(backup);
  return btoa(unescape(encodeURIComponent(json)));
}

function esBackupValido(data: unknown): data is BackupPayload {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return d.tipo === TIPO && typeof d.profile === 'object' && d.profile !== null
    && typeof d.progress === 'object' && d.progress !== null;
}

/**
 * Interpreta un texto pegado o el contenido de un archivo subido: acepta
 * tanto el JSON en bruto (el archivo descargado se puede abrir y pegar tal
 * cual) como el código codificado en base64 (más robusto para copiar/pegar
 * a mano, ya que sobrevive a apps que "corrigen" comillas automáticamente).
 */
export function decodificarBackup(texto: string): BackupPayload {
  const limpio = texto.trim();
  if (!limpio) throw new Error('No hay ningún código o archivo que restaurar.');

  let data: unknown;
  try {
    data = JSON.parse(limpio);
  } catch {
    try {
      data = JSON.parse(decodeURIComponent(escape(atob(limpio))));
    } catch {
      throw new Error('Ese código o archivo no es una copia de progreso válida.');
    }
  }

  if (!esBackupValido(data)) {
    throw new Error('Ese código o archivo no es una copia de progreso válida.');
  }
  return data;
}

// Marcas diacríticas combinantes (acentos, tildes…) que quedan sueltas tras
// normalize('NFD'), rango Unicode U+0300–U+036F.
const MARCAS_DIACRITICAS = /[̀-ͯ]/g;

export function nombreArchivoBackup(profile: Profile): string {
  const sinAcentos = profile.nombre.trim().toLowerCase().normalize('NFD').replace(MARCAS_DIACRITICAS, '');
  const slug = sinAcentos.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'explorador';
  const fecha = new Date().toISOString().slice(0, 10);
  return `park4learn-${slug}-${fecha}.json`;
}
