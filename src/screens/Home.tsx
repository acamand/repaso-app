import { useEffect, useState } from 'react';
import type { DailySession, PerPerfilProgress, Profile } from '@/types';
import { buildDailySession, alcanzadoLimiteDiario } from '@/lib/session';
import { Avatar } from '@/components/Avatar';
import { XPBar } from '@/components/XPBar';
import { SessionTimer } from '@/components/SessionTimer';

interface Props {
  profile: Profile;
  progress: PerPerfilProgress;
  onStartSession: (session: DailySession) => void;
  onSwitchProfile: () => void;
  onShowPasaporte: () => void;
}

export function Home({
  profile,
  progress,
  onStartSession,
  onSwitchProfile,
  onShowPasaporte,
}: Props) {
  const [session, setSession] = useState<DailySession | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    buildDailySession(profile.nivel, progress)
      .then((s) => {
        setSession(s);
        setCargando(false);
      })
      .catch((e) => {
        setError(String(e));
        setCargando(false);
      });
  }, [profile.nivel, progress.tiempoHoyS]);

  const tope = alcanzadoLimiteDiario(progress);
  const minutos = session ? Math.round(session.duracionEstimadaS / 60) : 0;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Avatar config={profile.avatar} size={40} />
          <div className="flex-1 min-w-0">
            <div className="font-medium leading-tight truncate">{profile.nombre}</div>
            <div className="text-xs text-paper-700">
              {profile.nivel === '5-primaria' ? '5º Primaria' : '1º ESO'}
            </div>
          </div>
          <button
            onClick={onShowPasaporte}
            className="text-xs text-paper-700 hover:text-ink"
            title="Ver pasaporte"
          >
            Pasaporte
          </button>
          <button onClick={onSwitchProfile} className="text-xs text-paper-700 hover:text-ink">
            Cambiar perfil
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <XPBar xp={progress.xpTotal} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <section className="card p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl">Hoy</h2>
            <SessionTimer segundosInvertidos={progress.tiempoHoyS} />
          </div>

          {progress.rachaDias > 0 && (
            <p className="text-sm mb-4">
              🔥 Llevas <strong>{progress.rachaDias}</strong> {progress.rachaDias === 1 ? 'día' : 'días'} seguidos.
            </p>
          )}

          {cargando && <p className="text-paper-700">Preparando la sesión…</p>}

          {error && (
            <p className="text-brick text-sm">
              No se pudo cargar el contenido. Comprueba que existen archivos en{' '}
              <code className="font-mono">/content/{profile.nivel}/…</code>
            </p>
          )}

          {!cargando && session && !tope && session.actividades.length > 0 && (
            <>
              <p className="text-paper-700 mb-4">
                Sesión de hoy: <strong>{session.actividades.length} actividades</strong> · unos{' '}
                <strong>{minutos} min</strong>.
              </p>
              <button onClick={() => onStartSession(session)} className="btn-primary w-full">
                Empezar sesión
              </button>
            </>
          )}

          {!cargando && session && session.actividades.length === 0 && !tope && (
            <p className="text-paper-700">
              No hay actividades disponibles todavía. Pídele a un adulto que añada contenido al
              banco.
            </p>
          )}

          {tope && (
            <div className="p-4 bg-mustard/15 border border-mustard/40 rounded-soft">
              <p className="font-medium mb-1">Por hoy ya está bien 👏</p>
              <p className="text-sm text-paper-700">
                Has alcanzado tu hora diaria. Mañana toca seguir explorando.
              </p>
            </div>
          )}
        </section>

        <section className="grid grid-cols-3 gap-3 text-center">
          <Stat label="XP total" valor={progress.xpTotal} />
          <Stat label="Racha" valor={progress.rachaDias} sufijo="días" />
          <Stat label="Actividades" valor={Object.keys(progress.actividadesCompletadas).length} />
        </section>
      </main>
    </div>
  );
}

function Stat({ label, valor, sufijo }: { label: string; valor: number; sufijo?: string }) {
  return (
    <div className="card p-3">
      <div className="font-display text-2xl text-slate">{valor}</div>
      <div className="text-xs text-paper-700">
        {label}
        {sufijo ? ` ${sufijo}` : ''}
      </div>
    </div>
  );
}
