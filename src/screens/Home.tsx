import { useEffect, useState } from 'react';
import type { Capitulo, DailySession, PerPerfilProgress, Profile, Ruta } from '@/types';
import { buildDailySession, alcanzadoLimiteDiario } from '@/lib/session';
import { getEtapa, loadCapitulo, loadRuta } from '@/lib/ruta';
import { Avatar } from '@/components/Avatar';
import { XPBar } from '@/components/XPBar';
import { SessionTimer } from '@/components/SessionTimer';
import { Flag } from '@/components/Flag';
import type { LlegadaInfo } from '@/screens/LlegadaPais';

interface Props {
  profile: Profile;
  progress: PerPerfilProgress;
  onStartSession: (session: DailySession, llegada?: LlegadaInfo) => void;
  onChangeEtapaActual: (etapaId: string) => void;
  onSwitchProfile: () => void;
  onShowPasaporte: () => void;
  onShowGuia: () => void;
  onShowLogros: () => void;
  onShowTutorial: () => void;
  onShowAvatar: () => void;
  onShowAjustes: () => void;
}

export function Home({
  profile,
  progress,
  onStartSession,
  onChangeEtapaActual,
  onSwitchProfile,
  onShowPasaporte,
  onShowGuia,
  onShowLogros,
  onShowTutorial,
  onShowAvatar,
  onShowAjustes,
}: Props) {
  const [session, setSession] = useState<DailySession | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [capituloActual, setCapituloActual] = useState<Capitulo | null>(null);

  const etapaActualId = progress.viaje.etapaActualId;

  useEffect(() => {
    loadRuta()
      .then(setRuta)
      .catch(() => setRuta(null));
  }, []);

  useEffect(() => {
    loadCapitulo(etapaActualId)
      .then(setCapituloActual)
      .catch(() => setCapituloActual(null));
  }, [etapaActualId]);

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
  }, [profile.nivel, progress.tiempoHoyS, etapaActualId]);

  const tope = alcanzadoLimiteDiario(progress);
  const minutos = session ? Math.round(session.duracionEstimadaS / 60) : 0;
  const etapaActual = ruta ? getEtapa(ruta, etapaActualId) : null;
  const datosPais = ruta && etapaActual ? ruta.datos_paises[etapaActual.pais] : null;
  const capituloVisto = progress.viaje.capitulosVistos.includes(etapaActualId);

  const handleStart = () => {
    if (!session) return;
    if (ruta && etapaActual && capituloActual && !capituloVisto) {
      onStartSession(session, { ruta, etapa: etapaActual, capitulo: capituloActual });
    } else {
      onStartSession(session);
    }
  };

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onShowAvatar}
            className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-slate/40"
            title="Personalizar avatar"
          >
            <Avatar config={profile.avatar} size={40} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-medium leading-tight truncate">{profile.nombre}</div>
            <div className="text-xs text-paper-700">
              {profile.nivel === '5-primaria' ? '5º Primaria' : '1º ESO'}
            </div>
          </div>
          <button
            onClick={onShowLogros}
            className="text-xs text-paper-700 hover:text-ink shrink-0"
            title="Mis logros"
          >
            Logros
          </button>
          <button
            onClick={onShowGuia}
            className="text-xs text-paper-700 hover:text-ink shrink-0"
            title="Guía de viaje"
          >
            Guía
          </button>
          <button
            onClick={onShowPasaporte}
            className="text-xs text-paper-700 hover:text-ink shrink-0"
            title="Ver pasaporte"
          >
            Pasaporte
          </button>
          <button onClick={onSwitchProfile} className="text-xs text-paper-700 hover:text-ink shrink-0">
            Cambiar perfil
          </button>
          <button
            onClick={onShowAjustes}
            className="text-xs text-paper-700 hover:text-ink shrink-0"
            title="Ajustes y copia de seguridad"
            aria-label="Ajustes y copia de seguridad"
          >
            ⚙
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
                {capituloActual && !capituloVisto && (
                  <>
                    {' '}
                    Empezarás con la llegada a <strong>{etapaActual?.pais}</strong>.
                  </>
                )}
              </p>
              <button onClick={handleStart} className="btn-primary w-full">
                Empezar sesión
              </button>
            </>
          )}

          {!cargando && session && session.actividades.length === 0 && !tope && (
            <p className="text-paper-700">
              No hay actividades disponibles todavía. Pídele a un adulto que añada contenido al banco.
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

        {ruta && etapaActual && (
          <section className="card p-4">
            <div className="flex items-center gap-3">
              <Flag
                codigo={datosPais?.codigo ?? '??'}
                className="w-14 h-9 rounded-sm shadow-sm shrink-0 border border-paper-300/40"
              />
              <div className="flex-1 min-w-0">
                <label htmlFor="etapa-select" className="text-xs text-paper-700 block mb-1">
                  Etapa actual del viaje
                </label>
                <select
                  id="etapa-select"
                  value={etapaActualId}
                  onChange={(e) => onChangeEtapaActual(e.target.value)}
                  className="w-full p-2 border border-paper-500 rounded-soft bg-white text-sm
                             focus:outline-none focus:border-slate focus:ring-2 focus:ring-slate/30"
                >
                  {ruta.fases.map((fase) => (
                    <optgroup key={fase.id} label={fase.nombre}>
                      {fase.etapas.map((etapa) => (
                        <option key={etapa.id} value={etapa.id}>
                          {etapa.pais}
                          {etapa.opcional ? ' (opcional)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            {etapaActual.tema && (
              <p className="text-xs text-paper-700 mt-3 italic">{etapaActual.tema}</p>
            )}
          </section>
        )}

        <section className="grid grid-cols-3 gap-3 text-center">
          <Stat label="XP total" valor={progress.xpTotal} />
          <Stat label="Racha" valor={progress.rachaDias} sufijo="días" />
          <Stat label="Actividades" valor={Object.keys(progress.actividadesCompletadas).length} />
        </section>

        <div className="text-center">
          <button
            onClick={onShowTutorial}
            className="text-xs text-paper-700 hover:text-ink underline underline-offset-2"
          >
            ¿Cómo funciona la app?
          </button>
        </div>
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
