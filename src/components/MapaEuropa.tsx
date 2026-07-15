import { useState } from 'react';
import type { Capitulo, Etapa, PerPerfilProgress, Ruta } from '@/types';
import { getDatosPais, getEtapa, listaEtapasEnOrden } from '@/lib/ruta';
import { Flag } from '@/components/Flag';
import { Estrellas } from '@/components/Estrellas';
import { CENTRO, EUROPA_VIEWBOX, FORMAS } from '@/components/europaGeo';

interface Props {
  ruta: Ruta;
  capitulos: Record<string, Capitulo | null>;
  progress: PerPerfilProgress;
  etapaActualId: string;
  onVerGuia: (etapaId: string) => void;
}

const AZUL_MAR = '#DCEAF2';
const GRIS = '#E5E5E5';
const BEIGE = '#EAE4D7';

interface PaisInfo {
  pais: string;
  etapas: Etapa[];
  visitado: boolean;
  color: string;
  colorTexto: string;
  estrellas: number;
  etapaRepresentativa: string;
}

function resumenPais(
  pais: string,
  ruta: Ruta,
  capitulos: Record<string, Capitulo | null>,
  progress: PerPerfilProgress,
): PaisInfo {
  const etapas = listaEtapasEnOrden(ruta).filter((e) => e.pais === pais);
  let visitado = false;
  let color = BEIGE;
  let colorTexto = '#5C5546';
  let estrellas = 0;
  for (const e of etapas) {
    if (progress.viaje.sellos[e.id]) {
      visitado = true;
      const cap = capitulos[e.id]?.sello;
      if (cap) {
        color = cap.color_fondo;
        colorTexto = cap.color_texto;
      }
    }
    estrellas = Math.max(estrellas, progress.viaje.estrellas[e.id] ?? 0);
  }
  return { pais, etapas, visitado, color, colorTexto, estrellas, etapaRepresentativa: etapas[0]?.id ?? '' };
}

export function MapaEuropa({ ruta, capitulos, progress, etapaActualId, onVerGuia }: Props) {
  const [selPais, setSelPais] = useState<string | null>(null);

  const paisActual = getEtapa(ruta, etapaActualId)?.pais ?? null;

  // Línea de la ruta pasando por el marcador de cada país, en orden. Las
  // travesías en ferry no tienen marcador propio (son "Mar Báltico", sin
  // forma en el mapa); se anota su punto medio para dibujar un barco encima
  // del tramo entre el país anterior y el siguiente.
  const puntos: Array<{ x: number; y: number }> = [];
  const barcos: Array<{ x: number; y: number }> = [];
  let ultimo = '';
  let travesiaPendiente = false;
  for (const e of listaEtapasEnOrden(ruta)) {
    if (e.tipo === 'travesia') {
      travesiaPendiente = true;
      continue;
    }
    const c = CENTRO[e.pais];
    if (!c || e.pais === ultimo) continue;
    if (travesiaPendiente && puntos.length > 0) {
      const prev = puntos[puntos.length - 1];
      barcos.push({ x: (prev.x + c.x) / 2, y: (prev.y + c.y) / 2 });
      travesiaPendiente = false;
    }
    puntos.push(c);
    ultimo = e.pais;
  }
  const linea = puntos.map((p) => `${p.x},${p.y}`).join(' ');

  const sel = selPais ? resumenPais(selPais, ruta, capitulos, progress) : null;
  const selDatos = selPais ? getDatosPais(ruta, selPais) : null;
  const centroActual = paisActual ? CENTRO[paisActual] : null;

  return (
    <div>
      <div className="card p-2 overflow-hidden">
        <svg
          viewBox={EUROPA_VIEWBOX}
          className="w-full h-auto rounded-[10px]"
          role="img"
          aria-label="Mapa de Europa con la ruta del viaje"
        >
          {/* mar */}
          <rect x="0" y="0" width="100%" height="100%" fill={AZUL_MAR} />

          {/* países */}
          {FORMAS.map((forma) => {
            let fill = GRIS;
            if (forma.ruta) {
              const info = resumenPais(forma.nombre, ruta, capitulos, progress);
              fill = info.visitado ? info.color : BEIGE;
            }
            const esActual = forma.ruta && forma.nombre === paisActual;
            const esSel = forma.ruta && forma.nombre === selPais;
            return (
              <path
                key={forma.nombre}
                d={forma.d}
                fill={fill}
                stroke={esActual ? '#2E5C7E' : esSel ? '#B85C38' : '#B9B2A2'}
                strokeWidth={esActual ? 5 : esSel ? 3.5 : 1.3}
                strokeLinejoin="round"
                onClick={forma.ruta ? () => setSelPais(forma.nombre) : undefined}
                className={forma.ruta ? 'cursor-pointer' : ''}
              />
            );
          })}

          {/* ruta punteada (no intercepta clics) */}
          <polyline
            points={linea}
            fill="none"
            stroke="#B85C38"
            strokeWidth="3.5"
            strokeDasharray="3 10"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pointerEvents: 'none' }}
          />

          {/* etiquetas de código de los países de la ruta (salvo el actual, que tapa la caravana) */}
          {Object.keys(CENTRO).map((pais) => {
            if (pais === paisActual) return null;
            const c = CENTRO[pais];
            const info = resumenPais(pais, ruta, capitulos, progress);
            const datos = getDatosPais(ruta, pais);
            return (
              <text
                key={`lbl-${pais}`}
                x={c.x}
                y={c.y + 6}
                textAnchor="middle"
                fontSize="20"
                fontWeight="700"
                fill={info.visitado ? info.colorTexto : '#8A7F68'}
                style={{ pointerEvents: 'none' }}
              >
                {datos?.codigo}
              </text>
            );
          })}

          {/* barquitos sobre los tramos de ferry */}
          {barcos.map((b, i) => (
            <text
              key={`barco-${i}`}
              x={b.x}
              y={b.y + 7}
              textAnchor="middle"
              fontSize="22"
              style={{ pointerEvents: 'none' }}
            >
              🚢
            </text>
          ))}

          {/* autocaravana sobre el país actual */}
          {centroActual && <Camper cx={centroActual.x} cy={centroActual.y} />}
        </svg>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 px-1 text-[0.65rem] text-paper-700">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-slate" /> visitado
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm border border-paper-500" style={{ backgroundColor: BEIGE }} />{' '}
            por visitar
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm border border-paper-300" style={{ backgroundColor: GRIS }} />{' '}
            fuera de ruta
          </span>
          <span className="flex items-center gap-1">🚐 estáis aquí</span>
        </div>
      </div>

      {/* Panel del país seleccionado */}
      {sel && (
        <div className="card p-4 mt-3">
          <div className="flex items-center gap-3">
            <Flag
              codigo={selDatos?.codigo ?? '??'}
              className="w-12 h-8 rounded-sm shadow-sm shrink-0 border border-paper-300/40"
            />
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg leading-tight">{sel.pais}</div>
              {sel.visitado ? (
                <Estrellas conseguidas={sel.estrellas} size={14} className="mt-1" />
              ) : (
                <div className="text-xs text-paper-500">Aún no visitado</div>
              )}
            </div>
            {sel.visitado && (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-display shrink-0 border-2 -rotate-6"
                style={{ backgroundColor: sel.color, color: sel.colorTexto, borderColor: sel.colorTexto }}
              >
                {selDatos?.codigo}
              </div>
            )}
          </div>
          <button
            onClick={() => onVerGuia(sel.etapaRepresentativa)}
            className="btn-secondary w-full mt-3 text-sm py-2"
            disabled={!sel.etapaRepresentativa}
          >
            Ver en la guía de viaje →
          </button>
        </div>
      )}
      {!sel && (
        <p className="text-xs text-paper-700 text-center mt-3">
          Toca un país de la ruta para ver su información.
        </p>
      )}
    </div>
  );
}

/** Autocaravana cartoon blanca con detalles slate: ventanitas, ruedas y banderita. */
function Camper({ cx, cy }: { cx: number; cy: number }) {
  // Posición en el <g> exterior; animación de flotado en el interior (si no, la
  // CSS `transform` de la animación sobrescribiría el transform de posición).
  return (
    <g transform={`translate(${cx},${cy}) scale(1.5)`} style={{ pointerEvents: 'none' }}>
      <g className="van-bob">
        {/* sombra */}
        <ellipse cx="0" cy="17" rx="26" ry="4.5" fill="#0F2027" opacity="0.15" />
        {/* banderita */}
        <line x1="-19" y1="-13" x2="-19" y2="-25" stroke="#2E5C7E" strokeWidth="1.6" />
        <path d="M-19 -25 L-8 -21.5 L-19 -18 Z" fill="#B85C38" />
        {/* cuerpo */}
        <rect x="-27" y="-12" width="47" height="25" rx="8" fill="#FFFFFF" stroke="#2E5C7E" strokeWidth="2.2" />
        {/* morro / cabina */}
        <path d="M20 -5 L31 1 L31 13 L20 13 Z" fill="#FFFFFF" stroke="#2E5C7E" strokeWidth="2.2" strokeLinejoin="round" />
        {/* franja slate */}
        <rect x="-27" y="5" width="47" height="4" fill="#2E5C7E" opacity="0.85" />
        {/* ventanas */}
        <rect x="-22" y="-8" width="13" height="9" rx="2.4" fill="#8FB8CE" />
        <rect x="-6" y="-8" width="13" height="9" rx="2.4" fill="#8FB8CE" />
        <path d="M21 -2 L29 2 L29 10 L21 10 Z" fill="#8FB8CE" />
        {/* línea de puerta */}
        <line x1="8" y1="-8" x2="8" y2="5" stroke="#2E5C7E" strokeWidth="1" opacity="0.45" />
        {/* ruedas */}
        <circle cx="-14" cy="14" r="5.2" fill="#2B2B2B" />
        <circle cx="-14" cy="14" r="2" fill="#C9C9C9" />
        <circle cx="16" cy="14" r="5.2" fill="#2B2B2B" />
        <circle cx="16" cy="14" r="2" fill="#C9C9C9" />
      </g>
    </g>
  );
}
