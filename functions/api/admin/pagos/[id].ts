/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PATCH /api/admin/pagos/:id
 *
 * Corrige el monto o la descripción de un pago ya cargado — por ejemplo,
 * una planilla importada que decía $220 cuando en realidad eran $225, o un
 * "Pago completo" que en verdad era sólo la primera cuota. A propósito no
 * toca el estado (eso es trabajo del endpoint de verificar) ni manda mail.
 */

import { AdminEnv, json, requireAdmin } from '../_auth';

export const onRequestPatch: PagesFunction<AdminEnv> = async ({ request, env, params }) => {
  const rechazo = requireAdmin(request, env);
  if (rechazo) return rechazo;

  const id = Number.parseInt(String(params.id), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ ok: false, error: 'Pago inválido.' }, 400);
  }

  let cuerpo: { descripcion?: string; monto?: number | null; tipo?: string };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ ok: false, error: 'No pudimos leer la petición.' }, 400);
  }

  const sets: string[] = [];
  const vals: (string | number | null)[] = [];

  if (typeof cuerpo.descripcion === 'string' && cuerpo.descripcion.trim()) {
    sets.push('descripcion = ?');
    vals.push(cuerpo.descripcion.trim());
  }
  if (typeof cuerpo.tipo === 'string' && cuerpo.tipo.trim()) {
    sets.push('tipo = ?');
    vals.push(cuerpo.tipo.trim());
  }
  if ('monto' in cuerpo) {
    const monto = cuerpo.monto;
    if (monto !== null && (typeof monto !== 'number' || Number.isNaN(monto) || monto < 0)) {
      return json({ ok: false, error: 'Monto inválido.' }, 400);
    }
    sets.push('monto = ?');
    vals.push(monto);
  }

  if (sets.length === 0) {
    return json({ ok: false, error: 'No hay nada para actualizar.' }, 400);
  }

  vals.push(id);

  try {
    await env.DB.prepare(`UPDATE pagos SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...vals)
      .run();
    return json({ ok: true }, 200);
  } catch (err) {
    console.error('Error editando el pago', err);
    return json({ ok: false, error: 'No pudimos guardar el cambio.' }, 500);
  }
};
