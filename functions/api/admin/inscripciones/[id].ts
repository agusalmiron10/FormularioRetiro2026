/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdminEnv, requireAdmin } from '../_auth';

export const onRequestPatch: PagesFunction<AdminEnv> = async (context) => {
  const { request, env, params } = context;

  const rechazo = requireAdmin(request, env);
  if (rechazo) return rechazo;

  const inscripcionId = Number(params.id);
  if (!inscripcionId || isNaN(inscripcionId)) {
    return Response.json({ ok: false, error: 'ID inválido' }, { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return Response.json({ ok: false, error: 'Cuerpo de la petición inválido' }, { status: 400 });
  }

  // Lista de campos permitidos para actualizar
  const permitidos = [
    'nombre_completo', 'email', 'telefono', 'direccion', 'fecha_nacimiento', 
    'contacto_emergencia_nombre', 'contacto_emergencia_telefono', 'idioma', 
    'origen_viaje', 'dieta_otro', 'apoyo_otras_mujeres', 'condicion_medica', 
    'preferencia_habitacion', 'transporte', 'oracion', 'expectativas_otro', 
    'como_se_entero', 'comentarios'
  ];

  const sets: string[] = [];
  const vals: any[] = [];
  
  for (const [key, value] of Object.entries(body)) {
    if (permitidos.includes(key)) {
      sets.push(`${key} = ?`);
      vals.push(value);
    }
  }

  if (sets.length === 0) {
    return Response.json({ ok: false, error: 'No hay campos válidos para actualizar' }, { status: 400 });
  }

  vals.push(inscripcionId);

  try {
    const stmt = `UPDATE inscripciones SET ${sets.join(', ')} WHERE id = ?`;
    await env.DB.prepare(stmt).bind(...vals).run();
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Error al actualizar inscripción', err);
    return Response.json({ ok: false, error: 'Fallo al actualizar la base de datos' }, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<AdminEnv> = async (context) => {
  const { request, env, params } = context;

  const rechazo = requireAdmin(request, env);
  if (rechazo) return rechazo;

  const inscripcionId = Number(params.id);
  if (!inscripcionId || isNaN(inscripcionId)) {
    return Response.json({ ok: false, error: 'ID inválido' }, { status: 400 });
  }

  try {
    // Los pagos asociados se borrarán automáticamente porque la tabla pagos
    // tiene `inscripcion_id INTEGER NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE`
    await env.DB.prepare('DELETE FROM inscripciones WHERE id = ?').bind(inscripcionId).run();
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Error al borrar inscripción', err);
    return Response.json({ ok: false, error: 'Fallo al borrar en la base de datos' }, { status: 500 });
  }
};
