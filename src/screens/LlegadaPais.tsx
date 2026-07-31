import type { Capitulo, DatosPais, Etapa, Nivel, PerPerfilProgress, Ruta } from '@/types';
import { descripcionSelloVisible } from '@/lib/selloIcono';
import { progresoSello } from '@/lib/sellos';
import type { EtapaInfo } from '@/lib/sellos';
import { Flag } from '@/components/Flag';
import { IlustracionPais } from '@/components/IlustracionPais';
import { SelloBadge } from '@/components/SelloBadge';

/** Payload de navegación cuando hay que mostrar la llegada antes de la sesión. */
export interface LlegadaInfo {
  etapa: Etapa;
  capitulo: Capitulo;
  ruta: Ruta;
}

interface Props {
  etapa: Etapa;
  capitulo: Capitulo;
  datosPais: DatosPais | null;
  nivel: Nivel;
  progress: PerPerfilProgress;
  etapaInfo: EtapaInfo | null;
  onContinuar: () => void;
}

export function LlegadaPais({ etapa, capitulo, datosPais, nivel, progress, etapaInfo, onContinuar }: Props) {
  const codigo = datosPais?.codigo ?? '??';
  const subtitulo = [datosPais?.capital, datosPais?.idioma, datosPais?.moneda]
    .filter((s) => s && s !== '—')
    .join(' · ');

  const progreso = etapaInfo
    ? progresoSello(etapa.id, nivel, progress.actividadesCompletadas, etapaInfo)
    : null;

  const criterioTexto = progreso
    ? `Completa ${progreso.objetivo} actividades de esta etapa para conseguirlo (llevas ${progreso.completadas} de ${progreso.objetivo}${progreso.total > progreso.objetivo ? ` de ${progreso.total} disponibles` : ''}).`
    : capitulo.completado_criterio.tipo === 'actividades_etapa_min'
      ? `Lo conseguirás al completar ${capitulo.completado_criterio.valor} actividades de esta etapa.`
      : 'Sello automático al llegar a la etapa.';

  const descripcion = descripcionSelloVisible(capitulo.sello.descripcion);

  return (
    <div className="min-h-dvh">
      <section className="bg-parchment2/60 border-b border-paper-300 px-4 py-8 text-center">
        <Flag
          codigo={codigo}
          className="w-32 h-20 mx-auto rounded shadow-md border border-paper-300/40"
        />
        <div className="text-xs uppercase tracking-[0.25em] text-copper mt-4">Llegada</div>
        <h1 className="font-display text-4xl mt-1">{etapa.pais}</h1>
        {subtitulo && <div className="text-sm text-paper-700 mt-2">{subtitulo}</div>}
      </section>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex justify-center">
          <IlustracionPais pais={etapa.pais} size={140} />
        </div>

        <p className="text-base leading-relaxed">{capitulo.intro}</p>

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

        {capitulo.frases_idioma.length > 0 && (
          <section>
            <h2 className="font-display text-xl mb-3">Frases del idioma</h2>
            <div className="space-y-2">
              {capitulo.frases_idioma.map((f, i) => (
                <div key={i} className="card p-3">
                  <div className="font-display text-base">{f.original}</div>
                  <div className="text-sm text-paper-700 mt-1">{f.traduccion}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-xl mb-3">El sello</h2>
          <div className="card p-4 flex items-center gap-4">
            <SelloBadge
              codigo={codigo}
              descripcion={capitulo.sello.descripcion}
              colorFondo={capitulo.sello.color_fondo}
              colorTexto={capitulo.sello.color_texto}
              size={80}
            />
            <div className="flex-1 text-sm leading-relaxed">
              {descripcion && <div>{descripcion}</div>}
              <div className="text-xs text-paper-700 mt-2">{criterioTexto}</div>
              {progreso && (
                <div className="h-1.5 bg-parchment2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-slate to-mustard transition-all"
                    style={{ width: `${Math.max(4, (progreso.completadas / progreso.objetivo) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <button onClick={onContinuar} className="btn-primary w-full">
          Empezar el capítulo
        </button>
      </main>
    </div>
  );
}
