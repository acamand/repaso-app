import type { Capitulo, DatosPais, Etapa, Ruta } from '@/types';
import { Flag } from '@/components/Flag';

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
  onContinuar: () => void;
}

export function LlegadaPais({ etapa, capitulo, datosPais, onContinuar }: Props) {
  const codigo = datosPais?.codigo ?? '??';
  const subtitulo = [datosPais?.capital, datosPais?.idioma, datosPais?.moneda]
    .filter((s) => s && s !== '—')
    .join(' · ');

  const criterioTexto =
    capitulo.completado_criterio.tipo === 'actividades_etapa_min'
      ? `Lo conseguirás al completar ${capitulo.completado_criterio.valor} actividades de esta etapa.`
      : 'Sello automático al llegar a la etapa.';

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
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-center shadow-md border-2 shrink-0"
              style={{
                backgroundColor: capitulo.sello.color_fondo,
                color: capitulo.sello.color_texto,
                borderColor: capitulo.sello.color_texto,
              }}
              title={capitulo.sello.descripcion}
            >
              <div className="font-display text-2xl leading-none">{codigo}</div>
            </div>
            <div className="flex-1 text-sm leading-relaxed">
              <div>{capitulo.sello.descripcion}</div>
              <div className="text-xs text-paper-700 mt-2">{criterioTexto}</div>
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
