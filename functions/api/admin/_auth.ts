/**
 * Control de acceso del panel de administración.
 *
 * Dos capas, y ninguna es opcional:
 *
 *  1. Cloudflare Access — se configura en el dashboard y bloquea en el borde,
 *     antes de que la petición llegue acá. Es la protección real (login con
 *     Google, sin contraseñas compartidas).
 *  2. ADMIN_TOKEN — un secreto del proyecto. Sirve para operar el panel
 *     mientras Access no esté configurado, y como red por si Access se
 *     desactiva por error.
 *
 * Si no hay ADMIN_TOKEN cargado, todo devuelve 503. Falla cerrado a propósito:
 * un panel sin proteger deja expuestos domicilios, fechas de nacimiento y
 * condiciones médicas.
 */

export interface AdminEnv {
  DB: D1Database;
  COMPROBANTES: R2Bucket;
  ADMIN_TOKEN?: string;
}

const json = (data: unknown, status: number): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });

/** Comparación en tiempo constante: evita adivinar el token midiendo demoras. */
const igualSeguro = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

/**
 * Devuelve `null` si la petición está autorizada, o la Response de rechazo.
 *
 * `permitirTokenEnUrl` sólo se activa en las exportaciones, porque Excel no
 * puede mandar cabeceras propias al refrescar desde una URL.
 */
export function requireAdmin(
  request: Request,
  env: AdminEnv,
  permitirTokenEnUrl = false
): Response | null {
  if (!env.ADMIN_TOKEN) {
    return json(
      {
        ok: false,
        error:
          'El panel todavía no está configurado. Falta cargar el secreto ADMIN_TOKEN en el proyecto.'
      },
      503
    );
  }

  let recibido = request.headers.get('x-admin-token') ?? '';

  if (!recibido && permitirTokenEnUrl) {
    recibido = new URL(request.url).searchParams.get('token') ?? '';
  }

  if (!recibido || !igualSeguro(recibido, env.ADMIN_TOKEN)) {
    return json({ ok: false, error: 'No autorizado.' }, 401);
  }

  return null;
}

/** Identifica quién verificó un pago: el mail de Access, o "panel" si no hay. */
export const quienOpera = (request: Request): string =>
  request.headers.get('Cf-Access-Authenticated-User-Email') ?? 'panel';

export { json };
