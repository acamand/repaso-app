import type { AvatarConfig } from '@/types';
import type { NivelDef } from '@/lib/niveles';
import type { PiezaAvatar } from '@/lib/avatarPiezas';
import { aplicarPieza } from '@/lib/avatarPiezas';
import { Avatar } from '@/components/Avatar';

interface Props {
  hito: NivelDef;
  avatarActual: AvatarConfig;
  /** Pieza de avatar desbloqueada en este mismo salto de nivel, si hay alguna. */
  piezaNueva: PiezaAvatar | null;
  onIrReto: () => void;
  onPersonalizar: () => void;
  onCerrar: () => void;
}

/** Modal de celebración al alcanzar un nuevo hito de nivel. */
export function LevelUpModal({ hito, avatarActual, piezaNueva, onIrReto, onPersonalizar, onCerrar }: Props) {
  const esReto = hito.tipo === 'reto';
  const esPiezaProtagonista = hito.tipo.startsWith('avatar-');
  const previewConfig = piezaNueva ? aplicarPieza(avatarActual, piezaNueva) : avatarActual;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="card w-full max-w-sm p-7 text-center relative overflow-hidden shadow-xl">
        <div
          className="absolute inset-x-0 top-0 h-28 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(242,193,78,0.35), transparent 70%)' }}
        />
        <div className="relative">
          <div className="text-5xl mb-2 xp-pop" aria-hidden>🎉</div>
          <div className="text-xs uppercase tracking-[0.25em] text-copper">¡Has subido de nivel!</div>
          <h2 className="font-display text-3xl mt-1">
            Nivel {hito.nivel}: {hito.nombre}
          </h2>

          {/* Caja genérica del hito — se omite cuando el propio hito ES la pieza
              de avatar, para no repetir la misma noticia dos veces. */}
          {!esPiezaProtagonista && (
            <div className="mt-4 p-3 rounded-soft bg-mustard/15 border border-mustard/40 text-sm">
              Has desbloqueado: <strong>{hito.desbloquea}</strong>
            </div>
          )}

          {/* Vista previa REAL del avatar con la pieza nueva puesta. */}
          {piezaNueva && (
            <div className="mt-4 p-4 rounded-soft bg-white/60 border border-paper-300 flex items-center gap-4">
              <Avatar config={previewConfig} size={72} />
              <div className="text-left">
                <div className="text-[0.6rem] uppercase tracking-wider text-copper">
                  Nuevo en tu guardarropa
                </div>
                <div className="font-display text-lg leading-tight">{piezaNueva.nombre}</div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-2">
            {esReto && (
              <>
                <button onClick={onIrReto} className="btn-primary w-full">
                  Ir al reto 🏆
                </button>
                {piezaNueva && (
                  <button onClick={onPersonalizar} className="btn-secondary w-full">
                    Personalizar avatar
                  </button>
                )}
                <button onClick={onCerrar} className="text-xs text-paper-700 hover:text-ink">
                  Ahora no
                </button>
              </>
            )}

            {!esReto && piezaNueva && (
              <>
                <button onClick={onPersonalizar} className="btn-primary w-full">
                  Personalizar ahora
                </button>
                <button onClick={onCerrar} className="text-xs text-paper-700 hover:text-ink">
                  Ahora no
                </button>
              </>
            )}

            {!esReto && !piezaNueva && (
              <button onClick={onCerrar} className="btn-primary w-full">
                ¡Genial!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
