/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cálculo de recordatorios de pago por WhatsApp.
 *
 * No hay integración con la API de WhatsApp Business (requiere número
 * verificado por Meta y plantillas aprobadas). En su lugar se arma un link
 * wa.me con el chat y el mensaje ya escritos: WhatsApp nunca permite que un
 * tercero mande el mensaje por vos, así que quien opera el panel sigue
 * teniendo que apretar "Enviar" — esto sólo evita calcular la deuda y
 * redactar el texto a mano, persona por persona.
 */

import { Inscripcion } from './api';
import { BANK_DETAILS, PAYMENT_OPTIONS } from '../data';

export interface Recordatorio {
  monto: number | null;
  detalle: string;
  mensaje: string;
  /** Sólo dígitos, en formato internacional. null si el teléfono cargado no sirve para armar el link. */
  telefono: string | null;
}

const soloDigitos = (telefono: string): string => telefono.replace(/\D/g, '');

const primerNombre = (nombreCompleto: string): string =>
  nombreCompleto.trim().split(/\s+/)[0] || 'Hola';

const montoDe = (id: string): number | null =>
  PAYMENT_OPTIONS.find((o) => o.id === id)?.amount ?? null;

function construirMensaje(inscripcion: Inscripcion, descripcionDeuda: string): string {
  const nombre = primerNombre(inscripcion.nombre_completo);
  return `Hola ${nombre}! 🌿 Te escribimos de Alegría Retreats por tu inscripción a *Renueva 2026* (#${String(inscripcion.id).padStart(3, '0')}).

Vemos que ${descripcionDeuda} para confirmar tu lugar en el retiro.

Podés transferir a:
${BANK_DETAILS.accountName}
BSB: ${BANK_DETAILS.bsb}
Cuenta: ${BANK_DETAILS.accountNumber}
Referencia: tu nombre completo + RENUEVA

Cuando lo hagas, respondé este mensaje con la captura y te confirmamos enseguida 🙏 ¡Gracias!`;
}

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

  const telefono = soloDigitos(inscripcion.telefono || '');
  const telefonoUsable = telefono.length >= 8 ? telefono : null;

  const pagoUnico = pagos.find((p) =>
    ['early-full', 'regular-full', 'volunteer-full'].includes(p.tipo)
  );
  if (pagoUnico && pagoUnico.estado !== 'verificado') {
    const monto = pagoUnico.monto;
    const detalle = monto
      ? `te falta abonar el total de $${monto} AUD`
      : 'te falta completar tu pago';
    return {
      monto,
      detalle,
      mensaje: construirMensaje(inscripcion, detalle),
      telefono: telefonoUsable
    };
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
    return {
      monto,
      detalle,
      mensaje: construirMensaje(inscripcion, detalle),
      telefono: telefonoUsable
    };
  }

  return null;
}

export const urlWhatsapp = (telefono: string, mensaje: string): string =>
  `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
