import { useState } from 'react';
import type { AvatarConfig, PerPerfilProgress } from '@/types';
import { Avatar } from '@/components/Avatar';
import type { CategoriaPieza } from '@/lib/avatarPiezas';
import { PIEZAS_AVATAR, estaDesbloqueada } from '@/lib/avatarPiezas';

interface Props {
  avatar: AvatarConfig;
  progress: PerPerfilProgress;
  onSave: (config: AvatarConfig) => void;
  onBack: () => void;
}

const TITULOS: Record<CategoriaPieza, string> = {
  pelo: 'Peinado',
  ropa: 'Ropa',
  fondo: 'Fondo',
  accesorio: 'Accesorio',
};

const ORDEN: CategoriaPieza[] = ['pelo', 'ropa', 'fondo', 'accesorio'];

export function AvatarEditor({ avatar, progress, onSave, onBack }: Props) {
  const [config, setConfig] = useState<AvatarConfig>(avatar);
  const desbloqueadas = progress.piezasAvatarDesbloqueadas;

  const elegir = (categoria: CategoriaPieza, valor: string) => {
    if (!estaDesbloqueada(desbloqueadas, categoria, valor)) return;
    const nuevo = { ...config, [categoria]: valor };
    setConfig(nuevo);
    onSave(nuevo);
  };

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-paper-700 hover:text-ink shrink-0">
            ← Volver
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-copper">Guardarropa</div>
            <div className="font-display text-lg leading-tight truncate">Personalizar avatar</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <section className="card p-6 flex flex-col items-center">
          <Avatar config={config} size={140} />
          <p className="text-xs text-paper-700 mt-3 text-center">
            Toca una pieza desbloqueada para ponértela al instante.
          </p>
        </section>

        {ORDEN.map((categoria) => {
          const piezas = PIEZAS_AVATAR.filter((p) => p.categoria === categoria);
          return (
            <section key={categoria}>
              <h2 className="font-display text-xl mb-3 px-1">{TITULOS[categoria]}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {piezas.map((pieza) => {
                  const desbloqueada = estaDesbloqueada(desbloqueadas, categoria, pieza.valor);
                  const seleccionada = config[categoria] === pieza.valor;
                  const previewConfig = { ...config, [categoria]: pieza.valor };
                  return (
                    <button
                      key={pieza.valor}
                      onClick={() => elegir(categoria, pieza.valor)}
                      disabled={!desbloqueada}
                      className={`card p-3 flex flex-col items-center gap-1.5 relative transition
                        ${seleccionada ? 'ring-2 ring-slate' : ''}
                        ${desbloqueada ? 'cursor-pointer hover:ring-2 hover:ring-slate/40' : 'cursor-default opacity-60'}`}
                    >
                      <div className="relative">
                        <Avatar config={previewConfig} size={56} />
                        {!desbloqueada && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/50">
                            <span className="text-lg" aria-hidden>🔒</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[0.65rem] text-center leading-tight text-paper-700">
                        {desbloqueada ? pieza.nombre : `Nivel ${pieza.nivel}`}
                      </span>
                      {seleccionada && desbloqueada && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate text-white text-[0.65rem] flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
