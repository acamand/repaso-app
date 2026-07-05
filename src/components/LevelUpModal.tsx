import type { NivelDef } from '@/lib/niveles';

interface Props {
  hito: NivelDef;
  onIrReto: () => void;
  onCerrar: () => void;
}

/** Modal de celebración al alcanzar un nuevo hito de nivel. */
export function LevelUpModal({ hito, onIrReto, onCerrar }: Props) {
  const esReto = hito.tipo === 'reto';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="card w-full max-w-sm p-7 text-center relative overflow-hidden shadow-xl">
        <div
          className="absolute inset-x-0 top-0 h-28 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(242,193,78,0.35), transparent 70%)' }}
        />
        <div className="relative">
          <div className="text-5xl mb-2 xp-pop" aria-hidden>🎉</div>
          <div className="text-xs uppercase tracking-[0.25em] text-copper">¡Has subido de nivel!</div>
          <h2 className="font-display text-3xl mt-1">
            Nivel {hito.nivel}: {hito.nombre}
          </h2>

          <div className="mt-4 p-3 rounded-soft bg-mustard/15 border border-mustard/40 text-sm">
            Has desbloqueado: <strong>{hito.desbloquea}</strong>
          </div>

          <div className="mt-6 space-y-2">
            {esReto ? (
              <>
                <button onClick={onIrReto} className="btn-primary w-full">
                  Ir al reto 🏆
                </button>
                <button onClick={onCerrar} className="text-xs text-paper-700 hover:text-ink">
                  Ahora no
                </button>
              </>
            ) : (
              <button onClick={onCerrar} className="btn-primary w-full">
                ¡Genial!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
