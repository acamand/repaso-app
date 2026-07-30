import { useEffect, useState } from 'react';
import type { Activity, Capitulo, DailySession, Nivel, PerPerfilProgress } from '@/types';
import { ActivityRenderer } from '@/activities';
import type { ActivityResult } from '@/activities/types';
import { loadCapitulo } from '@/lib/ruta';
import type { EtapaInfo } from '@/lib/sellos';
import { SelloAvisoBanner } from '@/components/SelloAvisoBanner';

interface Props {
  session: DailySession;
  progress: PerPerfilProgress;
  etapaInfo: EtapaInfo | null;
  nivel: Nivel;
  onActivityDone: (activity: Activity, result: ActivityResult, tiempoS: number) => void;
  onFinish: () => void;
}

export function SessionRunner({ session, progress, etapaInfo, nivel, onActivityDone, onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const [inicio, setInicio] = useState(Date.now());
  const [comprobada, setComprobada] = useState(false);
  const [capitulo, setCapitulo] = useState<Capitulo | null>(null);

  const etapaActualId = progress.viaje.etapaActualId;

  useEffect(() => {
    setInicio(Date.now());
    setComprobada(false);
  }, [idx]);

  useEffect(() => {
    let cancelado = false;
    loadCapitulo(etapaActualId)
      .then((c) => !cancelado && setCapitulo(c))
      .catch(() => !cancelado && setCapitulo(null));
    return () => { cancelado = true; };
  }, [etapaActualId]);

  if (session.actividades.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="card p-6 max-w-md text-center">
          <p className="mb-4">No hay actividades en esta sesión.</p>
          <button onClick={onFinish} className="btn-primary">Volver</button>
        </div>
      </div>
    );
  }

  const actual = session.actividades[idx];
  const ultima = idx === session.actividades.length - 1;

  // Contexto del sello de la etapa actual para `actual`, solo si esta
  // actividad concreta es temática de esa etapa, el criterio es por número
  // de actividades y el sello todavía no está conseguido. `null` en
  // cualquier otro caso (nada que destacar).
  const selloContexto = (() => {
    if (!etapaInfo) return null;
    const criterio = etapaInfo.criterios[etapaActualId];
    if (!criterio || criterio.tipo !== 'actividades_etapa_min') return null;
    if (progress.viaje.sellos[etapaActualId]) return null;
    const idsEtapa = etapaInfo.activityIds[etapaActualId] ?? [];
    if (!idsEtapa.includes(actual.id)) return null;
    const objetivo = criterio.valor;
    const completadasAntes = idsEtapa.filter((id) => progress.actividadesCompletadas[id]).length;
    const total = etapaInfo.totalPorNivel[etapaActualId]?.[nivel] ?? idsEtapa.length;
    const yaContababaAntes = !!progress.actividadesCompletadas[actual.id];
    const completadasDespues = Math.min(completadasAntes + (yaContababaAntes ? 0 : 1), objetivo);
    const restantesDespues = Math.max(0, objetivo - completadasDespues);
    return { objetivo, completadasAntes, total, restantesDespues };
  })();

  const pais = capitulo?.pais ?? '';
  const colorFondo = capitulo?.sello.color_fondo ?? '#2E5C7E';
  const colorTexto = capitulo?.sello.color_texto ?? '#FFFFFF';

  const handleComplete = (result: ActivityResult) => {
    const tiempoS = Math.round((Date.now() - inicio) / 1000);
    onActivityDone(actual, result, tiempoS);
    if (ultima) onFinish();
    else setIdx((i) => i + 1);
  };

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onFinish} className="text-sm text-paper-700 hover:text-ink">
            ← Salir
          </button>
          <div className="flex-1">
            <div className="h-1.5 bg-parchment2 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate transition-all"
                style={{ width: `${((idx + 1) / session.actividades.length) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono text-paper-700 shrink-0">
            {idx + 1} / {session.actividades.length}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {selloContexto && (
          <SelloAvisoBanner
            colorFondo={colorFondo}
            colorTexto={colorTexto}
            icono="🎯"
            titulo={`Esta actividad cuenta para tu sello de ${pais}.`}
            detalle={
              `Llevas ${selloContexto.completadasAntes} de ${selloContexto.objetivo} necesarias` +
              (selloContexto.total > selloContexto.objetivo
                ? ` (este país tiene ${selloContexto.total} actividades especiales en total).`
                : '.')
            }
          />
        )}

        <div
          className={selloContexto ? 'rounded-soft p-1.5 border-[3px]' : ''}
          style={selloContexto ? { borderColor: colorFondo, backgroundColor: `${colorFondo}1F` } : undefined}
        >
          <ActivityRenderer
            key={actual.id}
            activity={actual}
            onChecked={() => setComprobada(true)}
            onComplete={handleComplete}
          />
        </div>

        {selloContexto && comprobada && (
          <SelloAvisoBanner
            colorFondo={colorFondo}
            colorTexto={colorTexto}
            icono="✓"
            titulo={
              selloContexto.restantesDespues === 0
                ? `¡Esta era la última! Consigues tu sello de ${pais} al continuar.`
                : `¡Esta actividad contaba para tu sello de ${pais}!`
            }
            detalle={
              selloContexto.restantesDespues > 0
                ? `Te quedan ${selloContexto.restantesDespues} para conseguirlo.`
                : undefined
            }
          />
        )}
      </main>
    </div>
  );
}
