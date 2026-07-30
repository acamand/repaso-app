import type { Activity } from '@/types';

export interface ActivityResult {
  acierto: boolean;
  intentos: number;
}

export interface ActivityRendererProps<A extends Activity = Activity> {
  activity: A;
  onComplete: (result: ActivityResult) => void;
  /** Se llama en cuanto el alumno comprueba/revela el resultado (antes de `onComplete`, que solo llega al pulsar "Continuar"). */
  onChecked?: () => void;
}
