/**
 * Catálogo de pagos del lado del servidor.
 *
 * Se define acá a propósito, duplicado respecto del cliente: el monto que se
 * guarda en la base nunca puede venir del navegador, porque es manipulable.
 */

export interface OpcionPago {
  id: string;
  descripcion: string;
  monto: number | null;
}

export const OPCIONES_PAGO: Record<string, OpcionPago> = {
  'early-full': { id: 'early-full', descripcion: 'Precio anticipado — Pago completo $450', monto: 450 },
  'early-1': { id: 'early-1', descripcion: 'Precio anticipado — Primera cuota $225', monto: 225 },
  'early-2': { id: 'early-2', descripcion: 'Precio anticipado — Segunda cuota $225', monto: 225 },
  'regular-full': { id: 'regular-full', descripcion: 'Precio regular — Pago completo $480', monto: 480 },
  'volunteer-full': { id: 'volunteer-full', descripcion: 'Voluntaria — Pago completo', monto: null },
  'volunteer-1': { id: 'volunteer-1', descripcion: 'Voluntaria — Primera cuota', monto: null },
  'volunteer-2': { id: 'volunteer-2', descripcion: 'Voluntaria — Segunda cuota', monto: null },
  'donation-woman': { id: 'donation-woman', descripcion: 'Donación para apoyar a otra mujer', monto: null },
  'donation-ministry': { id: 'donation-ministry', descripcion: 'Donación para bendecir el ministerio', monto: null }
};

export const COMPROBANTE = {
  maxBytes: 8 * 1024 * 1024,
  tiposAceptados: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/heic',
    'application/pdf'
  ]
};

export const extensionPara = (tipo: string): string =>
  ({
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'application/pdf': 'pdf'
  })[tipo] ?? 'bin';

export const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
