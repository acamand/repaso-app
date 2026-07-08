import { useState } from 'react';
import type { Profile, Nivel, ProgressState } from '@/types';
import { Avatar, avatarPorDefecto } from '@/components/Avatar';

interface Props {
  state: ProgressState;
  onSelect: (id: string) => void;
  onCreate: (profile: Profile) => void;
}

export function ProfileSelect({ state, onSelect, onCreate }: Props) {
  const [creando, setCreando] = useState(state.perfiles.length === 0);
  const [nombre, setNombre] = useState('');
  const [nivel, setNivel] = useState<Nivel>('5-primaria');

  const crear = () => {
    if (!nombre.trim()) return;
    const profile: Profile = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      nivel,
      avatar: avatarPorDefecto(),
      creado: Date.now(),
    };
    onCreate(profile);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-copper mb-2">Bitácora de verano</p>
          <h1 className="font-display text-4xl mb-2">Park4Learn</h1>
          <p className="text-paper-700">Tu cuaderno de exploración.</p>
        </div>

        {!creando ? (
          <div className="card p-6 space-y-3">
            <p className="text-sm text-paper-700 mb-3">¿Quién va a estudiar?</p>
            {state.perfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="w-full flex items-center gap-3 p-3 rounded-soft border border-paper-300
                           hover:border-slate hover:bg-slate/5 transition"
              >
                <Avatar config={p.avatar} size={48} />
                <div className="text-left">
                  <div className="font-medium">{p.nombre}</div>
                  <div className="text-xs text-paper-700">
                    {p.nivel === '5-primaria' ? '5º Primaria' : '1º ESO'}
                  </div>
                </div>
              </button>
            ))}
            <button onClick={() => setCreando(true)} className="btn-secondary w-full">
              + Crear nuevo perfil
            </button>
          </div>
        ) : (
          <div className="card p-6 space-y-4">
            <h2 className="font-display text-xl">Nuevo explorador</h2>
            <div>
              <label className="text-sm text-paper-700 block mb-1">Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full p-3 border border-paper-500 rounded-soft bg-white
                           focus:outline-none focus:border-slate focus:ring-2 focus:ring-slate/30"
              />
            </div>
            <div>
              <label className="text-sm text-paper-700 block mb-1">Curso</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNivel('5-primaria')}
                  className={`flex-1 p-3 rounded-soft border transition ${
                    nivel === '5-primaria'
                      ? 'border-slate bg-slate/5 text-slate'
                      : 'border-paper-300 hover:border-paper-500'
                  }`}
                >
                  5º Primaria
                </button>
                <button
                  onClick={() => setNivel('1-eso')}
                  className={`flex-1 p-3 rounded-soft border transition ${
                    nivel === '1-eso'
                      ? 'border-slate bg-slate/5 text-slate'
                      : 'border-paper-300 hover:border-paper-500'
                  }`}
                >
                  1º ESO
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={crear} disabled={!nombre.trim()} className="btn-primary flex-1">
                Empezar
              </button>
              {state.perfiles.length > 0 && (
                <button onClick={() => setCreando(false)} className="btn-secondary">
                  Volver
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
