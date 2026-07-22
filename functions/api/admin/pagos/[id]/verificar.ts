/**
 * POST /api/admin/pagos/:id/verificar
 *
 * Marca un pago como verificado, rechazado o lo devuelve a pendiente.
 * `pagado_en` es la fecha real en que entró la plata según el extracto; si no
 * se envía, se usa la fecha en que la persona reportó el pago.
 */

import { AdminEnv, json, quienOpera, requireAdmin } from '../../_auth';

const ESTADOS = ['pendiente', 'verificado', 'rechazado'] as const;
type Estado = (typeof ESTADOS)[number];

export const onRequestPost: PagesFunction<AdminEnv> = async ({ request, env, params }) => {
  const rechazo = requireAdmin(request, env);
  if (rechazo) return rechazo;

  const id = Number.parseInt(String(params.id), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ ok: false, error: 'Pago inválido.' }, 400);
  }

  let cuerpo: { estado?: string; pagado_en?: string; nota?: string };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ ok: false, error: 'No pudimos leer la petición.' }, 400);
  }

  const estado = String(cuerpo.estado ?? '') as Estado;
  if (!ESTADOS.includes(estado)) {
    return json({ ok: false, error: 'Estado inválido.' }, 400);
  }

  // Sólo aceptamos AAAA-MM-DD para no ensuciar la base con fechas raras.
  const pagadoEn = String(cuerpo.pagado_en ?? '').trim();
  if (pagadoEn && !/^\d{4}-\d{2}-\d{2}$/.test(pagadoEn)) {
    return json({ ok: false, error: 'La fecha de pago debe tener formato AAAA-MM-DD.' }, 400);
  }

  try {
    const pago = await env.DB.prepare('SELECT id, reportado_en FROM pagos WHERE id = ?')
      .bind(id)
      .first<{ id: number; reportado_en: string }>();

    if (!pago) return json({ ok: false, error: 'Ese pago no existe.' }, 404);

    const esVerificado = estado === 'verificado';

    await env.DB.prepare(
      `UPDATE pagos
          SET estado = ?,
              pagado_en = CASE WHEN ? THEN ? ELSE NULL END,
              verificado_en = CASE WHEN ? THEN datetime('now') ELSE NULL END,
              verificado_por = CASE WHEN ? THEN ? ELSE NULL END,
              nota_admin = ?
        WHERE id = ?`
    )
      .bind(
        estado,
        esVerificado ? 1 : 0,
        pagadoEn || pago.reportado_en,
        esVerificado ? 1 : 0,
        esVerificado ? 1 : 0,
        quienOpera(request),
        String(cuerpo.nota ?? '').trim() || null,
        id
      )
      .run();

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('Error actualizando el pago', err);
    return json({ ok: false, error: 'No pudimos actualizar el pago.' }, 500);
  }
};
