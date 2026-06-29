import { useState } from 'react';
import type { NumberInputActivity } from '@/types';
import { ActivityHeader } from '@/components/ActivityHeader';
import type { ActivityRendererProps } from './types';

export function NumberInput({
  activity,
  onComplete,
}: ActivityRendererProps<NumberInputActivity>) {
  const [valor, setValor] = useState('');
  const [estado, setEstado] = useState<'inicio' | 'comprobado'>('inicio');
  const [intentos, setIntentos] = useState(0);

  const parsed = parseFloat(valor.replace(',', '.'));
  const tol = activity.tolerancia ?? 0.001;
  const acierto = !isNaN(parsed) && Math.abs(parsed - activity.respuesta) <= tol;

  const comprobar = () => {
    if (isNaN(parsed)) return;
    setIntentos((i) => i + 1);
    setEstado('comprobado');
  };

  return (
    <div className="card p-6">
      <ActivityHeader activity={activity} />
      <h2 className="font-display text-xl md:text-2xl mb-5">{activity.enunciado}</h2>

      <div className="flex items-baseline gap-3 mb-5">
        <input
          type="text"
          inputMode="decimal"
          value={valor}
          disabled={estado === 'comprobado'}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Tu respuesta"
          className="px-4 py-3 w-48 border border-paper-500 rounded-soft bg-white font-mono text-lg
                     focus:outline-none focus:border-slate focus:ring-2 focus:ring-slate/30"
        />
        {activity.unidad && (
          <span className="font-mono text-paper-700">{activity.unidad}</span>
        )}
      </div>

      {estado === 'inicio' && (
        <button onClick={comprobar} disabled={isNaN(parsed)} className="btn-primary">
          Comprobar
        </button>
      )}

      {estado === 'comprobado' && (
        <div className="space-y-3">
          <div
            className={`p-3 rounded-soft ${acierto ? 'bg-sage/10 text-sage' : 'bg-brick/10 text-brick'}`}
          >
            {acierto
              ? '¡Correcto!'
              : `Casi. La respuesta era ${activity.respuesta}${activity.unidad ? ' ' + activity.unidad : ''}.`}
          </div>
          {activity.explicacion && (
            <p className="text-sm text-paper-700 italic">{activity.explicacion}</p>
          )}
          <button onClick={() => onComplete({ acierto, intentos: intentos || 1 })} className="btn-primary">
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
