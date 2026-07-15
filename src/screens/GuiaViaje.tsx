import { useEffect, useState } from 'react';
import type { Capitulo, DatosPais, Etapa, PerPerfilProgress, Ruta } from '@/types';
import { getDatosPais, loadCapitulo, loadRuta } from '@/lib/ruta';
import { Flag } from '@/components/Flag';

interface Props {
  progress: PerPerfilProgress;
  onBack: () => void;
  /** Si se indica, abre directamente el detalle de esa etapa al entrar. */
  etapaInicial?: string;
}

export function GuiaViaje({ progress, onBack, etapaInicial }: Props) {
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [capitulos, setCapitulos] = useState<Record<string, Capitulo | null>>({});
  const [cargando, setCargando] = useState(true);
  const [detalle, setDetalle] = useState<string | null>(etapaInicial ?? null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const r = await loadRuta();
      if (cancelado) return;
      setRuta(r);
      if (!r) {
        setCargando(false);
        return;
      }
      const etapaIds = r.fases.flatMap((f) => f.etapas.map((e) => e.id));
      const caps = await Promise.all(etapaIds.map((id) => loadCapitulo(id)));
      if (cancelado) return;
      const map: Record<string, Capitulo | null> = {};
      etapaIds.forEach((id, i) => { map[id] = caps[i]; });
      setCapitulos(map);
      setCargando(false);
    })();
    return () => { cancelado = true; };
  }, []);

  const visitado = (etapaId: string) => etapaId in progress.viaje.sellos;

  if (detalle && ruta) {
    const etapa = ruta.fases.flatMap((f) => f.etapas).find((e) => e.id === detalle);
    const capitulo = capitulos[detalle];
    const datos = etapa ? getDatosPais(ruta, etapa.pais) : null;
    if (etapa && capitulo) {
      return (
        <DetallePais
          etapa={etapa}
          capitulo={capitulo}
          datosPais={datos}
          visitado={visitado(detalle)}
          onBack={() => setDetalle(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-paper-700 hover:text-ink shrink-0">
            ← Volver
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-copper">Guía de viaje</div>
            <div className="font-display text-lg leading-tight truncate">
              {ruta?.nombre ?? 'Cargando…'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {cargando && <p className="text-paper-700 text-center py-10">Cargando la guía…</p>}
        {!cargando && !ruta && (
          <p className="text-brick text-center py-10">No se pudo cargar la ruta del viaje.</p>
        )}
        {ruta?.fases.map((fase) => (
          <section key={fase.id}>
            <h2 className="font-display text-xl mb-3 px-1">{fase.nombre}</h2>
            <div className="space-y-2">
              {fase.etapas.map((etapa) => {
                const datos = getDatosPais(ruta, etapa.pais);
                const cap = capitulos[etapa.id];
                const esVisitado = visitado(etapa.id);
                const tieneDatos = cap !== null && cap !== undefined;
                return (
                  <button
                    key={etapa.id}
                    onClick={() => tieneDatos ? setDetalle(etapa.id) : undefined}
                    disabled={!tieneDatos}
                    className={`card p-4 flex items-center gap-4 w-full text-left transition-opacity
                      ${!esVisitado ? 'opacity-60' : ''}
                      ${tieneDatos ? 'hover:ring-2 hover:ring-copper/40 cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <Flag
                      codigo={datos?.codigo ?? '??'}
                      className="w-14 h-9 rounded-sm shadow-sm shrink-0 border border-paper-300/40"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-base leading-tight flex items-center gap-1.5">
                        {etapa.tipo === 'travesia' && <span aria-hidden>🚢</span>}
                        {etapa.pais}
                      </div>
                      <div className="text-xs text-paper-700 truncate">
                        {[datos?.capital, datos?.idioma].filter((s) => s && s !== '—').join(' · ')}
                      </div>
                    </div>
                    {esVisitado ? (
                      <span className="text-xs text-copper font-medium shrink-0">Visitado</span>
                    ) : (
                      <span className="text-xs text-paper-500 shrink-0">Por visitar</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

interface DetalleProps {
  etapa: Etapa;
  capitulo: Capitulo;
  datosPais: DatosPais | null;
  visitado: boolean;
  onBack: () => void;
}

function DetallePais({ etapa, capitulo, datosPais, visitado, onBack }: DetalleProps) {
  const codigo = datosPais?.codigo ?? '??';
  const subtitulo = [datosPais?.capital, datosPais?.idioma, datosPais?.moneda]
    .filter((s) => s && s !== '—')
    .join(' · ');

  return (
    <div className="min-h-dvh">
      <section className="bg-parchment2/60 border-b border-paper-300 px-4 py-8 text-center relative">
        <button
          onClick={onBack}
          className="absolute top-3 left-4 text-sm text-paper-700 hover:text-ink"
        >
          ← Volver
        </button>
        {!visitado && (
          <div className="absolute top-3 right-4 text-xs text-paper-500 border border-paper-400 rounded-full px-2 py-0.5">
            Aún no visitado
          </div>
        )}
        <Flag
          codigo={codigo}
          className="w-32 h-20 mx-auto rounded shadow-md border border-paper-300/40"
        />
        <h1 className="font-display text-4xl mt-4">{etapa.pais}</h1>
        {subtitulo && <div className="text-sm text-paper-700 mt-2">{subtitulo}</div>}
      </section>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <p className="text-base leading-relaxed">{capitulo.intro}</p>

        {capitulo.datos_curiosos.length > 0 && (
          <section>
            <h2 className="font-display text-xl mb-3">Datos curiosos</h2>
            <ul className="space-y-2 list-none">
              {capitulo.datos_curiosos.map((d, i) => (
                <li key={i} className="card p-3 text-sm leading-relaxed">
                  {d}
                </li>
              ))}
            </ul>
          </section>
        )}

        {capitulo.frases_idioma.length > 0 && (
          <section>
            <h2 className="font-display text-xl mb-3">Frases en el idioma local</h2>
            <div className="space-y-2">
              {capitulo.frases_idioma.map((f, i) => (
                <div key={i} className="card p-3">
                  <div className="font-display text-base">{f.original}</div>
                  <div className="text-sm text-paper-700 mt-1">{f.traduccion}</div>
                  {f.pronunciacion && (
                    <div className="text-xs text-paper-500 mt-1 italic">{f.pronunciacion}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <button onClick={onBack} className="btn-primary w-full">
          Volver a la guía
        </button>
      </main>
    </div>
  );
}
