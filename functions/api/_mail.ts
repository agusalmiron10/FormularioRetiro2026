/**
 * Envío de mails vía Resend.
 *
 * Si falla el envío no se aborta la inscripción — ya está guardada en la
 * base, que es lo que importa. El mail es una cortesía; si no sale, queda
 * en el panel para que el equipo la vea igual.
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

/** Manda el mail de confirmación de inscripción. Nunca lanza: sólo informa si falló. */
export async function enviarConfirmacionInscripcion(
  env: EnvMail,
  datos: DatosMailConfirmacion
): Promise<{ enviado: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurada: se omite el mail de confirmación.');
    return { enviado: false, error: 'RESEND_API_KEY no configurada' };
  }

  const primerNombre = datos.nombreCompleto.trim().split(/\s+/)[0] || 'Hermana';
  const idiomaTexto =
    datos.idioma === 'es' ? 'Español' : datos.idioma === 'en' ? 'Inglés' : 'Ambos';
  const montoTexto =
    datos.pagoMonto !== null ? `$${datos.pagoMonto} AUD` : 'A definir con el equipo';

  const html = `
  <div style="font-family:Georgia,'Times New Roman',serif;background:#FCF9F2;padding:32px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ECDCCA;">
      <div style="background:#5D2304;padding:28px 32px;">
        <h1 style="margin:0;color:#FCF9F2;font-size:22px;">RENUEVA 2026</h1>
        <p style="margin:4px 0 0;color:#F2E5D5;font-size:13px;">Alegría Retreats</p>
      </div>
      <div style="padding:32px;">
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
        </p>
      </div>
      <div style="background:#F8EDE0;padding:16px 32px;text-align:center;">
        <p style="margin:0;color:#8a7a68;font-size:11px;">Alegría Retreats · Wisemans Retreat, NSW</p>
      </div>
    </div>
  </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: [datos.email],
        reply_to: RESPONDER_A,
        subject: `Recibimos tu inscripción · Renueva 2026 · #${String(datos.numero).padStart(3, '0')}`,
        html
      })
    });

    if (!res.ok) {
      const cuerpo = await res.text().catch(() => '');
      console.error('Resend rechazó el envío', res.status, cuerpo);
      return { enviado: false, error: `Resend devolvió ${res.status}` };
    }

    return { enviado: true };
  } catch (err) {
    console.error('Error de red enviando el mail de confirmación', err);
    return { enviado: false, error: 'Error de red' };
  }
}
