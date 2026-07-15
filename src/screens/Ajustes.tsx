import { useRef, useState } from 'react';
import type { PerPerfilProgress, Profile } from '@/types';
import { codificarBackup, crearBackup, decodificarBackup, nombreArchivoBackup } from '@/lib/backup';

interface Props {
  profile: Profile;
  progress: PerPerfilProgress;
  onRestore: (rawProfile: unknown, rawProgress: unknown) => void;
  onBack: () => void;
}

export function Ajustes({ profile, progress, onRestore, onBack }: Props) {
  const [codigoPegado, setCodigoPegado] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const codigoActual = codificarBackup(crearBackup(profile, progress));

  const descargarArchivo = () => {
    const backup = crearBackup(profile, progress);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivoBackup(profile);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigoActual);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo copiar automáticamente. Selecciona el texto y cópialo a mano.' });
    }
  };

  const procesarTexto = (texto: string) => {
    try {
      const backup = decodificarBackup(texto);
      onRestore(backup.profile, backup.progress);
      setMensaje({ tipo: 'ok', texto: `Progreso de "${backup.profile.nombre ?? 'tu explorador'}" restaurado correctamente.` });
      setCodigoPegado('');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err instanceof Error ? err.message : 'No se pudo restaurar esa copia.' });
    }
  };

  const restaurarDesdeArchivo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') procesarTexto(reader.result);
    };
    reader.onerror = () => setMensaje({ tipo: 'error', texto: 'No se pudo leer el archivo.' });
    reader.readAsText(file);
  };

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-paper-700 hover:text-ink shrink-0">
            ← Volver
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-copper">Ajustes</div>
            <div className="font-display text-lg leading-tight truncate">Copia de seguridad</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <p className="text-sm text-paper-700">
          El progreso de <strong>{profile.nombre}</strong> se guarda en este dispositivo. Como red de
          seguridad, puedes guardar una copia y restaurarla si algo saliera mal.
        </p>

        <section className="card p-5 space-y-3">
          <h2 className="font-display text-xl">Guardar copia de mi progreso</h2>
          <button onClick={descargarArchivo} className="btn-primary w-full">
            Descargar archivo de copia
          </button>
          <div>
            <p className="text-xs text-paper-700 mb-1.5">O copia este código y guárdalo en un sitio seguro:</p>
            <textarea
              readOnly
              value={codigoActual}
              onFocus={(e) => e.currentTarget.select()}
              rows={4}
              className="w-full p-2.5 text-xs font-mono border border-paper-300 rounded-soft bg-parchment2
                         resize-none focus:outline-none focus:border-slate"
            />
            <button onClick={copiarCodigo} className="btn-secondary w-full mt-2 text-sm py-2">
              {copiado ? '✓ Copiado' : 'Copiar código'}
            </button>
          </div>
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="font-display text-xl">Restaurar progreso</h2>
          <p className="text-xs text-paper-700">
            Sube un archivo de copia o pega el código. Sobrescribe el progreso de ese explorador con lo
            guardado en la copia.
          </p>
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary w-full text-sm py-2">
            Subir archivo de copia
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json,text/plain"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) restaurarDesdeArchivo(file);
              e.target.value = '';
            }}
          />
          <textarea
            value={codigoPegado}
            onChange={(e) => setCodigoPegado(e.target.value)}
            placeholder="Pega aquí el código de la copia…"
            rows={4}
            className="w-full p-2.5 text-xs font-mono border border-paper-300 rounded-soft bg-white
                       resize-none focus:outline-none focus:border-slate focus:ring-2 focus:ring-slate/30"
          />
          <button
            onClick={() => procesarTexto(codigoPegado)}
            disabled={!codigoPegado.trim()}
            className="btn-primary w-full"
          >
            Restaurar desde código
          </button>
        </section>

        {mensaje && (
          <div
            className={`p-3 rounded-soft border text-sm ${
              mensaje.tipo === 'ok'
                ? 'bg-sage/15 border-sage/40 text-ink'
                : 'bg-brick/10 border-brick/40 text-brick'
            }`}
          >
            {mensaje.texto}
          </div>
        )}
      </main>
    </div>
  );
}
