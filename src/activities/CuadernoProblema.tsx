import { useState } from 'react';
import type { CuadernoProblemaActivity } from '@/types';
import { ActivityHeader } from '@/components/ActivityHeader';
import type { ActivityRendererProps } from './types';

export function CuadernoProblema({
  activity,
  onComplete,
}: ActivityRendererProps<CuadernoProblemaActivity>) {
  const [pistasReveladas, setPistasReveladas] = useState(0);
  const [verSolucion, setVerSolucion] = useState(false);
  const [autoEval, setAutoEval] = useState<'bien' | 'casi' | null>(null);

  return (
    <div className="card p-6">
      <ActivityHeader activity={activity} />

      <div className="flex items-start gap-3 mb-4 p-3 bg-copper/5 border border-copper/20 rounded-soft">
        <span className="text-2xl">📓</span>
        <p className="text-sm text-paper-700">
          Esta actividad es para tu cuaderno. Copia el enunciado, resuélvela y luego compara con la solución.
        </p>
      </div>

      <h2 className="font-display text-xl md:text-2xl mb-4">Enunciado</h2>
      <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed mb-6 p-4 bg-parchment2/50 rounded-soft">
        {activity.enunciado}
      </pre>

      {activity.pistas && activity.pistas.length > 0 && pistasReveladas > 0 && (
        <div className="mb-6 space-y-2">
          {activity.pistas.slice(0, pistasReveladas).map((p, i) => (
            <div key={i} className="text-sm p-3 bg-mustard/10 border-l-2 border-mustard rounded">
              <strong className="text-paper-700">Pista {i + 1}:</strong> {p}
            </div>
          ))}
        </div>
      )}

      {!verSolucion && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activity.pistas && pistasReveladas < activity.pistas.length && (
            <button onClick={() => setPistasReveladas((n) => n + 1)} className="btn-secondary">
              Pedir pista ({pistasReveladas}/{activity.pistas.length})
            </button>
          )}
          <button onClick={() => setVerSolucion(true)} className="btn-copper">
            Ver solución
          </button>
        </div>
      )}

      {verSolucion && (
        <div className="space-y-4">
          <div className="p-4 bg-sage/10 border-l-2 border-sage rounded">
            <h3 className="font-display text-lg mb-2 text-sage">Solución</h3>
            <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
              {activity.solucion}
            </pre>
          </div>

          <div>
            <p className="text-sm text-paper-700 mb-2">¿Cómo te ha ido?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setAutoEval('bien')}
                className={`btn-secondary ${autoEval === 'bien' ? 'border-sage bg-sage/10 text-sage' : ''}`}
              >
                Lo he resuelto bien
              </button>
              <button
                onClick={() => setAutoEval('casi')}
                className={`btn-secondary ${autoEval === 'casi' ? 'border-mustard bg-mustard/10' : ''}`}
              >
                Necesito repasarlo
              </button>
            </div>
          </div>

          {autoEval && (
            <button
              onClick={() =>
                onComplete({ acierto: autoEval === 'bien', intentos: 1 })
              }
              className="btn-primary"
            >
              Continuar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
