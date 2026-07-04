interface Props {
  acierto: boolean;
  xp: number;
}

/**
 * Feedback de XP al terminar una actividad.
 * Acierto: "+X XP" en dorado con una animación sutil (sube y rebota).
 * Fallo: mensaje neutro, sin tono punitivo.
 */
export function XPFeedback({ acierto, xp }: Props) {
  if (acierto) {
    return (
      <div className="flex items-center justify-center py-1">
        <span className="xp-pop inline-flex items-center gap-1 font-display text-2xl font-bold text-mustard">
          +{xp} XP
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-1">
      <span className="text-sm text-paper-700">0 XP — ¡Inténtalo otro día! 💪</span>
    </div>
  );
}
