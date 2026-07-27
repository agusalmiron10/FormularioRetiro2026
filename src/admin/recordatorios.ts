/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cálculo de quién debe plata, para el recordatorio de pago por mail.
 */

import { Inscripcion } from './api';
import { PAYMENT_OPTIONS } from '../data';

export interface Recordatorio {
  monto: number | null;
  detalle: string;
}

const montoDe = (id: string): number | null =>
  PAYMENT_OPTIONS.find((o) => o.id === id)?.amount ?? null;

/**
 * Si la inscripta debe plata, arma el recordatorio; si no, devuelve null.
 *
 * Dos casos:
 *  1. Eligió pago único (completo) y todavía no está verificado -> debe el total.
 *  2. Pagó y se verificó la primera cuota, pero nunca llegó una segunda -> debe la mitad restante.
 *
 * Las voluntarias/donaciones sin monto fijo no generan recordatorio automático:
 * no hay una cifra objetiva que reclamar.
 */
export function calcularRecordatorio(inscripcion: Inscripcion): Recordatorio | null {
  const pagos = inscripcion.pagos;
  if (pagos.length === 0) return null;

  const pagoUnico = pagos.find((p) =>
    ['early-full', 'regular-full', 'volunteer-full'].includes(p.tipo)
  );
  if (pagoUnico && pagoUnico.estado !== 'verificado') {
    const monto = pagoUnico.monto;
    const detalle = monto
      ? `te falta abonar el total de $${monto} AUD`
      : 'te falta completar tu pago';
    return { monto, detalle };
  }

  const primeraVerificada = pagos.find(
    (p) => (p.tipo === 'early-1' || p.tipo === 'volunteer-1') && p.estado === 'verificado'
  );
  const yaTieneSegunda = pagos.some((p) => p.tipo === 'early-2' || p.tipo === 'volunteer-2');

  if (primeraVerificada && !yaTieneSegunda) {
    const idSegunda = primeraVerificada.tipo === 'early-1' ? 'early-2' : 'volunteer-2';
    const monto = montoDe(idSegunda);
    const detalle = monto
      ? `te falta la segunda cuota de $${monto} AUD`
      : 'te falta la segunda cuota';
    return { monto, detalle };
  }

  return null;
}
