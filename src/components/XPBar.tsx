import { estadoNivel } from '@/lib/niveles';

interface Props {
  xp: number;
}

export function XPBar({ xp }: Props) {
  const { nivel, nombre, hito, xpHastaHito, progresoHito } = estadoNivel(xp);
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-display text-base leading-tight truncate">
          Nivel {nivel} <span className="text-paper-700">— {nombre}</span>
        </div>
        <span className="text-[11px] text-paper-700 font-mono shrink-0">{xp} FP</span>
      </div>
      <div className="h-2 bg-parchment2 rounded-full overflow-hidden mt-1.5">
        <div
          className="h-full bg-gradient-to-r from-slate to-mustard transition-all"
          style={{ width: `${Math.max(4, progresoHito * 100)}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-paper-700">
        {hito ? (
          <>
            Siguiente nivel: <span className="font-medium">{hito.nombre}</span>{' '}
            (te faltan {xpHastaHito} FP)
          </>
        ) : (
          <>¡Has alcanzado el nivel máximo! 🏆</>
        )}
      </div>
    </div>
  );
}
