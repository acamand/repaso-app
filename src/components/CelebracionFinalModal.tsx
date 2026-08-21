import type { Activity } from '@/types';
import { tituloReto } from '@/lib/retos';

interface Props {
  /** El reto final del viaje, si ya hay contenido cargado para el nivel del alumno. */
  retoFinal: Activity | null;
  onIrReto: () => void;
  onCerrar: () => void;
}

/**
 * Celebración especial al cumplirse a la vez las dos condiciones del Gran
 * Reto Final: pasaporte completo (todos los sellos obligatorios) Y todos
 * los demás Retos del Camino superados — más solemne/festiva que
 * `LevelUpModal` (subir de nivel es frecuente; esto pasa una sola vez, al
 * cierre del viaje).
 */
export function CelebracionFinalModal({ retoFinal, onIrReto, onCerrar }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
      <div className="card w-full max-w-sm p-7 text-center relative overflow-hidden shadow-xl border-2 border-mustard/60">
        <div
          className="absolute inset-x-0 top-0 h-36 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(242,193,78,0.5), transparent 70%)' }}
        />
        <div className="relative">
          <div className="text-5xl mb-2 xp-pop" aria-hidden>
            🎉🏆✨
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-copper">Aventura completa</div>
          <h2 className="font-display text-3xl mt-1">¡Lo habéis conseguido!</h2>
          <p className="text-sm text-paper-700 mt-3 leading-relaxed">
            Habéis sellado cada etapa obligatoria del viaje y superado todos los Retos del Camino.
            Marco y Marta tienen una última sorpresa para cerrar la aventura juntos.
          </p>

          {retoFinal && (
            <div className="mt-5 p-4 rounded-soft bg-white/60 border border-mustard/50 flex items-center gap-4 text-left">
              <span className="text-3xl shrink-0" aria-hidden>
                🏆
              </span>
              <div>
                <div className="text-[0.6rem] uppercase tracking-wider text-copper">
                  Gran Reto del Regreso a Casa
                </div>
                <div className="font-display text-lg leading-tight">{tituloReto(retoFinal)}</div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-2">
            {retoFinal ? (
              <button onClick={onIrReto} className="btn-primary w-full">
                Ir al reto final 🏆
              </button>
            ) : (
              <button onClick={onCerrar} className="btn-primary w-full">
                ¡Genial!
              </button>
            )}
            {retoFinal && (
              <button onClick={onCerrar} className="text-xs text-paper-700 hover:text-ink">
                Ahora no
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
