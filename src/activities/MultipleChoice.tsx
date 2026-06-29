import { useState } from 'react';
import type { MultipleChoiceActivity } from '@/types';
import { ActivityHeader } from '@/components/ActivityHeader';
import type { ActivityRendererProps } from './types';

export function MultipleChoice({
  activity,
  onComplete,
}: ActivityRendererProps<MultipleChoiceActivity>) {
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [estado, setEstado] = useState<'inicio' | 'comprobado'>('inicio');
  const [intentos, setIntentos] = useState(0);

  const comprobar = () => {
    if (seleccion === null) return;
    setIntentos((i) => i + 1);
    setEstado('comprobado');
  };

  const continuar = () => {
    onComplete({ acierto: seleccion === activity.correcta, intentos: intentos || 1 });
  };

  const acierto = seleccion === activity.correcta;

  return (
    <div className="card p-6">
      <ActivityHeader activity={activity} />
      <h2 className="font-display text-xl md:text-2xl mb-5">{activity.enunciado}</h2>

      <ul className="space-y-2 mb-5">
        {activity.opciones.map((opt, idx) => {
          const elegida = seleccion === idx;
          const esCorrecta = idx === activity.correcta;
          const marcaEstado =
            estado === 'comprobado' && elegida
              ? esCorrecta
                ? 'border-sage bg-sage/10'
                : 'border-brick bg-brick/5'
              : elegida
                ? 'border-slate bg-slate/5'
                : 'border-paper-300 hover:border-paper-500';

          return (
            <li key={idx}>
              <button
                type="button"
                disabled={estado === 'comprobado'}
                onClick={() => setSeleccion(idx)}
                className={`w-full text-left p-3 rounded-soft border transition ${marcaEstado}`}
              >
                <span className="font-mono text-xs text-paper-700 mr-2">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            </li>
          );
        })}
      </ul>

      {estado === 'inicio' && (
        <button onClick={comprobar} disabled={seleccion === null} className="btn-primary">
          Comprobar
        </button>
      )}

      {estado === 'comprobado' && (
        <div className="space-y-3">
          <div
            className={`p-3 rounded-soft ${acierto ? 'bg-sage/10 text-sage' : 'bg-brick/10 text-brick'}`}
          >
            {acierto ? '¡Correcto!' : `Casi. La opción correcta era la ${String.fromCharCode(65 + activity.correcta)}.`}
          </div>
          {activity.explicacion && (
            <p className="text-sm text-paper-700 italic">{activity.explicacion}</p>
          )}
          <button onClick={continuar} className="btn-primary">
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
