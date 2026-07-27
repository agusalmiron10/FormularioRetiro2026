/**
 * POST /api/admin/pagos/:id/verificar
 *
 * Marca un pago como verificado, rechazado o lo devuelve a pendiente.
 * `pagado_en` es la fecha real en que entró la plata según el extracto; si no
 * se envía, se usa la fecha en que la persona reportó el pago.
 */

import { AdminEnv, json, quienOpera, requireAdmin } from '../../_auth';
import { enviarPagoRechazado, enviarPagoVerificado } from '../../../_mail';

const ESTADOS = ['pendiente', 'verificado', 'rechazado'] as const;
type Estado = (typeof ESTADOS)[number];

interface EnvVerificar extends AdminEnv {
  RESEND_API_KEY?: string;
}

export const onRequestPost: PagesFunction<EnvVerificar> = async ({ request, env, params }) => {
  const rechazo = requireAdmin(request, env);
  if (rechazo) return rechazo;

  const id = Number.parseInt(String(params.id), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ ok: false, error: 'Pago inválido.' }, 400);
  }

  let cuerpo: { estado?: string; pagado_en?: string; nota?: string; notificar?: boolean };
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
    const pago = await env.DB.prepare(
      `SELECT p.id, p.estado, p.reportado_en, p.descripcion, p.monto, p.metodo, p.inscripcion_id,
              i.nombre_completo, i.email
         FROM pagos p JOIN inscripciones i ON i.id = p.inscripcion_id
        WHERE p.id = ?`
    )
      .bind(id)
      .first<{
        id: number;
        estado: Estado;
        reportado_en: string;
        descripcion: string;
        monto: number | null;
        metodo: string;
        inscripcion_id: number;
        nombre_completo: string;
        email: string;
      }>();

    if (!pago) return json({ ok: false, error: 'Ese pago no existe.' }, 404);

    const estadoAnterior = pago.estado;
    const esVerificado = estado === 'verificado';
    const fechaPago = pagadoEn || pago.reportado_en;

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
        fechaPago,
        esVerificado ? 1 : 0,
        esVerificado ? 1 : 0,
        quienOpera(request),
        String(cuerpo.nota ?? '').trim() || null,
        id
      )
      .run();

    // El mail sólo sale si el estado realmente cambió — repetir "Verificar"
    // sobre un pago que ya estaba verificado (por corregir sólo la fecha o
    // la nota, por ejemplo) no debe reenviar el aviso. Además, el panel
    // permite marcar el cambio "sólo para el sistema" (notificar: false),
    // útil para pagos viejos importados donde reenviar el aviso hoy sería
    // confuso.
    const notificar = cuerpo.notificar !== false;
    if (estado !== estadoAnterior && !notificar) {
      console.log(`Pago ${id}: cambio a "${estado}" sin notificar (marcado desde el panel).`);
    }
    if (estado !== estadoAnterior && notificar) {
      if (estado === 'verificado') {
        const { enviado, error: errorMail } = await enviarPagoVerificado(env, {
          numero: pago.inscripcion_id,
          nombreCompleto: pago.nombre_completo,
          email: pago.email,
          pagoDescripcion: pago.descripcion,
          pagoMonto: pago.monto,
          metodo: pago.metodo,
          pagadoEn: fechaPago
        });
        if (!enviado) console.error('No se pudo enviar el mail de pago verificado:', errorMail);
      } else if (estado === 'rechazado') {
        const { enviado, error: errorMail } = await enviarPagoRechazado(env, {
          numero: pago.inscripcion_id,
          nombreCompleto: pago.nombre_completo,
          email: pago.email,
          pagoDescripcion: pago.descripcion,
          nota: String(cuerpo.nota ?? '').trim() || null
        });
        if (!enviado) console.error('No se pudo enviar el mail de pago rechazado:', errorMail);
      }
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('Error actualizando el pago', err);
    return json({ ok: false, error: 'No pudimos actualizar el pago.' }, 500);
  }
};
