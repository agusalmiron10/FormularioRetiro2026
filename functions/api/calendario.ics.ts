/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GET /api/calendario.ics
 *
 * Un único evento fijo (las fechas del retiro son las mismas para todas),
 * así que no hace falta generarlo por persona — cualquier mail puede
 * enlazar directo acá.
 */

const pad = (n: number) => String(n).padStart(2, '0');

const formatoIcs = (fecha: Date): string =>
  `${fecha.getUTCFullYear()}${pad(fecha.getUTCMonth() + 1)}${pad(fecha.getUTCDate())}T${pad(fecha.getUTCHours())}${pad(fecha.getUTCMinutes())}00Z`;

export const onRequestGet: PagesFunction = async () => {
  // 11 al 13 de septiembre de 2026, horario de Sídney (UTC+10 en esa fecha).
  const inicio = new Date('2026-09-10T23:00:00Z'); // 11/09 09:00 AEST
  const fin = new Date('2026-09-13T05:00:00Z'); // 13/09 15:00 AEST

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alegria Retreats//Renueva 2026//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:renueva-2026@alegriabewell.com',
    `DTSTAMP:${formatoIcs(new Date())}`,
    `DTSTART:${formatoIcs(inicio)}`,
    `DTEND:${formatoIcs(fin)}`,
    'SUMMARY:Renueva 2026 - Retiro Alegría Retreats',
    'DESCRIPTION:Retiro espiritual de mujeres Renueva 2026. Más info: hello.alegriabewell@gmail.com',
    'LOCATION:Wisemans Retreat\\, NSW',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return new Response(ics, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': 'attachment; filename="renueva-2026.ics"'
    }
  });
};
