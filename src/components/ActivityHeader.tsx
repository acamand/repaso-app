import type { Activity } from '@/types';

interface Props {
  activity: Activity;
}

const materiaLabel: Record<string, string> = {
  matematicas: 'Matemáticas',
  lengua: 'Lengua',
};

export function ActivityHeader({ activity }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs uppercase tracking-wider text-paper-700">
        {materiaLabel[activity.materia]}
      </span>
      <span className="text-paper-500">·</span>
      {activity.formato === 'digital' ? (
        <span className="chip-digital">en pantalla</span>
      ) : activity.formato === 'cuaderno' ? (
        <span className="chip-cuaderno">📓 en cuaderno</span>
      ) : (
        <span className="chip-cuaderno">📓 mixta</span>
      )}
      <span className="chip-xp">+{activity.xp} FP</span>
    </div>
  );
}
