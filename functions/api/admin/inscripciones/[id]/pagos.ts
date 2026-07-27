/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * POST /api/admin/inscripciones/:id/pagos
 *
 * Carga un pago a mano desde el panel — para cuando alguien pagó pero
 * nunca quedó registrado nada (venía de la planilla vieja, se anotó por
 * WhatsApp, etc.). Entra siempre en 'pendiente' y sin comprobante: el
 * equipo lo tiene que chequear contra el banco como a cualquier otro.
 */

import { AdminEnv, json, requireAdmin } from '../../_auth';

export const onRequestPost: PagesFunction<AdminEnv> = async ({ request, env, params }) => {
  const rechazo = requireAdmin(request, env);
  if (rechazo) return rechazo;

  const inscripcionId = Number.parseInt(String(params.id), 10);
  if (!Number.isInteger(inscripcionId) || inscripcionId <= 0) {
    return json({ ok: false, error: 'Inscripción inválida.' }, 400);
  }

  let cuerpo: { descripcion?: string; monto?: number | null; tipo?: string };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ ok: false, error: 'No pudimos leer la petición.' }, 400);
  }

  const descripcion = String(cuerpo.descripcion ?? '').trim();
  if (!descripcion) {
    return json({ ok: false, error: 'Falta la descripción del pago.' }, 400);
  }

  const monto = cuerpo.monto;
  if (monto !== null && monto !== undefined && (typeof monto !== 'number' || Number.isNaN(monto) || monto < 0)) {
    return json({ ok: false, error: 'Monto inválido.' }, 400);
  }

  const existe = await env.DB.prepare('SELECT id FROM inscripciones WHERE id = ?')
    .bind(inscripcionId)
    .first<{ id: number }>();
  if (!existe) return json({ ok: false, error: 'Esa inscripción no existe.' }, 404);

  try {
    await env.DB.prepare(
      `INSERT INTO pagos (inscripcion_id, tipo, descripcion, monto, metodo, estado)
       VALUES (?, ?, ?, ?, 'transferencia', 'pendiente')`
    )
      .bind(inscripcionId, String(cuerpo.tipo ?? 'otro').trim() || 'otro', descripcion, monto ?? null)
      .run();
    return json({ ok: true }, 200);
  } catch (err) {
    console.error('Error agregando el pago', err);
    return json({ ok: false, error: 'No pudimos guardar el pago.' }, 500);
  }
};
