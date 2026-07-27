/**
 * POST /api/admin/importar
 *
 * Carga masiva de inscripciones, para respaldar planillas de registros que
 * existían antes de este sitio (ej. el Google Form original).
 *
 * A propósito, distinto del alta pública:
 *  - No manda ningún mail. Son personas que ya se anotaron hace tiempo;
 *    reenviarles el mail de bienvenida hoy sería confuso.
 *  - Los pagos entran siempre en 'pendiente'. No hay comprobante adjunto
 *    para estas filas, así que nadie queda "verificada" sin que el equipo
 *    lo chequee contra el banco primero.
 *  - Si el email ya existe en la base, esa fila se salta — nunca pisa una
 *    inscripción real que ya esté cargada.
 */

import { AdminEnv, json, requireAdmin } from './_auth';

interface PagoImportado {
  tipo: string;
  descripcion: string;
  monto: number | null;
}

interface FilaImportada {
  nombre_completo: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento: string;
  edad: number | null;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  idioma: string;
  origen_viaje: string;
  dieta: string[];
  dieta_otro: string | null;
  apoyo_otras_mujeres: string | null;
  condicion_medica: string | null;
  preferencia_habitacion: string | null;
  transporte: string | null;
  oracion: string | null;
  expectativas: string[];
  expectativas_otro: string | null;
  como_se_entero: string | null;
  comentarios: string | null;
  creado_en: string | null;
  pagos: PagoImportado[];
}

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const listaJson = (v: unknown): string =>
  JSON.stringify(Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

export const onRequestPost: PagesFunction<AdminEnv> = async ({ request, env }) => {
  const rechazo = requireAdmin(request, env);
  if (rechazo) return rechazo;

  let cuerpo: { filas?: FilaImportada[] };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ ok: false, error: 'No pudimos leer la petición.' }, 400);
  }

  const filas = Array.isArray(cuerpo.filas) ? cuerpo.filas : [];
  if (filas.length === 0) {
    return json({ ok: false, error: 'No hay filas para importar.' }, 400);
  }

  const insertadas: string[] = [];
  const omitidas: { email: string; motivo: string }[] = [];

  for (const fila of filas) {
    const email = texto(fila.email).toLowerCase();
    const nombre = texto(fila.nombre_completo);

    if (!email || !nombre) {
      omitidas.push({ email: email || '(sin email)', motivo: 'Falta nombre o email.' });
      continue;
    }

    try {
      const yaExiste = await env.DB.prepare('SELECT id FROM inscripciones WHERE email = ?')
        .bind(email)
        .first<{ id: number }>();

      if (yaExiste) {
        omitidas.push({ email, motivo: 'Ya existe una inscripción con ese email.' });
        continue;
      }

      const creadoEn = texto(fila.creado_en) || undefined;

      const inscripcion = await env.DB.prepare(
        `INSERT INTO inscripciones (
           nombre_completo, email, telefono, direccion, fecha_nacimiento, edad,
           contacto_emergencia_nombre, contacto_emergencia_telefono,
           idioma, origen_viaje, dieta, dieta_otro,
           apoyo_otras_mujeres, condicion_medica, preferencia_habitacion,
           transporte, oracion, expectativas, expectativas_otro, como_se_entero,
           confirma_reserva, confirma_cancelacion, confirma_terminos, comentarios,
           creado_en, token_publico
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, COALESCE(?, datetime('now')), ?)
         RETURNING id`
      )
        .bind(
          nombre,
          email,
          texto(fila.telefono),
          texto(fila.direccion),
          texto(fila.fecha_nacimiento),
          fila.edad ?? null,
          texto(fila.contacto_emergencia_nombre),
          texto(fila.contacto_emergencia_telefono),
          texto(fila.idioma) || 'es',
          texto(fila.origen_viaje),
          listaJson(fila.dieta),
          texto(fila.dieta_otro) || null,
          texto(fila.apoyo_otras_mujeres) || null,
          texto(fila.condicion_medica) || null,
          texto(fila.preferencia_habitacion) || null,
          texto(fila.transporte) || null,
          texto(fila.oracion) || null,
          listaJson(fila.expectativas),
          texto(fila.expectativas_otro) || null,
          texto(fila.como_se_entero) || null,
          1,
          1,
          1,
          texto(fila.comentarios) || null,
          creadoEn ?? null,
          crypto.randomUUID()
        )
        .first<{ id: number }>();

      if (!inscripcion) throw new Error('La inserción no devolvió id');

      for (const pago of fila.pagos ?? []) {
        await env.DB.prepare(
          `INSERT INTO pagos (
             inscripcion_id, tipo, descripcion, monto, metodo, estado, reportado_en
           ) VALUES (?,?,?,?,'transferencia','pendiente', COALESCE(?, datetime('now')))`
        )
          .bind(
            inscripcion.id,
            texto(pago.tipo) || 'otro',
            texto(pago.descripcion),
            pago.monto ?? null,
            creadoEn ?? null
          )
          .run();
      }

      insertadas.push(email);
    } catch (err) {
      console.error('Error importando fila', email, err);
      omitidas.push({ email, motivo: 'Error al guardar en la base.' });
    }
  }

  return json({ ok: true, insertadas: insertadas.length, omitidas }, 200);
};
