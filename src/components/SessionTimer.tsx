interface Props {
  segundosInvertidos: number;
  limiteS?: number;
}

const LIMITE_DEFECTO = 60 * 60;

export function SessionTimer({ segundosInvertidos, limiteS = LIMITE_DEFECTO }: Props) {
  const pct = Math.min(100, (segundosInvertidos / limiteS) * 100);
  const minutos = Math.floor(segundosInvertidos / 60);
  const restantes = Math.max(0, Math.ceil((limiteS - segundosInvertidos) / 60));

  let tono = 'bg-sage';
  if (pct > 60) tono = 'bg-mustard';
  if (pct > 90) tono = 'bg-copper';

  return (
    <div className="flex items-center gap-2 text-xs text-paper-700">
      <div className="relative w-16 h-1.5 bg-parchment2 rounded-full overflow-hidden">
        <div className={`absolute inset-y-0 left-0 ${tono}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono whitespace-nowrap">
        {minutos} min hoy · {restantes} min disponibles
      </span>
    </div>
  );
}
