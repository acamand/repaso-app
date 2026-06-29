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
} from '@/lib/progress';
import { ProfileSelect } from '@/screens/ProfileSelect';
import { Home } from '@/screens/Home';
import { SessionRunner } from '@/screens/SessionRunner';
import type { ActivityResult } from '@/activities/types';

type View = { tag: 'select' } | { tag: 'home' } | { tag: 'session'; session: DailySession };

export default function App() {
  const [state, setState] = useState<ProgressState>(() => loadProgress());
  const [view, setView] = useState<View>(() => {
    const s = loadProgress();
    return { tag: s.perfilActivo ? 'home' : 'select' };
  });

  useEffect(() => saveProgress(state), [state]);

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
        onStartSession={(session) => setView({ tag: 'session', session })}
        onSwitchProfile={() => setView({ tag: 'select' })}
      />
    );
  }

  return (
    <SessionRunner
      session={view.session}
      onActivityDone={(activity: Activity, result: ActivityResult, tiempoS: number) => {
        setState((s) => recordActivity(s, activity, result.acierto, result.intentos, tiempoS));
      }}
      onFinish={() => setView({ tag: 'home' })}
    />
  );
}
