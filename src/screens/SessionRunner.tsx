import { useEffect, useState } from 'react';
import type { Activity, DailySession } from '@/types';
import { ActivityRenderer } from '@/activities';
import type { ActivityResult } from '@/activities/types';

interface Props {
  session: DailySession;
  onActivityDone: (activity: Activity, result: ActivityResult, tiempoS: number) => void;
  onFinish: () => void;
}

export function SessionRunner({ session, onActivityDone, onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const [inicio, setInicio] = useState(Date.now());

  useEffect(() => setInicio(Date.now()), [idx]);

  if (session.actividades.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="card p-6 max-w-md text-center">
          <p className="mb-4">No hay actividades en esta sesión.</p>
          <button onClick={onFinish} className="btn-primary">Volver</button>
        </div>
      </div>
    );
  }

  const actual = session.actividades[idx];
  const ultima = idx === session.actividades.length - 1;

  const handleComplete = (result: ActivityResult) => {
    const tiempoS = Math.round((Date.now() - inicio) / 1000);
    onActivityDone(actual, result, tiempoS);
    if (ultima) onFinish();
    else setIdx((i) => i + 1);
  };

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onFinish} className="text-sm text-paper-700 hover:text-ink">
            ← Salir
          </button>
          <div className="flex-1">
            <div className="h-1.5 bg-parchment2 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate transition-all"
                style={{ width: `${((idx + 1) / session.actividades.length) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono text-paper-700 shrink-0">
            {idx + 1} / {session.actividades.length}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <ActivityRenderer key={actual.id} activity={actual} onComplete={handleComplete} />
      </main>
    </div>
  );
}
