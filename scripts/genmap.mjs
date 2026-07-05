// Genera src/components/europaGeo.ts con las siluetas de los países europeos.
//
// Fuente de datos: Natural Earth 1:50m (DOMINIO PÚBLICO), vía el paquete npm
// `world-atlas`. Se decodifica con `topojson-client`. Ambos son solo
// dependencias de desarrollo para regenerar el mapa; la app NO los usa en
// runtime (la geometría queda "horneada" en europaGeo.ts).
//
// Para regenerar:
//   npm i -D world-atlas topojson-client
//   node scripts/genmap.mjs
//
// Proyección: Albers cónica equivalente centrada en Europa. Se descartan
// territorios de ultramar e islas lejanas (Svalbard, Guayana, Canarias…).

import { createRequire } from 'module';
import { writeFileSync } from 'fs';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const { feature } = require('topojson-client');

const fc = feature(topo, topo.objects.countries);

// Nombre en inglés (world-atlas) -> [nombre en español (ruta), esPaísDeLaRuta]
const OBJETIVO = {
  Spain: ['España', true],
  Portugal: ['Portugal', false],
  France: ['Francia', true],
  Belgium: ['Bélgica', true],
  Netherlands: ['Países Bajos', true],
  Germany: ['Alemania', true],
  Denmark: ['Dinamarca', false],
  Poland: ['Polonia', true],
  Lithuania: ['Lituania', true],
  Latvia: ['Letonia', true],
  Estonia: ['Estonia', true],
  Finland: ['Finlandia', true],
  Sweden: ['Suecia', true],
  Norway: ['Noruega', true],
  Italy: ['Italia', false],
  'United Kingdom': ['Reino Unido', false],
  Switzerland: ['Suiza', false],
  Austria: ['Austria', false],
  Czechia: ['República Checa', false],
  Ireland: ['Irlanda', false],
};

// Puntos-marcador (lon,lat) ~ capital/centro de cada país de la ruta.
const CAPITAL = {
  España: [-3.7, 40.3],
  Francia: [2.3, 47.2],
  Bélgica: [4.6, 50.7],
  'Países Bajos': [5.4, 52.2],
  Alemania: [10.4, 51.1],
  Polonia: [19.4, 52.1],
  Lituania: [23.9, 55.2],
  Letonia: [24.6, 56.9],
  Estonia: [25.6, 58.9],
  Finlandia: [25.5, 62.0],
  Noruega: [9.5, 61.4],
  Suecia: [15.0, 62.0],
};

const LON = [-25, 45];
const LAT = [34, 73];

// --- Proyección Albers cónica equivalente centrada en Europa ---
const D = Math.PI / 180;
const phi1 = 43 * D, phi2 = 62 * D, phi0 = 52 * D, lam0 = 15 * D;
const n = (Math.sin(phi1) + Math.sin(phi2)) / 2;
const C = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
const rho0 = Math.sqrt(C - 2 * n * Math.sin(phi0)) / n;
function proj(lon, lat) {
  const phi = lat * D, lam = lon * D;
  const rho = Math.sqrt(C - 2 * n * Math.sin(phi)) / n;
  const theta = n * (lam - lam0);
  return [rho * Math.sin(theta), rho0 - rho * Math.cos(theta)];
}

function ringCentroid(ring) {
  let sx = 0, sy = 0;
  for (const [x, y] of ring) { sx += x; sy += y; }
  return [sx / ring.length, sy / ring.length];
}
function ringArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(a) / 2;
}

function ringsDe(feat) {
  const geom = feat.geometry;
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const out = [];
  for (const poly of polys) {
    const ext = poly[0];
    const [clon, clat] = ringCentroid(ext);
    if (clon < LON[0] || clon > LON[1] || clat < LAT[0] || clat > LAT[1]) continue;
    if (ringArea(ext) < 0.08) continue;
    out.push(ext);
  }
  return out;
}

const paises = [];
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
const noEncontrados = new Set(Object.keys(OBJETIVO));

for (const feat of fc.features) {
  const info = OBJETIVO[feat.properties.name];
  if (!info) continue;
  noEncontrados.delete(feat.properties.name);
  const [nombre, ruta] = info;
  const rings = ringsDe(feat).map((ring) => ring.map(([lon, lat]) => proj(lon, lat)));
  for (const r of rings) for (const [x, y] of r) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const ya = paises.find((p) => p.nombre === nombre);
  if (ya) ya.rings.push(...rings);
  else paises.push({ nombre, ruta, rings });
}

const W = 1000, PAD = 24;
const scale = W / (maxX - minX);
const H = Math.round((maxY - minY) * scale);
const tx = (x) => +(((x - minX) * scale) + PAD).toFixed(1);
const ty = (y) => +(((maxY - y) * scale) + PAD).toFixed(1);

function perp(p, a, b) {
  const [px, py] = p, [ax, ay] = a, [bx, by] = b;
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(px - ax, py - ay);
  return Math.abs((px - ax) * dy - (py - ay) * dx) / len;
}
function dp(points, eps) {
  if (points.length < 3) return points;
  let dmax = 0, idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perp(points[i], points[0], points[points.length - 1]);
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax > eps) {
    return dp(points.slice(0, idx + 1), eps).slice(0, -1).concat(dp(points.slice(idx), eps));
  }
  return [points[0], points[points.length - 1]];
}

const EPS = 1.6;
const formas = [];
for (const p of paises) {
  let d = '';
  for (const ring of p.rings) {
    const px = ring.map(([x, y]) => [tx(x), ty(y)]);
    const simp = dp(px, EPS);
    if (simp.length < 3) continue;
    d += 'M' + simp.map(([x, y]) => `${x} ${y}`).join(' L') + 'Z';
  }
  formas.push({ nombre: p.nombre, ruta: p.ruta, d });
}

const centro = {};
for (const [nombre, [lon, lat]] of Object.entries(CAPITAL)) {
  const [x, y] = proj(lon, lat);
  centro[nombre] = { x: tx(x), y: ty(y) };
}

const viewBox = `0 0 ${W + PAD * 2} ${H + PAD * 2}`;
const ts = `// GENERADO por scripts/genmap.mjs (datos: Natural Earth 1:50m vía world-atlas, dominio público).
// No editar a mano: regenerar con \`node scripts/genmap.mjs\`.

export const EUROPA_VIEWBOX = '${viewBox}';

export interface FormaPais {
  nombre: string;
  /** Si forma parte de la ruta del viaje (se colorea e interactúa). */
  ruta: boolean;
  d: string;
}

export const FORMAS: FormaPais[] = ${JSON.stringify(formas)
    .replace(/\},\{/g, '},\n  {')
    .replace(/^\[/, '[\n  ')
    .replace(/\]$/, ',\n]')};

/** Punto-marcador (capital aprox.) de cada país de la ruta, en coords del viewBox. */
export const CENTRO: Record<string, { x: number; y: number }> = ${JSON.stringify(centro, null, 2)};
`;

writeFileSync(new URL('../src/components/europaGeo.ts', import.meta.url), ts);
console.log('viewBox:', viewBox, '| países:', formas.length);
console.log('no encontrados:', [...noEncontrados].join(', ') || '(ninguno)');
