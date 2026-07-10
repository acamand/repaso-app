import { useEffect, useRef, useState } from 'react';
import type { Activity, DailySession, ProgressState } from '@/types';
import {
  addProfile,
  getActiveProgress,
  loadProgress,
  nivelDeXP,
  recordActivity,
  rolloverDay,
  saveProgress,
  setActiveProfile,
  setAvatarConfig,
  setCuriosidadesVistas,
  setEtapaActual,
  setTutorialVisto,
} from '@/lib/progress';
import { hitosNuevos } from '@/lib/niveles';
import type { NivelDef } from '@/lib/niveles';
import { piezasNuevasEntreNiveles } from '@/lib/avatarPiezas';
import type { PiezaAvatar } from '@/lib/avatarPiezas';
import { retosNuevosEntreNiveles } from '@/lib/retos';
import { loadRetos } from '@/lib/content';
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
import { CuriosidadDia } from '@/screens/CuriosidadDia';
import { AvatarEditor } from '@/screens/AvatarEditor';
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
  | { tag: 'avatar' }
  | { tag: 'curiosidad'; xpGanado: number }
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
  const [retos, setRetos] = useState<Activity[]>([]);
  const [subioNivel, setSubioNivel] = useState<NivelDef | null>(null);
  const [piezaNueva, setPiezaNueva] = useState<PiezaAvatar | null>(null);
  const [retoNuevo, setRetoNuevo] = useState<Activity | null>(null);
  // XP acumulado en la sesión en curso (ref para leerlo en el momento de terminar).
  const xpSesionRef = useRef(0);

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

  // Retos del curso del perfil activo, precargados para poder anunciar en el
  // modal de subida de nivel exactamente cuál se acaba de desbloquear.
  useEffect(() => {
    if (!profile) {
      setRetos([]);
      return;
    }
    loadRetos(profile.nivel)
      .then(setRetos)
      .catch(() => setRetos([]));
  }, [profile?.nivel]);

  const handleActivityDone = (
    activity: Activity,
    result: ActivityResult,
    tiempoS: number,
  ) => {
    // Detección de subida de nivel (mismo cálculo de XP que recordActivity).
    const gained = result.acierto ? activity.xp : 0;
    if (gained > 0) {
      const xpAntes = progress.xpTotal;
      const xpDespues = xpAntes + gained;
      const nuevos = hitosNuevos(xpAntes, xpDespues);
      const nivelAntes = nivelDeXP(xpAntes).nivel;
      const nivelDespues = nivelDeXP(xpDespues).nivel;
      const piezas = piezasNuevasEntreNiveles(nivelAntes, nivelDespues);
      const retosDesbloqueados = retosNuevosEntreNiveles(retos, nivelAntes, nivelDespues);
      if (nuevos.length > 0) {
        setSubioNivel(nuevos[nuevos.length - 1]);
        setPiezaNueva(piezas.length > 0 ? piezas[piezas.length - 1] : null);
        setRetoNuevo(retosDesbloqueados.length > 0 ? retosDesbloqueados[retosDesbloqueados.length - 1] : null);
      }
    }
    // XP acumulado de la sesión, para la Curiosidad del día al terminar.
    xpSesionRef.current += gained;

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
          xpSesionRef.current = 0;
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
        onShowAvatar={() => setView({ tag: 'avatar' })}
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
        onShowAvatar={() => setView({ tag: 'avatar' })}
      />
    );
  } else if (view.tag === 'retos') {
    content = (
      <Retos
        nivel={profile.nivel}
        progress={progress}
        onBack={() => setView({ tag: 'home' })}
        onDoReto={empezarReto}
      />
    );
  } else if (view.tag === 'avatar') {
    content = (
      <AvatarEditor
        avatar={profile.avatar}
        progress={progress}
        onSave={(config) => setState((s) => setAvatarConfig(s, config))}
        onBack={() => setView({ tag: 'home' })}
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
  } else if (view.tag === 'curiosidad') {
    content = (
      <CuriosidadDia
        progress={progress}
        xpGanado={view.xpGanado}
        onCuriosidadesVistas={(vistas) => setState((s) => setCuriosidadesVistas(s, vistas))}
        onVolver={() => setView({ tag: 'home' })}
      />
    );
  } else {
    content = (
      <SessionRunner
        key={view.session.actividades.map((a) => a.id).join(',')}
        session={view.session}
        onActivityDone={handleActivityDone}
        onFinish={() => setView({ tag: 'curiosidad', xpGanado: xpSesionRef.current })}
      />
    );
  }

  return (
    <>
      {content}
      {subioNivel && profile && (
        <LevelUpModal
          hito={subioNivel}
          avatarActual={profile.avatar}
          piezaNueva={piezaNueva}
          retoNuevo={retoNuevo}
          onIrReto={() => {
            const reto = retoNuevo;
            setSubioNivel(null);
            setPiezaNueva(null);
            setRetoNuevo(null);
            if (reto) {
              empezarReto(reto);
            } else {
              setView({ tag: 'retos' });
            }
          }}
          onPersonalizar={() => {
            setSubioNivel(null);
            setPiezaNueva(null);
            setRetoNuevo(null);
            setView({ tag: 'avatar' });
          }}
          onCerrar={() => {
            setSubioNivel(null);
            setPiezaNueva(null);
            setRetoNuevo(null);
          }}
        />
      )}
    </>
  );
}
