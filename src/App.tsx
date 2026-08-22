import { useEffect, useRef, useState } from 'react';
import type { Activity, DailySession, ProgressState, Ruta } from '@/types';
import {
  addProfile,
  getActiveProgress,
  loadProgress,
  nivelDeXP,
  recalcularPiezasAvatar,
  recordActivity,
  restoreFromBackup,
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
import { retosNuevosEntreNiveles, todosLosRetosCompletados } from '@/lib/retos';
import { loadRetos } from '@/lib/content';
import { loadRuta } from '@/lib/ruta';
import {
  calcularEstrellas,
  evaluarSellos,
  loadEtapaInfo,
  marcarCapituloVisto,
  marcarRetoFinalCelebrado,
  pasaporteCompleto,
} from '@/lib/sellos';
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
import { Ajustes } from '@/screens/Ajustes';
import { LlegadaPais } from '@/screens/LlegadaPais';
import type { LlegadaInfo } from '@/screens/LlegadaPais';
import { Diploma } from '@/screens/Diploma';
import { LevelUpModal } from '@/components/LevelUpModal';
import { CelebracionFinalModal } from '@/components/CelebracionFinalModal';
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
  | { tag: 'ajustes' }
  | { tag: 'curiosidad'; xpGanado: number }
  | { tag: 'llegada'; llegada: LlegadaInfo; session: DailySession }
  | { tag: 'diploma' };

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
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [retos, setRetos] = useState<Activity[]>([]);
  const [subioNivel, setSubioNivel] = useState<NivelDef | null>(null);
  const [piezaNueva, setPiezaNueva] = useState<PiezaAvatar | null>(null);
  const [retoNuevo, setRetoNuevo] = useState<Activity | null>(null);
  const [celebracionFinal, setCelebracionFinal] = useState(false);
  // XP acumulado en la sesión en curso (ref para leerlo en el momento de terminar).
  const xpSesionRef = useRef(0);
  // Si la sesión en curso incluyó (y superó) el Gran Reto Final, al terminar
  // se va directo al Diploma en vez de a la Curiosidad del día.
  const diplomaListoRef = useRef(false);

  useEffect(() => saveProgress(state), [state]);

  useEffect(() => {
    loadEtapaInfo()
      .then(setEtapaInfo)
      .catch(() => setEtapaInfo({ activityIds: {}, criterios: {}, totalPorNivel: {} }));
  }, []);

  useEffect(() => {
    loadRuta().then(setRuta).catch(() => setRuta(null));
  }, []);

  // Detecta el momento en que se cumplen A LA VEZ las dos condiciones del
  // Gran Reto Final — pasaporte completo (todos los sellos obligatorios) Y
  // todos los demás Retos del Camino superados — y dispara la celebración
  // especial una única vez, guardando la marca en el progreso para no
  // repetirla en sesiones futuras. Se re-evalúa en cada cambio de `state` (o
  // de `retos`, aún cargando de forma asíncrona) porque un sello o un reto
  // pueden completarse desde varios sitios, no solo desde un único punto.
  useEffect(() => {
    if (!ruta || !state.perfilActivo) return;
    const perfilId = state.perfilActivo;
    const perfil = state.porPerfil[perfilId];
    if (!perfil || perfil.viaje.retoFinalCelebrado) return;
    if (!pasaporteCompleto(ruta, perfil.viaje)) return;
    if (!todosLosRetosCompletados(retos, perfil.actividadesCompletadas)) return;
    setCelebracionFinal(true);
    setState((s) => {
      const p = s.porPerfil[perfilId];
      if (!p || p.viaje.retoFinalCelebrado) return s;
      return {
        ...s,
        porPerfil: { ...s.porPerfil, [perfilId]: { ...p, viaje: marcarRetoFinalCelebrado(p.viaje) } },
      };
    });
  }, [ruta, retos, state]);

  // Recalcula las piezas de avatar desbloqueadas del perfil activo al
  // cargarlo (no solo al ganar FP nuevo): si las reglas de nivel cambian
  // (p.ej. la compresión de la curva de FP de julio de 2026), un perfil sin
  // actividad nueva se queda con esa lista calculada bajo las reglas viejas.
  useEffect(() => {
    if (!state.perfilActivo) return;
    setState((s) => {
      const perfilId = s.perfilActivo;
      if (!perfilId) return s;
      const perfil = s.porPerfil[perfilId];
      if (!perfil) return s;
      const recalculado = recalcularPiezasAvatar(perfil);
      if (recalculado === perfil) return s;
      return { ...s, porPerfil: { ...s.porPerfil, [perfilId]: recalculado } };
    });
  }, [state.perfilActivo]);

  // Recalcula sellos/estrellas del perfil activo en cuanto `etapaInfo` esté
  // disponible (o al cambiar de perfil). Cubre dos casos que `handleActivityDone`
  // por sí solo no cubre: una actividad completada justo antes de que termine
  // de cargar `etapaInfo` (la comprobación de esa actividad se habría saltado
  // en silencio), y actividades ya completadas en sesiones anteriores cuyo
  // sello no se otorgó porque en ese momento el criterio no era alcanzable.
  useEffect(() => {
    if (!etapaInfo || !state.perfilActivo) return;
    setState((s) => {
      const perfilId = s.perfilActivo;
      if (!perfilId) return s;
      const perfil = s.porPerfil[perfilId];
      if (!perfil) return s;
      const conSellos = evaluarSellos(perfil.viaje, perfil.actividadesCompletadas, etapaInfo);
      const nuevoViaje = calcularEstrellas(conSellos, perfil.actividadesCompletadas, etapaInfo);
      if (nuevoViaje === perfil.viaje) return s;
      return {
        ...s,
        porPerfil: { ...s.porPerfil, [perfilId]: { ...perfil, viaje: nuevoViaje } },
      };
    });
  }, [etapaInfo, state.perfilActivo]);

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
    // Detección de subida de nivel (mismo cálculo de XP que recordActivity,
    // incluida la regla de que un reto especial ya superado no vuelve a dar XP).
    const yaSuperado = activity.esReto && progress.actividadesCompletadas[activity.id]?.acierto === true;
    const gained = result.acierto && !yaSuperado ? activity.xp : 0;
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
    if (activity.desbloqueo_pasaporte_completo && result.acierto) {
      diplomaListoRef.current = true;
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
    diplomaListoRef.current = false;
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
        etapaInfo={etapaInfo}
        onStartSession={(session, llegada) => {
          xpSesionRef.current = 0;
          diplomaListoRef.current = false;
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
        onShowAjustes={() => setView({ tag: 'ajustes' })}
      />
    );
  } else if (view.tag === 'pasaporte') {
    content = (
      <Pasaporte
        nivel={profile.nivel}
        progress={progress}
        etapaInfo={etapaInfo}
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
        retos={retos}
        onBack={() => setView({ tag: 'home' })}
        onIrReto={() => setView({ tag: 'retos' })}
        onShowAvatar={() => setView({ tag: 'avatar' })}
        onShowDiploma={() => setView({ tag: 'diploma' })}
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
  } else if (view.tag === 'ajustes') {
    content = (
      <Ajustes
        profile={profile}
        progress={progress}
        onRestore={(rawProfile, rawProgress) => {
          setState((s) => restoreFromBackup(s, rawProfile, rawProgress));
        }}
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
        nivel={profile.nivel}
        progress={progress}
        etapaInfo={etapaInfo}
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
  } else if (view.tag === 'diploma') {
    content = (
      <Diploma
        profile={profile}
        progress={progress}
        ruta={ruta}
        onBack={() => setView({ tag: 'home' })}
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
        progress={progress}
        etapaInfo={etapaInfo}
        nivel={profile.nivel}
        onActivityDone={handleActivityDone}
        onFinish={() => {
          if (diplomaListoRef.current) {
            diplomaListoRef.current = false;
            setView({ tag: 'diploma' });
          } else {
            setView({ tag: 'curiosidad', xpGanado: xpSesionRef.current });
          }
        }}
      />
    );
  }

  return (
    <>
      {content}
      {celebracionFinal ? (
        <CelebracionFinalModal
          retoFinal={retos.find((r) => r.desbloqueo_pasaporte_completo) ?? null}
          onIrReto={() => {
            const reto = retos.find((r) => r.desbloqueo_pasaporte_completo);
            setCelebracionFinal(false);
            if (reto) empezarReto(reto);
          }}
          onCerrar={() => setCelebracionFinal(false)}
        />
      ) : (
        subioNivel &&
        profile && (
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
        )
      )}
    </>
  );
}
