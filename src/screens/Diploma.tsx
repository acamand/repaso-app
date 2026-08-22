import { useRef, useState } from 'react';
import type { PerPerfilProgress, Profile, Ruta } from '@/types';
import { estadoNivel } from '@/lib/niveles';
import { paisesDistintosRuta } from '@/lib/ruta';
import { DiplomaContenido } from '@/components/DiplomaContenido';
import type { DatosDiploma } from '@/components/DiplomaContenido';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface Props {
  profile: Profile;
  progress: PerPerfilProgress;
  ruta: Ruta | null;
  onBack: () => void;
}

function fechaBonita(): string {
  return new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Nombre de archivo seguro: sin acentos ni espacios, para que descargue bien en cualquier sistema. */
function nombreArchivo(nombre: string, extension: string): string {
  const normalizado = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `diploma-gran-explorador-${normalizado || 'viajero'}.${extension}`;
}

/**
 * Diplomas ilustrados a mano para Marco y Marta (agosto 2026): si el nombre
 * del perfil coincide, se usan estas im\u00e1genes en vez del dise\u00f1o generado
 * din\u00e1micamente. Cualquier otro nombre (u otro perfil futuro) cae al dise\u00f1o
 * din\u00e1mico de `DiplomaContenido` como respaldo.
 */
const IMAGEN_POR_NOMBRE: Record<string, string> = {
  marco: `${BASE}/diplomas/diploma-marco.png`,
  marta: `${BASE}/diplomas/diploma-marta.png`,
};

function imagenDiplomaPara(nombre: string): string | null {
  return IMAGEN_POR_NOMBRE[nombre.trim().toLowerCase()] ?? null;
}

export function Diploma({ profile, progress, ruta, onBack }: Props) {
  const contenidoRef = useRef<HTMLDivElement>(null);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imagenSrc = imagenDiplomaPara(profile.nombre);

  const datos: DatosDiploma = {
    nombre: profile.nombre,
    // 12 países en la ruta actual; se calcula por si la ruta cambiara.
    paises: ruta ? paisesDistintosRuta(ruta) : 12,
    nivelNombre: estadoNivel(progress.xpTotal).nombre,
    fp: progress.xpTotal,
    fecha: fechaBonita(),
  };

  const descargarPDF = async () => {
    if (!contenidoRef.current) return;
    setGenerando(true);
    setError(null);
    try {
      // Carga diferida: jsPDF + html2canvas solo pesan cuando de verdad se
      // descarga el diploma, no en el bundle principal de la app.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(contenidoRef.current, {
        scale: 3,
        backgroundColor: '#F5F2EC',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');

      // Apaisado o vertical según salga más ajustado el contenido capturado
      // de verdad (depende del ancho de pantalla en el momento y de si el
      // nombre es largo), en vez de asumir uno fijo.
      const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
      const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margen = 8;
      const ratio = Math.min(
        (pageW - margen * 2) / canvas.width,
        (pageH - margen * 2) / canvas.height,
      );
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      doc.addImage(imgData, 'PNG', (pageW - w) / 2, (pageH - h) / 2, w, h);
      doc.save(nombreArchivo(profile.nombre, 'pdf'));
    } catch (e) {
      setError('No se pudo generar el PDF. Inténtalo de nuevo.');
      console.error('Error generando el diploma en PDF:', e);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-paper-700 hover:text-ink shrink-0">
            ← Volver
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-copper">Colofón del viaje</div>
            <div className="font-display text-lg leading-tight truncate">Tu diploma</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {imagenSrc ? (
          <img
            src={imagenSrc}
            alt={`Diploma de Gran Explorador/a de ${profile.nombre}`}
            className="w-full rounded-lg shadow-lg border border-paper-300/60"
          />
        ) : (
          <DiplomaContenido ref={contenidoRef} datos={datos} />
        )}

        {error && <p className="text-brick text-sm text-center">{error}</p>}

        {imagenSrc ? (
          <a href={imagenSrc} download={nombreArchivo(profile.nombre, 'png')} className="btn-primary w-full block text-center">
            Descargar diploma 📄
          </a>
        ) : (
          <button onClick={descargarPDF} disabled={generando} className="btn-primary w-full">
            {generando ? 'Generando PDF…' : 'Descargar diploma en PDF 📄'}
          </button>
        )}
      </main>
    </div>
  );
}
