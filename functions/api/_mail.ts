/**
 * Envío de mails vía Resend.
 *
 * Si falla el envío no se aborta la operación que lo dispara (guardar la
 * inscripción, verificar el pago) — esa ya quedó hecha en la base, que es
 * lo que importa. El mail es una cortesía; si no sale, queda registrado en
 * los logs para diagnóstico, y el estado real sigue viéndose en el panel.
 */

interface EnvMail {
  RESEND_API_KEY?: string;
}

const REMITENTE = 'Alegría Retreats <inscripciones@alegriabewell.com>';
const RESPONDER_A = 'hello.alegriabewell@gmail.com';

const escaparHtml = (valor: string): string =>
  valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const linea = (etiqueta: string, valor: string | number | null | undefined): string => {
  if (valor === null || valor === undefined || valor === '') return '';
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#8a7a68;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;white-space:nowrap;vertical-align:top;">${escaparHtml(etiqueta)}</td>
    <td style="padding:6px 0;color:#2D1A0E;font-size:14px;">${escaparHtml(String(valor))}</td>
  </tr>`;
};

/** Envoltorio visual común a todos los mails del retiro. */
const plantilla = (tituloEncabezado: string, cuerpoHtml: string): string => `
  <div style="font-family:Georgia,'Times New Roman',serif;background:#FCF9F2;padding:32px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ECDCCA;">
      <div style="background:#5D2304;padding:28px 32px;">
        <h1 style="margin:0;color:#FCF9F2;font-size:22px;">RENUEVA 2026</h1>
        <p style="margin:4px 0 0;color:#F2E5D5;font-size:13px;">${escaparHtml(tituloEncabezado)}</p>
      </div>
      <div style="padding:32px;">${cuerpoHtml}</div>
      <div style="background:#F8EDE0;padding:16px 32px;text-align:center;">
        <p style="margin:0;color:#8a7a68;font-size:11px;">Alegría Retreats · Wisemans Retreat, NSW</p>
      </div>
    </div>
  </div>`;

interface ResultadoEnvio {
  enviado: boolean;
  error?: string;
}

async function enviarMail(
  env: EnvMail,
  opciones: { to: string; subject: string; html: string }
): Promise<ResultadoEnvio> {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurada: se omite el envío de mail.');
    return { enviado: false, error: 'RESEND_API_KEY no configurada' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: [opciones.to],
        reply_to: RESPONDER_A,
        subject: opciones.subject,
        html: opciones.html
      })
    });

    if (!res.ok) {
      const cuerpo = await res.text().catch(() => '');
      console.error('Resend rechazó el envío', res.status, cuerpo);
      return { enviado: false, error: `Resend devolvió ${res.status}` };
    }

    return { enviado: true };
  } catch (err) {
    console.error('Error de red enviando el mail', err);
    return { enviado: false, error: 'Error de red' };
  }
}

export interface DatosMailConfirmacion {
  numero: number;
  nombreCompleto: string;
  email: string;
  origenViaje: string;
  idioma: string;
  pagoDescripcion: string;
  pagoMonto: number | null;
  metodo: string;
}

/** Mail al completar el formulario: "recibimos tu inscripción, la vamos a revisar". */
export async function enviarConfirmacionInscripcion(
  env: EnvMail,
  datos: DatosMailConfirmacion
): Promise<ResultadoEnvio> {
  const primerNombre = datos.nombreCompleto.trim().split(/\s+/)[0] || 'Hermana';
  const idiomaTexto =
    datos.idioma === 'es' ? 'Español' : datos.idioma === 'en' ? 'Inglés' : 'Ambos';
  const montoTexto =
    datos.pagoMonto !== null ? `$${datos.pagoMonto} AUD` : 'A definir con el equipo';

  const html = plantilla(
    'Alegría Retreats',
    `
    <h2 style="margin:0 0 12px;color:#5D2304;font-size:20px;">¡Gracias por inscribirte, ${escaparHtml(primerNombre)}!</h2>
    <p style="margin:0 0 20px;color:#5C4A3A;font-size:14px;line-height:1.6;">
      Recibimos tu inscripción y tu comprobante de pago para <strong>Renueva 2026</strong>
      (11 al 13 de septiembre, Wisemans Retreat). Nuestro equipo va a verificar la
      transferencia y te va a confirmar tu lugar por este mismo medio.
    </p>

    <div style="background:#FDF5ED;border:1px solid #ECDCCA;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0;color:#8a7a68;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">
        Tu número de inscripción
      </p>
      <p style="margin:2px 0 0;color:#5D2304;font-size:26px;font-weight:600;">
        #${String(datos.numero).padStart(3, '0')}
      </p>
    </div>

    <p style="margin:0 0 8px;color:#8a7a68;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">
      Resumen de tu registro
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${linea('Email', datos.email)}
      ${linea('Viaja desde', datos.origenViaje)}
      ${linea('Idioma', idiomaTexto)}
      ${linea('Pago', datos.pagoDescripcion)}
      ${linea('Monto', montoTexto)}
      ${linea('Método', datos.metodo === 'paypal' ? 'PayPal' : 'Transferencia bancaria')}
    </table>

    <p style="margin:0;color:#5C4A3A;font-size:13px;line-height:1.6;">
      ¿Alguna duda? Respondé este mismo mail y te contestamos.
    </p>`
  );

  return enviarMail(env, {
    to: datos.email,
    subject: `Recibimos tu inscripción · Renueva 2026 · #${String(datos.numero).padStart(3, '0')}`,
    html
  });
}

export interface DatosMailPagoVerificado {
  numero: number;
  nombreCompleto: string;
  email: string;
  pagoDescripcion: string;
  pagoMonto: number | null;
  metodo: string;
  pagadoEn: string | null;
}

/** Mail al verificar un pago desde el panel: "tu lugar quedó confirmado". */
export async function enviarPagoVerificado(
  env: EnvMail,
  datos: DatosMailPagoVerificado
): Promise<ResultadoEnvio> {
  const primerNombre = datos.nombreCompleto.trim().split(/\s+/)[0] || 'Hermana';
  const montoTexto = datos.pagoMonto !== null ? `$${datos.pagoMonto} AUD` : null;

  const html = plantilla(
    'Pago confirmado',
    `
    <h2 style="margin:0 0 12px;color:#5D2304;font-size:20px;">¡Tu lugar está confirmado, ${escaparHtml(primerNombre)}!</h2>
    <p style="margin:0 0 20px;color:#5C4A3A;font-size:14px;line-height:1.6;">
      Verificamos tu pago y tu lugar en <strong>Renueva 2026</strong> (11 al 13 de septiembre,
      Wisemans Retreat) quedó reservado. ¡Te esperamos!
    </p>

    <div style="background:#EFF3E4;border:1px solid #d9e2c4;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0;color:#5c7a2e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">
        Estado
      </p>
      <p style="margin:2px 0 0;color:#3d5620;font-size:18px;font-weight:600;">
        Pago verificado ✓
      </p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${linea('N.º de inscripción', `#${String(datos.numero).padStart(3, '0')}`)}
      ${linea('Pago', datos.pagoDescripcion)}
      ${linea('Monto', montoTexto)}
      ${linea('Método', datos.metodo === 'paypal' ? 'PayPal' : 'Transferencia bancaria')}
      ${linea('Fecha del pago', datos.pagadoEn)}
    </table>

    <p style="margin:0;color:#5C4A3A;font-size:13px;line-height:1.6;">
      Si hiciste esta inscripción en cuotas, recordá completar el pago restante antes del
      retiro. Cualquier duda, respondé este mismo mail.
    </p>`
  );

  return enviarMail(env, {
    to: datos.email,
    subject: `Tu pago fue verificado · Renueva 2026 · #${String(datos.numero).padStart(3, '0')}`,
    html
  });
}

export interface DatosMailPagoRechazado {
  numero: number;
  nombreCompleto: string;
  email: string;
  pagoDescripcion: string;
  nota: string | null;
}

/**
 * Mail al rechazar un pago: no acusa, invita a resolverlo por privado. El
 * motivo real (nota interna del panel) no se expone tal cual — puede tener
 * lenguaje pensado para el equipo, no para la persona.
 */
export async function enviarPagoRechazado(
  env: EnvMail,
  datos: DatosMailPagoRechazado
): Promise<ResultadoEnvio> {
  const primerNombre = datos.nombreCompleto.trim().split(/\s+/)[0] || 'Hermana';

  const html = plantilla(
    'Un detalle con tu pago',
    `
    <h2 style="margin:0 0 12px;color:#5D2304;font-size:20px;">Hola ${escaparHtml(primerNombre)}, necesitamos revisar tu pago</h2>
    <p style="margin:0 0 20px;color:#5C4A3A;font-size:14px;line-height:1.6;">
      Estuvimos revisando tu comprobante para <strong>Renueva 2026</strong> y todavía no pudimos
      confirmarlo del lado del banco. No te preocupes: tu inscripción sigue registrada,
      simplemente necesitamos que nos ayudes a aclarar este pago.
    </p>

    <div style="background:#FCEEE4;border:1px solid #F2D6BE;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0;color:#8a5a2e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">
        Pago a revisar
      </p>
      <p style="margin:2px 0 0;color:#5D2304;font-size:16px;font-weight:600;">
        ${escaparHtml(datos.pagoDescripcion)}
      </p>
    </div>

    <p style="margin:0 0 20px;color:#5C4A3A;font-size:14px;line-height:1.6;">
      Respondé este mismo mail (o escribinos por WhatsApp) contándonos cómo y cuándo hiciste
      la transferencia, y lo resolvemos juntas a la brevedad.
    </p>

    <p style="margin:0;color:#8a7a68;font-size:12px;">N.º de inscripción #${String(datos.numero).padStart(3, '0')}</p>`
  );

  return enviarMail(env, {
    to: datos.email,
    subject: `Necesitamos revisar tu pago · Renueva 2026 · #${String(datos.numero).padStart(3, '0')}`,
    html
  });
}

export interface DatosMailRecordatorio {
  numero: number;
  nombreCompleto: string;
  email: string;
  detalle: string;
}

/** Mail de recordatorio de pago pendiente, disparado a mano desde el panel. */
export async function enviarRecordatorioPago(
  env: EnvMail,
  datos: DatosMailRecordatorio
): Promise<ResultadoEnvio> {
  const primerNombre = datos.nombreCompleto.trim().split(/\s+/)[0] || 'Hermana';

  const html = plantilla(
    'Recordatorio de pago',
    `
    <h2 style="margin:0 0 12px;color:#5D2304;font-size:20px;">¡Hola ${escaparHtml(primerNombre)}!</h2>
    <p style="margin:0 0 20px;color:#5C4A3A;font-size:14px;line-height:1.6;">
      Te escribimos de Alegría Retreats por tu inscripción a <strong>Renueva 2026</strong>
      (#${String(datos.numero).padStart(3, '0')}). Vemos que ${escaparHtml(datos.detalle)} para
      confirmar tu lugar en el retiro.
    </p>

    <div style="background:#FDF5ED;border:1px solid #ECDCCA;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;color:#8a7a68;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">
        Datos para transferir
      </p>
      <table style="width:100%;border-collapse:collapse;">
        ${linea('Titular', 'Alegria BeWell House')}
        ${linea('BSB', '062559')}
        ${linea('Cuenta', '10485590')}
        ${linea('Referencia', 'Tu nombre completo + RENUEVA')}
      </table>
    </div>

    <p style="margin:0;color:#5C4A3A;font-size:13px;line-height:1.6;">
      Cuando hagas la transferencia, respondé este mismo mail con la captura del comprobante y
      te confirmamos enseguida. ¡Gracias!
    </p>`
  );

  return enviarMail(env, {
    to: datos.email,
    subject: `Recordatorio de pago · Renueva 2026 · #${String(datos.numero).padStart(3, '0')}`,
    html
  });
}
