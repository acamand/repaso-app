import type { Activity } from '@/types';

export interface ActivityResult {
  acierto: boolean;
  intentos: number;
}

export interface ActivityRendererProps<A extends Activity = Activity> {
  activity: A;
  onComplete: (result: ActivityResult) => void;
}
