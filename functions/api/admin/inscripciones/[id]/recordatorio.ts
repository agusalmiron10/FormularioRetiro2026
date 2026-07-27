/**
 * POST /api/admin/inscripciones/:id/recordatorio
 *
 * Manda el mail de recordatorio de pago. A diferencia del link de WhatsApp
 * que reemplaza, el envío lo hace el propio servidor — no hace falta que
 * nadie abra otra app y apriete "Enviar".
 */

import { AdminEnv, json, requireAdmin } from '../../_auth';
import { enviarRecordatorioPago } from '../../../_mail';

interface EnvRecordatorio extends AdminEnv {
  RESEND_API_KEY?: string;
}

export const onRequestPost: PagesFunction<EnvRecordatorio> = async ({ request, env, params }) => {
  const rechazo = requireAdmin(request, env);
  if (rechazo) return rechazo;

  const id = Number.parseInt(String(params.id), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ ok: false, error: 'Inscripción inválida.' }, 400);
  }

  let cuerpo: { detalle?: string };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ ok: false, error: 'No pudimos leer la petición.' }, 400);
  }

  const detalle = String(cuerpo.detalle ?? '').trim();
  if (!detalle) {
    return json({ ok: false, error: 'Falta el detalle de la deuda.' }, 400);
  }

  const inscripcion = await env.DB.prepare(
    'SELECT id, nombre_completo, email, token_publico FROM inscripciones WHERE id = ?'
  )
    .bind(id)
    .first<{ id: number; nombre_completo: string; email: string; token_publico: string | null }>();

  if (!inscripcion) return json({ ok: false, error: 'Esa inscripción no existe.' }, 404);

  const { enviado, error } = await enviarRecordatorioPago(env, {
    numero: inscripcion.id,
    nombreCompleto: inscripcion.nombre_completo,
    email: inscripcion.email,
    detalle,
    token: inscripcion.token_publico
  });

  if (!enviado) {
    return json({ ok: false, error: error ?? 'No pudimos enviar el mail.' }, 502);
  }

  return json({ ok: true }, 200);
};
