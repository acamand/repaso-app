import { useEffect, useState } from 'react';
import type { Activity, DailySession, ProgressState } from '@/types';
import {
  addProfile,
  getActiveProgress,
  loadProgress,
  recordActivity,
  rolloverDay,
  saveProgress,
  setActiveProfile,
  setEtapaActual,
} from '@/lib/progress';
import { evaluarSellos, loadEtapaInfo, marcarCapituloVisto } from '@/lib/sellos';
import type { EtapaInfo } from '@/lib/sellos';
import { ProfileSelect } from '@/screens/ProfileSelect';
import { Home } from '@/screens/Home';
import { SessionRunner } from '@/screens/SessionRunner';
import { Pasaporte } from '@/screens/Pasaporte';
import { LlegadaPais } from '@/screens/LlegadaPais';
import type { LlegadaInfo } from '@/screens/LlegadaPais';
import type { ActivityResult } from '@/activities/types';

type View =
  | { tag: 'select' }
  | { tag: 'home' }
  | { tag: 'session'; session: DailySession }
  | { tag: 'pasaporte' }
  | { tag: 'llegada'; llegada: LlegadaInfo; session: DailySession };

export default function App() {
  const [state, setState] = useState<ProgressState>(() => loadProgress());
  const [view, setView] = useState<View>(() => {
    const s = loadProgress();
    return { tag: s.perfilActivo ? 'home' : 'select' };
  });
  const [etapaInfo, setEtapaInfo] = useState<EtapaInfo | null>(null);

  useEffect(() => saveProgress(state), [state]);

  useEffect(() => {
    loadEtapaInfo()
      .then(setEtapaInfo)
      .catch(() => setEtapaInfo({ activityIds: {}, criterios: {} }));
  }, []);

  // Rollover de día al montar
  useEffect(() => {
    if (!state.perfilActivo) return;
    const p = state.porPerfil[state.perfilActivo];
    if (!p) return;
    const rolled = rolloverDay(p);
    if (rolled !== p) {
      setState((s) => ({
        ...s,
        porPerfil: { ...s.porPerfil, [s.perfilActivo!]: rolled },
      }));
    }
  }, []);

  const progress = getActiveProgress(state);
  const profile = state.perfilActivo
    ? state.perfiles.find((p) => p.id === state.perfilActivo) ?? null
    : null;

  const handleActivityDone = (
    activity: Activity,
    result: ActivityResult,
    tiempoS: number,
  ) => {
    setState((s) => {
      let next = recordActivity(s, activity, result.acierto, result.intentos, tiempoS);
      if (!etapaInfo) return next;
      const perfilId = next.perfilActivo;
      if (!perfilId) return next;
      const perfil = next.porPerfil[perfilId];
      if (!perfil) return next;
      const nuevoViaje = evaluarSellos(perfil.viaje, perfil.actividadesCompletadas, etapaInfo);
      if (nuevoViaje === perfil.viaje) return next;
      return {
        ...next,
        porPerfil: { ...next.porPerfil, [perfilId]: { ...perfil, viaje: nuevoViaje } },
      };
    });
  };

  if (view.tag === 'select' || !profile) {
    return (
      <ProfileSelect
        state={state}
        onSelect={(id) => {
          setState((s) => setActiveProfile(s, id));
          setView({ tag: 'home' });
        }}
        onCreate={(p) => {
          setState((s) => addProfile(s, p));
          setView({ tag: 'home' });
        }}
      />
    );
  }

  if (view.tag === 'home') {
    return (
      <Home
        profile={profile}
        progress={progress}
        onStartSession={(session, llegada) => {
          if (llegada) {
            setView({ tag: 'llegada', llegada, session });
          } else {
            setView({ tag: 'session', session });
          }
        }}
        onChangeEtapaActual={(etapaId) => {
          setState((s) => setEtapaActual(s, etapaId));
        }}
        onSwitchProfile={() => setView({ tag: 'select' })}
        onShowPasaporte={() => setView({ tag: 'pasaporte' })}
      />
    );
  }

  if (view.tag === 'pasaporte') {
    return <Pasaporte progress={progress} onBack={() => setView({ tag: 'home' })} />;
  }

  if (view.tag === 'llegada') {
    const { llegada, session } = view;
    return (
      <LlegadaPais
        etapa={llegada.etapa}
        capitulo={llegada.capitulo}
        datosPais={llegada.ruta.datos_paises[llegada.etapa.pais] ?? null}
        onContinuar={() => {
          const perfilId = state.perfilActivo;
          if (perfilId) {
            const criterio = llegada.capitulo.completado_criterio;
            setState((s) => {
              const perfil = s.porPerfil[perfilId];
              if (!perfil) return s;
              const nuevoViaje = marcarCapituloVisto(perfil.viaje, llegada.etapa.id, criterio);
              if (nuevoViaje === perfil.viaje) return s;
              return {
                ...s,
                porPerfil: { ...s.porPerfil, [perfilId]: { ...perfil, viaje: nuevoViaje } },
              };
            });
          }
          setView({ tag: 'session', session });
        }}
      />
    );
  }

  return (
    <SessionRunner
      session={view.session}
      onActivityDone={handleActivityDone}
      onFinish={() => setView({ tag: 'home' })}
    />
  );
}
