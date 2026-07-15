import { useEffect, useState } from 'react';
import type { Capitulo, Etapa, PerPerfilProgress, Ruta, Sello } from '@/types';
import { getDatosPais, loadCapitulo, loadRuta } from '@/lib/ruta';
import { Flag } from '@/components/Flag';
import { Estrellas } from '@/components/Estrellas';
import { MapaEuropa } from '@/components/MapaEuropa';

interface Props {
  progress: PerPerfilProgress;
  onBack: () => void;
  onVerGuia: (etapaId: string) => void;
}

export function Pasaporte({ progress, onBack, onVerGuia }: Props) {
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [capitulos, setCapitulos] = useState<Record<string, Capitulo | null>>({});
  const [cargando, setCargando] = useState(true);

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

  const sellosCount = Object.keys(progress.viaje.sellos).length;
  const etapasTotal = ruta?.fases.reduce((acc, f) => acc + f.etapas.length, 0) ?? 0;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-paper-300/60 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-paper-700 hover:text-ink shrink-0">
            ← Volver
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-copper">Pasaporte</div>
            <div className="font-display text-lg leading-tight truncate">
              {ruta?.nombre ?? 'Cargando…'}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display text-xl text-slate leading-none">
              {sellosCount}
              <span className="text-paper-500 text-sm"> / {etapasTotal}</span>
            </div>
            <div className="text-[0.65rem] text-paper-700 uppercase tracking-wider">sellos</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {cargando && <p className="text-paper-700 text-center py-10">Abriendo el pasaporte…</p>}
        {!cargando && !ruta && (
          <p className="text-brick text-center py-10">No se pudo cargar la ruta del viaje.</p>
        )}

        {ruta && (
          <MapaEuropa
            ruta={ruta}
            capitulos={capitulos}
            progress={progress}
            etapaActualId={progress.viaje.etapaActualId}
            onVerGuia={onVerGuia}
          />
        )}

        {ruta && (
          <div className="text-xs uppercase tracking-[0.2em] text-paper-500 text-center pt-2">
            Sellos del pasaporte
          </div>
        )}

        {ruta?.fases.map((fase) => (
          <section key={fase.id}>
            <div className="flex items-baseline justify-between mb-3 px-1">
              <h2 className="font-display text-xl">{fase.nombre}</h2>
              <span className="text-xs text-paper-700">{fase.etapas.length} etapas</span>
            </div>
            <div className="space-y-3">
              {fase.etapas.map((etapa) => (
                <PaginaPasaporte
                  key={etapa.id}
                  etapa={etapa}
                  ruta={ruta}
                  capitulo={capitulos[etapa.id] ?? null}
                  sello={progress.viaje.sellos[etapa.id] ?? null}
                  estrellas={progress.viaje.estrellas[etapa.id] ?? 0}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

interface PaginaProps {
  etapa: Etapa;
  ruta: Ruta;
  capitulo: Capitulo | null;
  sello: Sello | null;
  estrellas: number;
}

function PaginaPasaporte({ etapa, ruta, capitulo, sello, estrellas }: PaginaProps) {
  const datos = getDatosPais(ruta, etapa.pais);
  return (
    <div className={`card p-4 flex items-center gap-4 ${etapa.opcional ? 'opacity-60' : ''}`}>
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
          {[datos?.capital, datos?.moneda].filter((s) => s && s !== '—').join(' · ')}
        </div>
        {sello && (
          <div className="mt-1.5">
            <Estrellas conseguidas={estrellas} size={15} />
          </div>
        )}
        {etapa.opcional && (
          <div className="text-[0.65rem] uppercase tracking-wider text-paper-500 mt-0.5">
            opcional
          </div>
        )}
      </div>
      <SelloRedondel codigo={datos?.codigo ?? '??'} capitulo={capitulo} sello={sello} />
    </div>
  );
}

interface SelloProps {
  codigo: string;
  capitulo: Capitulo | null;
  sello: Sello | null;
}

function SelloRedondel({ codigo, capitulo, sello }: SelloProps) {
  if (sello) {
    const fondo = capitulo?.sello.color_fondo ?? '#2E5C7E';
    const texto = capitulo?.sello.color_texto ?? '#FFFFFF';
    return (
      <div
        className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-center shadow-md -rotate-6 border-2 shrink-0"
        style={{ backgroundColor: fondo, color: texto, borderColor: texto }}
        title={capitulo?.sello.descripcion}
      >
        <div className="font-display text-2xl leading-none">{codigo}</div>
        <div className="text-[0.6rem] mt-1 opacity-90 font-mono">{formateaFecha(sello.fecha)}</div>
      </div>
    );
  }
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed border-paper-500 text-paper-500 text-2xl shrink-0"
      title="Pendiente"
    >
      ?
    </div>
  );
}

function formateaFecha(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}`;
}
