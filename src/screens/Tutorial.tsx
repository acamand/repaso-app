import { useState } from 'react';
import { Personaje } from '@/components/Personaje';

interface Props {
  onFinish: () => void;
}

interface Pantalla {
  quien: 'marco' | 'marta';
  nombre: string;
  cuerpo: React.ReactNode;
}

const PANTALLAS: Pantalla[] = [
  {
    quien: 'marco',
    nombre: 'Marco',
    cuerpo: (
      <p>
        ¡Bienvenido, viajero! Me llamo <strong>Marco</strong> y voy a acompañarte en una aventura muy
        especial. Este verano, mientras recorres Europa en autocaravana, vas a repasar matemáticas y
        lengua de una forma diferente: con actividades que tienen que ver con los países que visitéis,
        problemas reales del viaje y retos que te harán pensar.
      </p>
    ),
  },
  {
    quien: 'marta',
    nombre: 'Marta',
    cuerpo: (
      <>
        <p className="mb-3">¡Hola! Yo soy <strong>Marta</strong> y también viajo como tú. Te cuento cómo funciona esto:</p>
        <ul className="space-y-2 text-left list-none">
          <li className="flex gap-2"><span aria-hidden>🗓️</span><span>Cada día la app te propone una sesión de actividades (unos 25 minutos, nunca más de 1 hora).</span></li>
          <li className="flex gap-2"><span aria-hidden>📱</span><span>Hay actividades <strong>en pantalla</strong> (las resuelves aquí) y actividades <strong>de cuaderno 📓</strong> (las copias y resuelves en tu cuaderno).</span></li>
          <li className="flex gap-2"><span aria-hidden>⭐</span><span>Si aciertas, ganas <strong>Furgo Points (FP)</strong>. Si fallas, 0 puntos, pero la actividad volverá otro día para que lo intentes de nuevo.</span></li>
        </ul>
      </>
    ),
  },
  {
    quien: 'marco',
    nombre: 'Marco',
    cuerpo: (
      <p>
        Con los <strong>Furgo Points (FP)</strong> subes de nivel. Cada nivel tiene un nombre de explorador y
        desbloquea <strong>retos especiales</strong>: las <em>Lecciones del Camino</em>. Son actividades
        diferentes, más creativas, con reflexiones sobre el viaje y la vida. Cada una se hace{' '}
        <strong>una sola vez</strong>, así que merece la pena llegar a ellas con calma.
      </p>
    ),
  },
  {
    quien: 'marta',
    nombre: 'Marta',
    cuerpo: (
      <p>
        ¡Y no te olvides del <strong>Pasaporte</strong>! Cada vez que lleguéis a un país nuevo,
        selecciónalo en la app. Verás datos curiosos, frases en el idioma local y, cuando completes
        suficientes actividades, ¡se sellará tu pasaporte! Intenta conseguir las <strong>3 estrellas</strong>{' '}
        en cada país. ¿Preparado/a? ¡Vamos allá!
      </p>
    ),
  },
];

export function Tutorial({ onFinish }: Props) {
  const [i, setI] = useState(0);
  const pantalla = PANTALLAS[i];
  const ultima = i === PANTALLAS.length - 1;
  const esMarco = pantalla.quien === 'marco';

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-copper">Tu aventura</p>
        </div>

        <div className="card p-6">
          <div className={`flex items-center gap-3 mb-4 ${esMarco ? '' : 'flex-row-reverse'}`}>
            <Personaje quien={pantalla.quien} size={80} className="shrink-0 rounded-full shadow-card" />
            <div
              className={`flex-1 rounded-soft px-3 py-2 text-sm font-medium ${
                esMarco ? 'bg-sage/15 text-sage' : 'bg-slate/10 text-slate'
              }`}
            >
              {pantalla.nombre} dice…
            </div>
          </div>

          <div className="text-base leading-relaxed text-ink min-h-[9rem]">{pantalla.cuerpo}</div>

          {/* puntos de progreso */}
          <div className="flex justify-center gap-1.5 my-5">
            {PANTALLAS.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === i ? 'w-6 bg-slate' : 'w-2 bg-paper-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onFinish}
              className="text-xs text-paper-700 hover:text-ink"
            >
              Saltar
            </button>
            {ultima ? (
              <button onClick={onFinish} className="btn-primary flex-1">
                ¡Empezar! 🚐
              </button>
            ) : (
              <button onClick={() => setI((n) => n + 1)} className="btn-primary flex-1">
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
