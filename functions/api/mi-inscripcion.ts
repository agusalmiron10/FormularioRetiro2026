/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GET /api/mi-inscripcion?t=<token>
 *
 * Portal de sólo lectura para que cada persona vea el estado de su propia
 * inscripción sin login — el token largo y aleatorio (token_publico) hace
 * las veces de contraseña. A propósito devuelve lo mínimo: sólo lo
 * necesario para responder "¿ya llegó mi pago?", nada de teléfono,
 * dirección, contacto de emergencia ni condición médica — si el link se
 * comparte o se filtra, el daño posible queda acotado.
 */

interface EnvPublico {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<EnvPublico> = async ({ request, env }) => {
  const token = new URL(request.url).searchParams.get('t')?.trim();
  if (!token) {
    return Response.json({ ok: false, error: 'Falta el link completo.' }, { status: 400 });
  }

  const inscripcion = await env.DB.prepare(
    'SELECT id, nombre_completo FROM inscripciones WHERE token_publico = ?'
  )
    .bind(token)
    .first<{ id: number; nombre_completo: string }>();

  if (!inscripcion) {
    return Response.json({ ok: false, error: 'No encontramos ninguna inscripción con ese link.' }, { status: 404 });
  }

  const { results: pagos } = await env.DB.prepare(
    `SELECT tipo, descripcion, monto, estado, pagado_en
       FROM pagos WHERE inscripcion_id = ? ORDER BY reportado_en`
  )
    .bind(inscripcion.id)
    .all<{ tipo: string; descripcion: string; monto: number | null; estado: string; pagado_en: string | null }>();

  return Response.json({
    ok: true,
    numero: inscripcion.id,
    nombre: inscripcion.nombre_completo.trim().split(/\s+/)[0] || 'Hola',
    pagos: pagos.map(({ tipo: _tipo, ...resto }) => resto),
    resumen: resumenDeuda(pagos)
  });
};

/**
 * Mismo criterio que usa el panel para decidir si alguien "debe" plata
 * (ver src/admin/recordatorios.ts): pago único sin verificar -> debe el
 * total; primera cuota verificada sin segunda -> debe la segunda; todo
 * verificado -> al día.
 */
function resumenDeuda(
  pagos: { tipo: string; monto: number | null; estado: string }[]
): { estado: 'debe' | 'al_dia' | 'en_revision' | 'sin_pagos'; mensaje: string; monto: number | null } {
  if (pagos.length === 0) {
    return { estado: 'sin_pagos', mensaje: 'Todavía no tenés ningún pago registrado.', monto: null };
  }

  const pagoUnico = pagos.find((p) => ['early-full', 'regular-full', 'volunteer-full'].includes(p.tipo));
  if (pagoUnico && pagoUnico.estado !== 'verificado') {
    return pagoUnico.monto
      ? { estado: 'debe', mensaje: `Te falta abonar el total de $${pagoUnico.monto} AUD.`, monto: pagoUnico.monto }
      : { estado: 'debe', mensaje: 'Te falta completar tu pago.', monto: null };
  }

  const primeraVerificada = pagos.find(
    (p) => (p.tipo === 'early-1' || p.tipo === 'volunteer-1') && p.estado === 'verificado'
  );
  const yaTieneSegunda = pagos.some((p) => p.tipo === 'early-2' || p.tipo === 'volunteer-2');
  if (primeraVerificada && !yaTieneSegunda) {
    const monto = primeraVerificada.tipo === 'early-1' ? 225 : null;
    return monto
      ? { estado: 'debe', mensaje: `Te falta la segunda cuota de $${monto} AUD.`, monto }
      : { estado: 'debe', mensaje: 'Te falta la segunda cuota.', monto: null };
  }

  if (pagos.every((p) => p.estado === 'verificado')) {
    return { estado: 'al_dia', mensaje: '¡Ya está todo al día! Te esperamos en el retiro.', monto: null };
  }

  return { estado: 'en_revision', mensaje: 'Tu pago está en revisión — te avisamos apenas lo confirmemos.', monto: null };
}
