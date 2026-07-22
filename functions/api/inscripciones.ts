/**
 * POST /api/inscripciones
 *
 * Recibe el formulario completo (multipart), guarda el comprobante en R2 y
 * escribe la inscripción y su primer pago en D1.
 */

import { COMPROBANTE, OPCIONES_PAGO, extensionPara, json } from './_catalogo';

interface Env {
  DB: D1Database;
  COMPROBANTES: R2Bucket;
}

interface Payload {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  age?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  language?: string;
  travelOrigin?: string;
  travelOriginOther?: string;
  dietary?: string[];
  otherDietary?: string;
  sponsorship?: string;
  paymentOption?: string;
  paymentMethod?: string;
  medicalNotes?: string;
  roommatePreference?: string;
  transport?: string;
  prayerSession?: string;
  prayerOther?: string;
  expectations?: string[];
  expectationsOther?: string;
  referralSource?: string;
  referralOther?: string;
  confirmReservation?: boolean;
  confirmCancellation?: boolean;
  confirmTerms?: boolean;
  comments?: string;
}

const texto = (valor: unknown): string => (typeof valor === 'string' ? valor.trim() : '');

const listaJson = (valor: unknown): string =>
  JSON.stringify(Array.isArray(valor) ? valor.filter((v) => typeof v === 'string') : []);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'El formato del envío no es válido.' }, 400);
  }

  let datos: Payload;
  try {
    datos = JSON.parse(String(form.get('datos') ?? '{}'));
  } catch {
    return json({ ok: false, error: 'No pudimos leer los datos del formulario.' }, 400);
  }

  // --- Validación (se repite acá porque el navegador no es de fiar) ---
  const errores: string[] = [];

  const obligatorios: [keyof Payload, string][] = [
    ['fullName', 'nombre y apellidos'],
    ['phone', 'teléfono'],
    ['email', 'email'],
    ['address', 'dirección'],
    ['birthDate', 'fecha de nacimiento'],
    ['emergencyName', 'contacto de emergencia'],
    ['emergencyPhone', 'teléfono de emergencia'],
    ['travelOrigin', 'origen del viaje'],
    ['sponsorship', 'apoyo a otras mujeres'],
    ['transport', 'transporte'],
    ['prayerSession', 'tiempo de oración'],
    ['medicalNotes', 'condición médica']
  ];

  for (const [campo, etiqueta] of obligatorios) {
    if (!texto(datos[campo])) errores.push(`Falta ${etiqueta}.`);
  }

  if (texto(datos.email) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(texto(datos.email))) {
    errores.push('El email no tiene un formato válido.');
  }

  const opcion = OPCIONES_PAGO[texto(datos.paymentOption)];
  if (!opcion) errores.push('La opción de pago no es válida.');

  if (!Array.isArray(datos.dietary) || datos.dietary.length === 0) {
    errores.push('Falta indicar los requerimientos alimenticios.');
  }

  if (!Array.isArray(datos.expectations) || datos.expectations.length === 0) {
    errores.push('Falta indicar qué esperás del retiro.');
  }

  if (!datos.confirmReservation || !datos.confirmCancellation || !datos.confirmTerms) {
    errores.push('Faltan las confirmaciones de términos y condiciones.');
  }

  const metodo = texto(datos.paymentMethod) === 'paypal' ? 'paypal' : 'transferencia';
  const archivo = form.get('comprobante');
  const esArchivo = archivo instanceof File && archivo.size > 0;

  // Por transferencia el comprobante es obligatorio; por PayPal lo confirma el webhook.
  if (metodo === 'transferencia' && !esArchivo) {
    errores.push('El comprobante de pago es obligatorio.');
  }

  if (esArchivo) {
    if (!COMPROBANTE.tiposAceptados.includes(archivo.type)) {
      errores.push('El comprobante debe ser una imagen (JPG, PNG, WEBP) o un PDF.');
    }
    if (archivo.size > COMPROBANTE.maxBytes) {
      errores.push(`El comprobante supera los ${COMPROBANTE.maxBytes / 1024 / 1024} MB.`);
    }
  }

  if (errores.length > 0) {
    return json({ ok: false, error: errores[0], errores }, 400);
  }

  // --- Guardar el comprobante en R2 ---
  let comprobanteKey: string | null = null;
  if (esArchivo) {
    const sello = new Date().toISOString().replace(/[:.]/g, '-');
    comprobanteKey = `comprobantes/2026/${sello}-${crypto.randomUUID()}.${extensionPara(archivo.type)}`;
    try {
      await env.COMPROBANTES.put(comprobanteKey, archivo.stream(), {
        httpMetadata: { contentType: archivo.type }
      });
    } catch (err) {
      console.error('Error subiendo el comprobante a R2', err);
      return json(
        { ok: false, error: 'No pudimos guardar el comprobante. Intentá nuevamente.' },
        502
      );
    }
  }

  // --- Escribir en la base ---
  const origen =
    texto(datos.travelOrigin) === 'Otros' || texto(datos.travelOrigin) === 'Desde otro país'
      ? `${texto(datos.travelOrigin)}: ${texto(datos.travelOriginOther)}`
      : texto(datos.travelOrigin);

  const oracion =
    texto(datos.prayerSession) === 'Otros'
      ? `Otros: ${texto(datos.prayerOther)}`
      : texto(datos.prayerSession);

  const comoSeEntero =
    texto(datos.referralSource) === 'Otro (especificar)'
      ? `Otro: ${texto(datos.referralOther)}`
      : texto(datos.referralSource);

  const email = texto(datos.email).toLowerCase();

  try {
    // Si ya se inscribió antes, esto es un pago nuevo sobre la misma ficha
    // (el caso típico: vuelve en agosto a pagar la segunda cuota). Se conservan
    // los datos originales y sólo se agrega el pago.
    const yaInscripta = await env.DB.prepare(
      'SELECT id FROM inscripciones WHERE email = ? ORDER BY id LIMIT 1'
    )
      .bind(email)
      .first<{ id: number }>();

    const inscripcion = yaInscripta
      ? yaInscripta
      : await env.DB.prepare(
      `INSERT INTO inscripciones (
         nombre_completo, email, telefono, direccion, fecha_nacimiento, edad,
         contacto_emergencia_nombre, contacto_emergencia_telefono,
         idioma, origen_viaje, dieta, dieta_otro,
         apoyo_otras_mujeres, condicion_medica, preferencia_habitacion,
         transporte, oracion, expectativas, expectativas_otro, como_se_entero,
         confirma_reserva, confirma_cancelacion, confirma_terminos, comentarios
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       RETURNING id`
    )
      .bind(
        texto(datos.fullName),
        email,
        texto(datos.phone),
        texto(datos.address),
        texto(datos.birthDate),
        Number.parseInt(texto(datos.age), 10) || null,
        texto(datos.emergencyName),
        texto(datos.emergencyPhone),
        texto(datos.language) || 'es',
        origen,
        listaJson(datos.dietary),
        texto(datos.otherDietary) || null,
        texto(datos.sponsorship),
        texto(datos.medicalNotes),
        texto(datos.roommatePreference) || null,
        texto(datos.transport),
        oracion,
        listaJson(datos.expectations),
        texto(datos.expectationsOther) || null,
        comoSeEntero || null,
        1,
        1,
        1,
        texto(datos.comments) || null
      )
      .first<{ id: number }>();

    if (!inscripcion) throw new Error('La inserción no devolvió id');

    const esPagoAdicional = Boolean(yaInscripta);

    await env.DB.prepare(
      `INSERT INTO pagos (
         inscripcion_id, tipo, descripcion, monto, metodo,
         comprobante_key, comprobante_nombre, comprobante_tipo, estado
       ) VALUES (?,?,?,?,?,?,?,?,?)`
    )
      .bind(
        inscripcion.id,
        opcion!.id,
        opcion!.descripcion,
        opcion!.monto,
        metodo,
        comprobanteKey,
        esArchivo ? archivo.name : null,
        esArchivo ? archivo.type : null,
        'pendiente'
      )
      .run();

    return json({ ok: true, numero: inscripcion.id, pagoAdicional: esPagoAdicional });
  } catch (err) {
    console.error('Error guardando la inscripción', err);
    // El comprobante ya subido queda huérfano en R2; se limpia para no dejar basura.
    if (comprobanteKey) {
      await env.COMPROBANTES.delete(comprobanteKey).catch(() => undefined);
    }
    return json(
      { ok: false, error: 'No pudimos guardar tu inscripción. Intentá nuevamente en unos minutos.' },
      500
    );
  }
};
