import { nivelDeXP } from '@/lib/progress';

interface Props {
  xp: number;
}

export function XPBar({ xp }: Props) {
  const { nivel, progreso, siguienteEn } = nivelDeXP(xp);
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex items-baseline gap-1 shrink-0">
        <span className="font-display text-2xl text-slate">{nivel}</span>
        <span className="text-xs text-paper-700">nivel</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-2 bg-parchment2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-slate to-sage transition-all"
            style={{ width: `${Math.max(4, progreso * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[11px] text-paper-700 font-mono">
          <span>{xp} XP</span>
          <span>{siguienteEn} para nivel {nivel + 1}</span>
        </div>
      </div>
    </div>
  );
}
