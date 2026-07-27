/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mapa de dónde viajan las inscriptas — pensado para decidir transporte
 * compartido, no para ser geográficamente exacto. La silueta de Australia
 * es una aproximación simplificada, no un trazo satelital.
 */

import { Inscripcion } from './api';

interface Ciudad {
  nombre: string;
  x: number;
  y: number;
}

const CIUDADES: Record<string, Ciudad> = {
  perth: { nombre: 'Perth', x: 78, y: 258 },
  darwin: { nombre: 'Darwin', x: 185, y: 68 },
  brisbane: { nombre: 'Brisbane', x: 372, y: 172 },
  'sunshine coast': { nombre: 'Sunshine Coast', x: 382, y: 152 },
  'gold coast': { nombre: 'Gold Coast', x: 366, y: 192 },
  sídney: { nombre: 'Sídney', x: 386, y: 233 },
  melbourne: { nombre: 'Melbourne', x: 353, y: 283 }
};

const sinAcentos = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Matchea texto libre a una ciudad conocida, tolerando typos comunes y mayúsculas. */
function ciudadDe(origen: string): string | null {
  const t = sinAcentos(origen);
  if (t.includes('sunshine')) return 'sunshine coast';
  if (t.includes('gold coast')) return 'gold coast';
  if (t.includes('sidney') || t.includes('sydney')) return 'sídney';
  if (t.includes('melbourne')) return 'melbourne';
  if (t.includes('brisbane')) return 'brisbane';
  if (t.includes('perth')) return 'perth';
  if (t.includes('darwin')) return 'darwin';
  return null;
}

/** Silueta simplificada de Australia (viewBox 0 0 460 340), a mano alzada. */
const CONTORNO_AUSTRALIA =
  'M 250 45 L 300 55 L 335 42 L 350 90 L 380 160 L 393 232 L 372 288 L 320 305 ' +
  'L 268 318 L 210 315 L 155 298 L 100 288 L 75 255 L 60 210 L 58 150 L 88 90 ' +
  'L 130 62 L 175 82 L 205 58 Z';

export default function MapaProcedencia({ inscripciones }: { inscripciones: Inscripcion[] }) {
  const conteoPorCiudad = new Map<string, number>();
  const otras = new Map<string, number>();

  for (const i of inscripciones) {
    const origen = (i.origen_viaje || '').trim();
    if (!origen) continue;
    const clave = ciudadDe(origen);
    if (clave) {
      conteoPorCiudad.set(clave, (conteoPorCiudad.get(clave) ?? 0) + 1);
    } else {
      otras.set(origen, (otras.get(origen) ?? 0) + 1);
    }
  }

  const maxConteo = Math.max(1, ...conteoPorCiudad.values());
  const radio = (n: number) => 8 + Math.sqrt(n / maxConteo) * 16;

  if (conteoPorCiudad.size === 0 && otras.size === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 p-5 mb-8">
      <p className="font-sans text-[11px] font-bold text-tertiary uppercase tracking-wider mb-4">
        De dónde vienen
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0 mx-auto md:mx-0">
          <svg viewBox="0 0 460 340" className="w-full max-w-[320px]">
            <path
              d={CONTORNO_AUSTRALIA}
              fill="#FDF5ED"
              stroke="#ECDCCA"
              strokeWidth="2"
            />
            {[...conteoPorCiudad.entries()].map(([clave, n]) => {
              const c = CIUDADES[clave];
              const r = radio(n);
              return (
                <g key={clave}>
                  <circle cx={c.x} cy={c.y} r={r} fill="#5D2304" fillOpacity={0.85} />
                  <text
                    x={c.x}
                    y={c.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FCF9F2"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                  >
                    {n}
                  </text>
                  <text
                    x={c.x}
                    y={c.y + r + 13}
                    textAnchor="middle"
                    fill="#5D2304"
                    fontSize="11"
                    fontFamily="Inter, sans-serif"
                  >
                    {c.nombre}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {otras.size > 0 && (
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[11px] font-semibold text-tertiary uppercase tracking-wider mb-2">
              Otras respuestas
            </p>
            <div className="space-y-1.5">
              {[...otras.entries()].map(([texto, n]) => (
                <div
                  key={texto}
                  className="flex items-center justify-between gap-3 font-sans text-xs text-on-surface-variant"
                >
                  <span className="truncate">{texto}</span>
                  <span className="shrink-0 font-semibold text-tertiary">{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
