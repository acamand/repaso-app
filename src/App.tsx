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
  setTutorialVisto,
} from '@/lib/progress';
import { hitosNuevos } from '@/lib/niveles';
import type { NivelDef } from '@/lib/niveles';
import { calcularEstrellas, evaluarSellos, loadEtapaInfo, marcarCapituloVisto } from '@/lib/sellos';
import type { EtapaInfo } from '@/lib/sellos';
import { ProfileSelect } from '@/screens/ProfileSelect';
import { Home } from '@/screens/Home';
import { SessionRunner } from '@/screens/SessionRunner';
import { Pasaporte } from '@/screens/Pasaporte';
import { GuiaViaje } from '@/screens/GuiaViaje';
import { MisLogros } from '@/screens/MisLogros';
import { Retos } from '@/screens/Retos';
import { Tutorial } from '@/screens/Tutorial';
import { LlegadaPais } from '@/screens/LlegadaPais';
import type { LlegadaInfo } from '@/screens/LlegadaPais';
import { LevelUpModal } from '@/components/LevelUpModal';
import type { ActivityResult } from '@/activities/types';

type View =
  | { tag: 'select' }
  | { tag: 'home' }
  | { tag: 'tutorial' }
  | { tag: 'session'; session: DailySession }
  | { tag: 'pasaporte' }
  | { tag: 'guia'; etapaInicial?: string }
  | { tag: 'logros' }
  | { tag: 'retos' }
  | { tag: 'llegada'; llegada: LlegadaInfo; session: DailySession };

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [state, setState] = useState<ProgressState>(() => loadProgress());
  const [view, setView] = useState<View>(() => {
    const s = loadProgress();
    return { tag: s.perfilActivo ? 'home' : 'select' };
  });
  const [etapaInfo, setEtapaInfo] = useState<EtapaInfo | null>(null);
  const [subioNivel, setSubioNivel] = useState<NivelDef | null>(null);

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
    // Detección de subida de nivel (mismo cálculo de XP que recordActivity).
    const gained = result.acierto ? activity.xp : 0;
    if (gained > 0) {
      const nuevos = hitosNuevos(progress.xpTotal, progress.xpTotal + gained);
      if (nuevos.length > 0) setSubioNivel(nuevos[nuevos.length - 1]);
    }

    setState((s) => {
      const next = recordActivity(s, activity, result.acierto, result.intentos, tiempoS);
      if (!etapaInfo) return next;
      const perfilId = next.perfilActivo;
      if (!perfilId) return next;
      const perfil = next.porPerfil[perfilId];
      if (!perfil) return next;
      const conSellos = evaluarSellos(perfil.viaje, perfil.actividadesCompletadas, etapaInfo);
      const nuevoViaje = calcularEstrellas(conSellos, perfil.actividadesCompletadas, etapaInfo);
      if (nuevoViaje === perfil.viaje) return next;
      return {
        ...next,
        porPerfil: { ...next.porPerfil, [perfilId]: { ...perfil, viaje: nuevoViaje } },
      };
    });
  };

  const empezarReto = (reto: Activity) => {
    setView({
      tag: 'session',
      session: { fecha: hoyISO(), actividades: [reto], duracionEstimadaS: reto.tiempo_estimado_s },
    });
  };

  let content: React.ReactNode;

  if (view.tag === 'select' || !profile) {
    content = (
      <ProfileSelect
        state={state}
        onSelect={(id) => {
          setState((s) => setActiveProfile(s, id));
          const p = state.porPerfil[id];
          setView(p && !p.tutorialVisto ? { tag: 'tutorial' } : { tag: 'home' });
        }}
        onCreate={(p) => {
          setState((s) => addProfile(s, p));
          setView({ tag: 'tutorial' });
        }}
      />
    );
  } else if (view.tag === 'tutorial') {
    content = (
      <Tutorial
        onFinish={() => {
          setState((s) => setTutorialVisto(s));
          setView({ tag: 'home' });
        }}
      />
    );
  } else if (view.tag === 'home') {
    content = (
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
        onShowGuia={() => setView({ tag: 'guia' })}
        onShowLogros={() => setView({ tag: 'logros' })}
        onShowTutorial={() => setView({ tag: 'tutorial' })}
      />
    );
  } else if (view.tag === 'pasaporte') {
    content = (
      <Pasaporte
        progress={progress}
        onBack={() => setView({ tag: 'home' })}
        onVerGuia={(etapaId) => setView({ tag: 'guia', etapaInicial: etapaId })}
      />
    );
  } else if (view.tag === 'guia') {
    content = (
      <GuiaViaje
        progress={progress}
        etapaInicial={view.etapaInicial}
        onBack={() => setView({ tag: 'home' })}
      />
    );
  } else if (view.tag === 'logros') {
    content = (
      <MisLogros
        progress={progress}
        onBack={() => setView({ tag: 'home' })}
        onIrReto={() => setView({ tag: 'retos' })}
      />
    );
  } else if (view.tag === 'retos') {
    content = (
      <Retos
        nivel={profile.nivel}
        onBack={() => setView({ tag: 'home' })}
        onDoReto={empezarReto}
      />
    );
  } else if (view.tag === 'llegada') {
    const { llegada, session } = view;
    content = (
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
  } else {
    content = (
      <SessionRunner
        session={view.session}
        onActivityDone={handleActivityDone}
        onFinish={() => setView({ tag: 'home' })}
      />
    );
  }

  return (
    <>
      {content}
      {subioNivel && (
        <LevelUpModal
          hito={subioNivel}
          onIrReto={() => {
            setSubioNivel(null);
            setView({ tag: 'retos' });
          }}
          onCerrar={() => setSubioNivel(null)}
        />
      )}
    </>
  );
}
