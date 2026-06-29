import { useState } from 'react';
import type { FillBlankActivity } from '@/types';
import { ActivityHeader } from '@/components/ActivityHeader';
import type { ActivityRendererProps } from './types';

function normaliza(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function FillBlank({
  activity,
  onComplete,
}: ActivityRendererProps<FillBlankActivity>) {
  const partes = activity.texto.split(/(\{\d+\})/g);
  const [respuestas, setRespuestas] = useState<string[]>(() =>
    activity.respuestas.map(() => ''),
  );
  const [estado, setEstado] = useState<'inicio' | 'comprobado'>('inicio');
  const [intentos, setIntentos] = useState(0);

  const comprobar = () => {
    setIntentos((i) => i + 1);
    setEstado('comprobado');
  };

  const aciertos = activity.respuestas.map((aceptadas, i) => {
    const dado = activity.flexible ? normaliza(respuestas[i] ?? '') : (respuestas[i] ?? '').trim();
    const comparables = activity.flexible ? aceptadas.map(normaliza) : aceptadas;
    return comparables.includes(dado);
  });
  const acierto = aciertos.every(Boolean);

  return (
    <div className="card p-6">
      <ActivityHeader activity={activity} />
      <h2 className="font-display text-xl md:text-2xl mb-5">{activity.enunciado}</h2>

      <p className="text-lg leading-relaxed mb-5">
        {partes.map((parte, idx) => {
          const m = parte.match(/\{(\d+)\}/);
          if (!m) return <span key={idx}>{parte}</span>;
          const i = Number(m[1]);
          const ok = estado === 'comprobado' && aciertos[i];
          const mal = estado === 'comprobado' && !aciertos[i];
          return (
            <input
              key={idx}
              type="text"
              value={respuestas[i] ?? ''}
              disabled={estado === 'comprobado'}
              onChange={(e) =>
                setRespuestas((r) => {
                  const c = [...r];
                  c[i] = e.target.value;
                  return c;
                })
              }
              className={`inline-block mx-1 px-2 py-1 w-28 border-b-2 bg-transparent font-mono text-base
                focus:outline-none
                ${ok ? 'border-sage text-sage' : ''}
                ${mal ? 'border-brick text-brick' : ''}
                ${!ok && !mal ? 'border-paper-500 focus:border-slate' : ''}`}
            />
          );
        })}
      </p>

      {estado === 'inicio' && (
        <button onClick={comprobar} className="btn-primary">
          Comprobar
        </button>
      )}

      {estado === 'comprobado' && (
        <div className="space-y-3">
          <div
            className={`p-3 rounded-soft ${acierto ? 'bg-sage/10 text-sage' : 'bg-brick/10 text-brick'}`}
          >
            {acierto ? '¡Bien!' : (
              <>
                Casi. Respuestas correctas:{' '}
                <span className="font-mono">
                  {activity.respuestas.map((r) => r[0]).join(', ')}
                </span>
              </>
            )}
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
