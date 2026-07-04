import type { PerPerfilProgress } from '@/types';
import { NIVELES, estadoNivel, xpParaNivel } from '@/lib/niveles';

interface Props {
  progress: PerPerfilProgress;
  onBack: () => void;
}

export function MisLogros({ progress, onBack }: Props) {
  const xp = progress.xpTotal;
  const { nivel, nombre, hito, xpHastaHito, progresoHito } = estadoNivel(xp);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-paper-700 hover:text-ink shrink-0">
            ← Volver
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-copper">Progreso</div>
            <div className="font-display text-lg leading-tight truncate">Mis logros</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Nivel actual */}
        <section className="card p-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-paper-700">Nivel {nivel}</div>
          <h2 className="font-display text-4xl mt-1">{nombre}</h2>

          <div className="h-3 bg-parchment2 rounded-full overflow-hidden mt-5">
            <div
              className="h-full bg-gradient-to-r from-slate to-mustard transition-all"
              style={{ width: `${Math.max(4, progresoHito * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-paper-700 font-mono">
            <span>{xp} XP</span>
            {hito ? (
              <span>
                {nombre} → {hito.nombre}
              </span>
            ) : (
              <span>máximo</span>
            )}
          </div>

          <p className="text-sm text-paper-700 mt-4">
            {hito ? (
              <>
                Te faltan <strong className="text-ink">{xpHastaHito} XP</strong> para ser{' '}
                <strong className="text-ink">{hito.nombre}</strong> y desbloquear:{' '}
                {hito.desbloquea.toLowerCase()}.
              </>
            ) : (
              <>Has alcanzado el nivel más alto: ¡Maestro viajero! 🏆</>
            )}
          </p>
        </section>

        {/* Escalera de niveles */}
        <section>
          <h2 className="font-display text-xl mb-3 px-1">Niveles y recompensas</h2>
          <div className="space-y-2">
            {NIVELES.map((n) => {
              const alcanzado = xp >= xpParaNivel(n.nivel);
              const esActual = n.nombre === nombre;
              return (
                <div
                  key={n.nivel}
                  className={`card p-4 flex items-center gap-4 ${alcanzado ? '' : 'opacity-55'}`}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-lg font-display
                      ${alcanzado ? 'bg-mustard/20 text-ink border-2 border-mustard' : 'bg-parchment2 text-paper-500 border-2 border-paper-300'}`}
                  >
                    {alcanzado ? '✓' : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-display text-base">
                        Nivel {n.nivel} — {n.nombre}
                      </span>
                      {esActual && alcanzado && (
                        <span className="text-[0.6rem] uppercase tracking-wider text-copper border border-copper/40 rounded-full px-1.5 py-0.5">
                          actual
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-paper-700 mt-0.5">{n.desbloquea}</div>
                  </div>
                  <div className="text-[11px] text-paper-500 font-mono shrink-0">
                    {xpParaNivel(n.nivel)} XP
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cómo funcionan los puntos */}
        <section className="card p-5">
          <h2 className="font-display text-xl mb-3">Cómo funcionan los puntos</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="text-mustard text-lg leading-none shrink-0">◆</span>
              <span>
                <strong>Respuesta correcta</strong> = los puntos completos de la actividad.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-paper-500 text-lg leading-none shrink-0">◇</span>
              <span>
                <strong>Respuesta incorrecta</strong> = 0 puntos, pero podrás repetirla otro día.
                Fallar no resta.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-copper text-lg leading-none shrink-0">📓</span>
              <span>
                Las actividades <strong>de cuaderno</strong> dan más puntos, porque requieren más
                esfuerzo.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-slate text-lg leading-none shrink-0">▲</span>
              <span>
                Cada <strong>nivel</strong> necesita más puntos que el anterior: cuanto más subes,
                más aventura desbloqueas.
              </span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
