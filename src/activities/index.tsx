import type { Activity } from '@/types';
import { MultipleChoice } from './MultipleChoice';
import { FillBlank } from './FillBlank';
import { NumberInput } from './NumberInput';
import { CuadernoProblema } from './CuadernoProblema';
import { DragMatch } from './DragMatch';
import type { ActivityResult } from './types';

interface Props {
  activity: Activity;
  onComplete: (r: ActivityResult) => void;
  onChecked?: () => void;
}

export function ActivityRenderer({ activity, onComplete, onChecked }: Props) {
  switch (activity.type) {
    case 'multiple_choice':
      return <MultipleChoice activity={activity} onComplete={onComplete} onChecked={onChecked} />;
    case 'fill_blank':
      return <FillBlank activity={activity} onComplete={onComplete} onChecked={onChecked} />;
    case 'number_input':
      return <NumberInput activity={activity} onComplete={onComplete} onChecked={onChecked} />;
    case 'cuaderno_problema':
      return <CuadernoProblema activity={activity} onComplete={onComplete} onChecked={onChecked} />;
    case 'drag_match':
      return <DragMatch activity={activity} onComplete={onComplete} onChecked={onChecked} />;
    default:
      return (
        <div className="card p-6">
          <p>Tipo de actividad desconocido: {(activity as Activity).type}</p>
        </div>
      );
  }
}
