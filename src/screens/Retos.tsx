import { useEffect, useState } from 'react';
import type { Activity, Nivel } from '@/types';
import { loadRetos } from '@/lib/content';

interface Props {
  nivel: Nivel;
  onBack: () => void;
  onDoReto: (reto: Activity) => void;
}

const materiaLabel: Record<string, string> = {
  matematicas: 'Matemáticas',
  lengua: 'Lengua',
};

/** Título legible de un reto: la primera línea del enunciado, sin el emoji. */
function tituloReto(a: Activity): string {
  const primera = a.enunciado.split('\n')[0].trim();
  return primera.replace(/^🏆\s*/, '');
}

export function Retos({ nivel, onBack, onDoReto }: Props) {
  const [retos, setRetos] = useState<Activity[] | null>(null);

  useEffect(() => {
    loadRetos(nivel)
      .then(setRetos)
      .catch(() => setRetos([]));
  }, [nivel]);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-paper-700 hover:text-ink shrink-0">
            ← Volver
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-copper">Recompensas</div>
            <div className="font-display text-lg leading-tight truncate">Retos del camino</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <p className="text-sm text-paper-700">
          Las <em>Lecciones del Camino</em>: actividades especiales de Marco y Marta, más creativas y
          reflexivas. Se desbloquean al subir de nivel.
        </p>

        {retos === null && <p className="text-paper-700 text-center py-8">Cargando retos…</p>}

        {retos !== null && retos.length === 0 && (
          <div className="card p-5 text-sm text-paper-700">
            Aún no hay retos disponibles en el banco. ¡Vuelve pronto!
          </div>
        )}

        {retos?.map((reto) => (
          <button
            key={reto.id}
            onClick={() => onDoReto(reto)}
            className="card p-4 w-full text-left hover:ring-2 hover:ring-copper/40 transition"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0" aria-hidden>🏆</span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base leading-snug">{tituloReto(reto)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="chip-cuaderno">📓 {materiaLabel[reto.materia] ?? reto.materia}</span>
                  <span className="chip-xp">+{reto.xp} XP</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}
