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

const AZUL_MAR = '#DCEAF2';
const GRIS = '#E5E5E5';
const BEIGE = '#EAE4D7';

/**
 * Siluetas simplificadas (propias, no copiadas) de países europeos en un
 * viewBox 640×780. Reconocibles por su forma y posición relativa, no exactas.
 */
interface Forma {
  nombre: string;
  d: string;
}

const FORMAS: Forma[] = [
  // --- Escandinavia ---
  {
    nombre: 'Noruega',
    d: 'M300 272 L340 200 L372 150 L398 110 L424 70 Q440 58 448 72 L452 92 L416 128 L392 170 L360 214 L336 256 Q322 268 300 272 Z',
  },
  {
    nombre: 'Suecia',
    d: 'M452 92 L478 130 L488 178 L480 220 L452 244 L416 252 L388 244 L360 214 L392 170 L416 128 L452 92 Z',
  },
  {
    nombre: 'Finlandia',
    d: 'M488 120 Q532 108 542 152 L536 206 L510 232 L480 220 L488 178 L478 130 L488 120 Z',
  },
  // --- Bálticos ---
  { nombre: 'Estonia', d: 'M478 236 L540 232 L546 258 L480 262 Z' },
  { nombre: 'Letonia', d: 'M476 266 L546 262 L550 292 L474 296 Z' },
  { nombre: 'Lituania', d: 'M474 300 L550 296 L546 328 L470 332 Z' },
  // --- Islas británicas (fuera de ruta) ---
  {
    nombre: 'Reino Unido',
    d: 'M262 288 L282 282 L288 300 L282 322 L294 340 L280 360 L264 356 L258 336 L266 318 L254 302 Z',
  },
  { nombre: 'Irlanda', d: 'M228 322 L250 320 L254 344 L230 348 Z' },
  // --- Centro-norte ---
  { nombre: 'Dinamarca', d: 'M356 318 L382 312 L388 300 L396 306 L390 330 L368 340 L358 332 Z' },
  { nombre: 'Países Bajos', d: 'M312 344 L344 342 L348 364 L316 366 Z' },
  { nombre: 'Bélgica', d: 'M308 368 L346 366 L352 388 L314 392 Z' },
  {
    nombre: 'Alemania',
    d: 'M352 340 L400 338 L416 364 L412 402 L388 418 L356 410 L346 384 L348 362 Z',
  },
  {
    nombre: 'Polonia',
    d: 'M418 338 L486 340 L494 360 L484 400 L440 408 L416 400 L414 364 Z',
  },
  { nombre: 'Chequia', d: 'M406 406 L456 402 L462 424 L418 428 L404 418 Z' },
  { nombre: 'Austria', d: 'M416 432 L474 426 L488 442 L450 452 L420 448 Z' },
  { nombre: 'Suiza', d: 'M362 430 L402 428 L406 448 L370 452 L358 442 Z' },
  // --- Francia ---
  {
    nombre: 'Francia',
    d: 'M300 366 L346 362 L362 402 L360 438 L336 474 L298 480 L276 448 L272 404 L286 380 Z',
  },
  // --- Iberia ---
  {
    nombre: 'España',
    d: 'M266 500 L360 494 L376 520 L372 560 L346 590 L292 598 L268 590 L260 556 L262 520 Z',
  },
  { nombre: 'Portugal', d: 'M244 516 L262 514 L260 592 L246 596 L238 556 Z' },
  // --- Italia (la bota) ---
  {
    nombre: 'Italia',
    d: 'M418 420 L446 416 L458 440 L478 476 L500 512 L516 540 Q522 552 510 552 L502 534 L482 512 Q486 532 474 534 L462 512 L444 480 L426 448 L416 432 Z',
  },
  { nombre: 'Italia', d: 'M500 556 L518 560 L506 570 Z' }, // Sicilia
];

/** Centros aproximados de los países de la ruta (para la caravana, la línea y las etiquetas). */
const CENTRO: Record<string, { x: number; y: number }> = {
  Noruega: { x: 366, y: 152 },
  Suecia: { x: 432, y: 176 },
  Finlandia: { x: 506, y: 158 },
  Estonia: { x: 508, y: 249 },
  Letonia: { x: 508, y: 280 },
  Lituania: { x: 505, y: 314 },
  'Países Bajos': { x: 330, y: 355 },
  Bélgica: { x: 330, y: 379 },
  Alemania: { x: 380, y: 378 },
  Polonia: { x: 452, y: 372 },
  Francia: { x: 316, y: 424 },
  España: { x: 312, y: 548 },
};

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
  const esRuta = (pais: string) => pais in CENTRO && !!ruta.datos_paises[pais];

  // Línea de la ruta pasando por los centros de cada país, en orden.
  const puntos: Array<{ x: number; y: number }> = [];
  let ultimo = '';
  for (const e of listaEtapasEnOrden(ruta)) {
    const c = CENTRO[e.pais];
    if (!c || e.pais === ultimo) continue;
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
          viewBox="0 0 640 780"
          className="w-full h-auto rounded-[10px]"
          role="img"
          aria-label="Mapa de Europa con la ruta del viaje"
        >
          {/* mar */}
          <rect x="0" y="0" width="640" height="780" fill={AZUL_MAR} />

          {/* países */}
          {FORMAS.map((forma, i) => {
            const ruta_ = esRuta(forma.nombre);
            let fill = GRIS;
            if (ruta_) {
              const info = resumenPais(forma.nombre, ruta, capitulos, progress);
              fill = info.visitado ? info.color : BEIGE;
            }
            const esActual = ruta_ && forma.nombre === paisActual;
            const esSel = ruta_ && forma.nombre === selPais;
            return (
              <path
                key={`${forma.nombre}-${i}`}
                d={forma.d}
                fill={fill}
                stroke={esActual ? '#2E5C7E' : esSel ? '#B85C38' : '#B9B2A2'}
                strokeWidth={esActual ? 3.5 : esSel ? 2.5 : 1}
                strokeLinejoin="round"
                onClick={ruta_ ? () => setSelPais(forma.nombre) : undefined}
                className={ruta_ ? 'cursor-pointer' : ''}
              />
            );
          })}

          {/* ruta punteada (no intercepta clics para no tapar los países) */}
          <polyline
            points={linea}
            fill="none"
            stroke="#B85C38"
            strokeWidth="2.5"
            strokeDasharray="2 6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pointerEvents: 'none' }}
          />

          {/* etiquetas de código en los países de la ruta */}
          {Object.keys(CENTRO).map((pais) => {
            if (!ruta.datos_paises[pais]) return null;
            const c = CENTRO[pais];
            const info = resumenPais(pais, ruta, capitulos, progress);
            const datos = getDatosPais(ruta, pais);
            if (pais === paisActual) return null; // lo tapa la caravana
            return (
              <text
                key={`lbl-${pais}`}
                x={c.x}
                y={c.y + 3}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={info.visitado ? info.colorTexto : '#8A7F68'}
                style={{ pointerEvents: 'none' }}
              >
                {datos?.codigo}
              </text>
            );
          })}

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
  // La posición va en el <g> exterior; la animación de flotado en el interior,
  // porque la CSS `transform` de la animación sobrescribiría un transform propio.
  return (
    <g transform={`translate(${cx},${cy})`} style={{ pointerEvents: 'none' }}>
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
