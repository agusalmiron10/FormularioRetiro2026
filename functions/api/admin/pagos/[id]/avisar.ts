/**
 * POST /api/admin/pagos/:id/avisar
 *
 * Manda (o reenvía) el mail de "pago verificado" / "necesitamos revisar tu
 * pago" para el estado ACTUAL del pago, sin tocar ese estado. Existe para
 * cuando se verificó o rechazó con "Avisar por mail" destildado y después
 * se decide avisar igual — antes había que deshacer y volver a verificar
 * para que saliera el mail.
 */

import { AdminEnv, json, requireAdmin } from '../../_auth';
import { enviarPagoRechazado, enviarPagoVerificado } from '../../../_mail';

interface EnvAvisar extends AdminEnv {
  RESEND_API_KEY?: string;
}

export const onRequestPost: PagesFunction<EnvAvisar> = async ({ request, env, params }) => {
  const rechazo = requireAdmin(request, env);
  if (rechazo) return rechazo;

  const id = Number.parseInt(String(params.id), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ ok: false, error: 'Pago inválido.' }, 400);
  }

  const pago = await env.DB.prepare(
    `SELECT p.id, p.estado, p.descripcion, p.monto, p.metodo, p.pagado_en, p.reportado_en,
            p.nota_admin, p.inscripcion_id, i.nombre_completo, i.email
       FROM pagos p JOIN inscripciones i ON i.id = p.inscripcion_id
      WHERE p.id = ?`
  )
    .bind(id)
    .first<{
      id: number;
      estado: string;
      descripcion: string;
      monto: number | null;
      metodo: string;
      pagado_en: string | null;
      reportado_en: string;
      nota_admin: string | null;
      inscripcion_id: number;
      nombre_completo: string;
      email: string;
    }>();

  if (!pago) return json({ ok: false, error: 'Ese pago no existe.' }, 404);

  if (pago.estado !== 'verificado' && pago.estado !== 'rechazado') {
    return json({ ok: false, error: 'Este pago todavía está pendiente — no hay nada para avisar.' }, 400);
  }

  const resultado =
    pago.estado === 'verificado'
      ? await enviarPagoVerificado(env, {
          numero: pago.inscripcion_id,
          nombreCompleto: pago.nombre_completo,
          email: pago.email,
          pagoDescripcion: pago.descripcion,
          pagoMonto: pago.monto,
          metodo: pago.metodo,
          pagadoEn: pago.pagado_en || pago.reportado_en
        })
      : await enviarPagoRechazado(env, {
          numero: pago.inscripcion_id,
          nombreCompleto: pago.nombre_completo,
          email: pago.email,
          pagoDescripcion: pago.descripcion,
          nota: pago.nota_admin
        });

  if (!resultado.enviado) {
    return json({ ok: false, error: resultado.error ?? 'No pudimos enviar el mail.' }, 502);
  }

  await env.DB.prepare('UPDATE pagos SET mail_enviado = 1 WHERE id = ?').bind(id).run();

  return json({ ok: true }, 200);
};
