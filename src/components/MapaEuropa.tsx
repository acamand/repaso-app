import { useState } from 'react';
import type { Capitulo, Etapa, PerPerfilProgress, Ruta } from '@/types';
import { getDatosPais, getEtapa, listaEtapasEnOrden } from '@/lib/ruta';
import { Flag } from '@/components/Flag';
import { Estrellas } from '@/components/Estrellas';

interface Props {
  ruta: Ruta;
  capitulos: Record<string, Capitulo | null>;
  progress: PerPerfilProgress;
  etapaActualId: string;
  onVerGuia: (etapaId: string) => void;
}

/** Coordenadas esquemáticas (no geográficas) de cada país en el viewBox 300×370. */
const COORD: Record<string, { x: number; y: number }> = {
  España: { x: 66, y: 300 },
  Francia: { x: 100, y: 244 },
  Bélgica: { x: 112, y: 210 },
  'Países Bajos': { x: 120, y: 190 },
  Alemania: { x: 146, y: 210 },
  Dinamarca: { x: 150, y: 158 },
  Polonia: { x: 188, y: 198 },
  Lituania: { x: 212, y: 172 },
  Letonia: { x: 218, y: 150 },
  Estonia: { x: 218, y: 128 },
  Finlandia: { x: 212, y: 78 },
  Suecia: { x: 172, y: 108 },
  Noruega: { x: 150, y: 58 },
};

interface PaisInfo {
  pais: string;
  etapas: Etapa[];
  visitado: boolean;
  color: string;
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
  let color = '#E4DECF';
  let estrellas = 0;
  for (const e of etapas) {
    if (progress.viaje.sellos[e.id]) {
      visitado = true;
      const c = capitulos[e.id]?.sello.color_fondo;
      if (c) color = c;
    }
    estrellas = Math.max(estrellas, progress.viaje.estrellas[e.id] ?? 0);
  }
  return {
    pais,
    etapas,
    visitado,
    color,
    estrellas,
    etapaRepresentativa: etapas[0]?.id ?? '',
  };
}

export function MapaEuropa({ ruta, capitulos, progress, etapaActualId, onVerGuia }: Props) {
  const [selPais, setSelPais] = useState<string | null>(null);

  const paisActual = getEtapa(ruta, etapaActualId)?.pais ?? null;
  const paises = Object.keys(COORD).filter((p) => ruta.datos_paises[p]);

  // Puntos de la ruta en orden, saltando travesías y nodos repetidos consecutivos.
  const puntos: Array<{ x: number; y: number }> = [];
  let ultimo = '';
  for (const e of listaEtapasEnOrden(ruta)) {
    const c = COORD[e.pais];
    if (!c || e.pais === ultimo) continue;
    puntos.push(c);
    ultimo = e.pais;
  }
  const linea = puntos.map((p) => `${p.x},${p.y}`).join(' ');

  const sel = selPais ? resumenPais(selPais, ruta, capitulos, progress) : null;
  const selDatos = selPais ? getDatosPais(ruta, selPais) : null;

  const nodoActual = paisActual ? COORD[paisActual] : null;

  return (
    <div>
      <div className="card p-3 overflow-hidden">
        <svg viewBox="0 0 300 370" className="w-full h-auto" role="img" aria-label="Mapa del viaje">
          {/* mar de fondo */}
          <rect x="0" y="0" width="300" height="370" fill="#DCE6EC" opacity="0.5" rx="14" />

          {/* ruta punteada */}
          <polyline
            points={linea}
            fill="none"
            stroke="#B85C38"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* países */}
          {paises.map((pais) => {
            const c = COORD[pais];
            const info = resumenPais(pais, ruta, capitulos, progress);
            const datos = getDatosPais(ruta, pais);
            const esActual = pais === paisActual;
            const textoColor = info.visitado
              ? capitulos[info.etapas.find((e) => progress.viaje.sellos[e.id])?.id ?? '']?.sello
                  .color_texto ?? '#fff'
              : '#5C5546';
            return (
              <g
                key={pais}
                transform={`translate(${c.x},${c.y})`}
                onClick={() => setSelPais(pais)}
                className="cursor-pointer"
              >
                <rect
                  x={-16}
                  y={-11}
                  width={32}
                  height={22}
                  rx={5}
                  fill={info.color}
                  stroke={esActual ? '#2E5C7E' : selPais === pais ? '#B85C38' : '#A89F8C'}
                  strokeWidth={esActual || selPais === pais ? 2.2 : 1}
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={textoColor}
                  style={{ pointerEvents: 'none' }}
                >
                  {datos?.codigo ?? '?'}
                </text>
              </g>
            );
          })}

          {/* autocaravana en el país actual */}
          {nodoActual && <Camper x={nodoActual.x} y={nodoActual.y - 12} />}
        </svg>

        <div className="flex items-center gap-4 mt-2 px-1 text-[0.65rem] text-paper-700">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-slate" /> visitado
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-[#E4DECF] border border-paper-500" /> por
            visitar
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
                style={{ backgroundColor: sel.color, color: '#fff', borderColor: '#fff' }}
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
          Toca un país del mapa para ver su información.
        </p>
      )}
    </div>
  );
}

/** Autocaravana cartoon: redondeada, con ventanitas, bici detrás y banderita. */
function Camper({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 17},${y - 20})`} className="van-bob">
      {/* banderita en la antena */}
      <line x1="31" y1="0" x2="31" y2="7" stroke="#5C5546" strokeWidth="1" />
      <path d="M31 0 L38 2.5 L31 5 Z" fill="#C44545" />
      {/* bici detrás */}
      <g stroke="#2E5C7E" strokeWidth="1" fill="none">
        <circle cx="2.5" cy="19" r="2.5" />
        <path d="M2.5 19 L5 14 L8 19 M5 14 L7 14" />
      </g>
      {/* cuerpo */}
      <rect x="5" y="6" width="26" height="13" rx="4" fill="#F5F2EC" stroke="#5C5546" strokeWidth="1.2" />
      {/* morro */}
      <path d="M31 10 L36 12 L36 19 L31 19 Z" fill="#F5F2EC" stroke="#5C5546" strokeWidth="1.2" strokeLinejoin="round" />
      {/* franja copper */}
      <rect x="5" y="15" width="26" height="2.5" fill="#B85C38" opacity="0.85" />
      {/* ventanas */}
      <rect x="8" y="8.5" width="7" height="5" rx="1.2" fill="#8FB8CE" />
      <rect x="17" y="8.5" width="7" height="5" rx="1.2" fill="#8FB8CE" />
      <path d="M32 12 L35.5 13 L35.5 16 L32 16 Z" fill="#8FB8CE" />
      {/* ruedas */}
      <circle cx="12" cy="20" r="3" fill="#2B2B2B" />
      <circle cx="12" cy="20" r="1.1" fill="#9A9A9A" />
      <circle cx="28" cy="20" r="3" fill="#2B2B2B" />
      <circle cx="28" cy="20" r="1.1" fill="#9A9A9A" />
    </g>
  );
}
