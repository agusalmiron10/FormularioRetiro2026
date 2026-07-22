/**
 * GET /api/admin/comprobante/:idDePago
 *
 * Sirve el comprobante desde R2. El bucket no es público: cada archivo pasa
 * por acá y por el control de acceso del panel.
 */

import { AdminEnv, json, requireAdmin } from '../_auth';

export const onRequestGet: PagesFunction<AdminEnv> = async ({ request, env, params }) => {
  // Se permite el token por URL porque el navegador pide las imágenes con <img>
  // y no puede agregarle cabeceras a esas peticiones.
  const rechazo = requireAdmin(request, env, true);
  if (rechazo) return rechazo;

  const id = Number.parseInt(String(params.id), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ ok: false, error: 'Pago inválido.' }, 400);
  }

  try {
    const pago = await env.DB.prepare(
      'SELECT comprobante_key, comprobante_tipo, comprobante_nombre FROM pagos WHERE id = ?'
    )
      .bind(id)
      .first<{
        comprobante_key: string | null;
        comprobante_tipo: string | null;
        comprobante_nombre: string | null;
      }>();

    if (!pago?.comprobante_key) {
      return json({ ok: false, error: 'Ese pago no tiene comprobante adjunto.' }, 404);
    }

    const objeto = await env.COMPROBANTES.get(pago.comprobante_key);
    if (!objeto) {
      return json({ ok: false, error: 'El archivo ya no está disponible.' }, 404);
    }

    return new Response(objeto.body, {
      headers: {
        'content-type': pago.comprobante_tipo ?? 'application/octet-stream',
        'content-disposition': `inline; filename="${(pago.comprobante_nombre ?? 'comprobante').replace(/"/g, '')}"`,
        // Privado: que no quede cacheado en proxies intermedios.
        'cache-control': 'private, max-age=300'
      }
    });
  } catch (err) {
    console.error('Error sirviendo el comprobante', err);
    return json({ ok: false, error: 'No pudimos abrir el comprobante.' }, 500);
  }
};
