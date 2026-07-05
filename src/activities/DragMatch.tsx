import { useMemo, useState } from 'react';
import type { DragMatchActivity } from '@/types';
import { ActivityHeader } from '@/components/ActivityHeader';
import { XPFeedback } from '@/components/XPFeedback';
import type { ActivityRendererProps } from './types';

/**
 * Emparejar arrastrando — con interacción por toque (mejor para móvil/tablet):
 * se toca un elemento para seleccionarlo y luego una categoría para colocarlo.
 * También acepta arrastrar con el ratón en escritorio.
 */
export function DragMatch({
  activity,
  onComplete,
}: ActivityRendererProps<DragMatchActivity>) {
  // asignaciones[i] = índice de la categoría donde está el elemento i (o null).
  const [asign, setAsign] = useState<(number | null)[]>(() => activity.elementos.map(() => null));
  const [sel, setSel] = useState<number | null>(null);
  const [estado, setEstado] = useState<'inicio' | 'comprobado'>('inicio');

  // Mapa elementoIndex -> categoríaIndex correcta.
  const solucion = useMemo(() => {
    const m: Record<number, number> = {};
    for (const [el, cat] of activity.soluciones) m[el] = cat;
    return m;
  }, [activity.soluciones]);

  const colocado = (i: number) => asign[i] !== null;
  const todosColocados = asign.every((a) => a !== null);
  const sinColocar = activity.elementos.map((_, i) => i).filter((i) => !colocado(i));

  const aciertoDe = (i: number) => asign[i] === solucion[i];
  const correcto = activity.elementos.every((_, i) => aciertoDe(i));

  const seleccionar = (i: number) => {
    if (estado === 'comprobado') return;
    setSel((s) => (s === i ? null : i));
  };

  const soltarEn = (cat: number) => {
    if (estado === 'comprobado' || sel === null) return;
    setAsign((a) => {
      const c = [...a];
      c[sel] = cat;
      return c;
    });
    setSel(null);
  };

  const quitar = (i: number) => {
    if (estado === 'comprobado') return;
    setAsign((a) => {
      const c = [...a];
      c[i] = null;
      return c;
    });
    setSel(null);
  };

  // Soporte de arrastre en escritorio (complementario al toque).
  const onDrop = (cat: number, e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    const i = Number(raw);
    if (Number.isNaN(i) || estado === 'comprobado') return;
    setAsign((a) => {
      const c = [...a];
      c[i] = cat;
      return c;
    });
    setSel(null);
  };

  return (
    <div className="card p-6">
      <ActivityHeader activity={activity} />
      {activity.enunciado && (
        <h2 className="font-display text-xl md:text-2xl mb-2">{activity.enunciado}</h2>
      )}
      <p className="text-sm text-paper-700 mb-5">{activity.instrucciones}</p>

      {/* Bandeja de elementos sin colocar */}
      <div className="mb-5">
        <div className="text-[0.65rem] uppercase tracking-wider text-paper-500 mb-2">
          Elementos {sel !== null && '· toca una categoría para colocarlo'}
        </div>
        <div className="flex flex-wrap gap-2 min-h-[2.75rem] p-2 rounded-soft bg-parchment2/40 border border-dashed border-paper-300">
          {sinColocar.length === 0 && (
            <span className="text-xs text-paper-500 self-center px-1">Todo colocado ✓</span>
          )}
          {sinColocar.map((i) => (
            <Chip
              key={i}
              texto={activity.elementos[i]}
              seleccionado={sel === i}
              draggable={estado === 'inicio'}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
              onClick={() => seleccionar(i)}
            />
          ))}
        </div>
      </div>

      {/* Zonas de categorías */}
      <div className="grid gap-3 sm:grid-cols-2">
        {activity.categorias.map((cat, c) => {
          const dentro = activity.elementos
            .map((_, i) => i)
            .filter((i) => asign[i] === c);
          return (
            <div
              key={c}
              onClick={() => soltarEn(c)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(c, e)}
              className={`rounded-soft border p-3 transition min-h-[4.5rem]
                ${sel !== null && estado === 'inicio'
                  ? 'border-slate bg-slate/5 cursor-pointer'
                  : 'border-paper-300'}`}
            >
              <div className="font-display text-sm mb-2">{cat}</div>
              <div className="flex flex-wrap gap-2">
                {dentro.length === 0 && (
                  <span className="text-xs text-paper-500">Toca aquí para colocar</span>
                )}
                {dentro.map((i) => {
                  const marca =
                    estado === 'comprobado'
                      ? aciertoDe(i)
                        ? 'border-sage bg-sage/10 text-sage'
                        : 'border-brick bg-brick/10 text-brick'
                      : 'border-slate/40 bg-white';
                  return (
                    <Chip
                      key={i}
                      texto={activity.elementos[i]}
                      className={marca}
                      onClick={(e) => {
                        e.stopPropagation();
                        quitar(i);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {estado === 'inicio' && (
        <button
          onClick={() => setEstado('comprobado')}
          disabled={!todosColocados}
          className="btn-primary mt-5"
        >
          Comprobar
        </button>
      )}

      {estado === 'comprobado' && (
        <div className="space-y-3 mt-5">
          <div
            className={`p-3 rounded-soft ${correcto ? 'bg-sage/10 text-sage' : 'bg-brick/10 text-brick'}`}
          >
            {correcto ? '¡Todo correcto!' : 'Casi. Revisa los emparejamientos marcados en rojo.'}
          </div>
          <XPFeedback acierto={correcto} xp={activity.xp} />
          {activity.explicacion && (
            <p className="text-sm text-paper-700 italic">{activity.explicacion}</p>
          )}
          <button
            onClick={() => onComplete({ acierto: correcto, intentos: 1 })}
            className="btn-primary"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}

interface ChipProps {
  texto: string;
  seleccionado?: boolean;
  draggable?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
}

function Chip({ texto, seleccionado, draggable, className = '', onClick, onDragStart }: ChipProps) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition select-none
        ${seleccionado ? 'border-slate bg-slate text-white shadow-md scale-105' : ''}
        ${!seleccionado && !className ? 'border-paper-500 bg-white hover:border-slate' : ''}
        ${className}`}
    >
      {texto}
    </button>
  );
}
