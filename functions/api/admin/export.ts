/**
 * GET /api/admin/export?formato=xlsx|csv
 *
 * Genera la planilla en el momento, siempre con los datos actuales. Una fila
 * por pago, así se ve el orden real de llegada del dinero y las dos cuotas de
 * una misma persona quedan como filas distintas.
 *
 * El CSV existe para el refresco automático desde Excel
 * (Datos → Obtener datos → Desde la web), que necesita el token en la URL.
 */

import { AdminEnv, requireAdmin, json } from './_auth';
import { Celda, construirCsv, construirXlsx } from './_xlsx';

interface FilaExport {
  puesto_provisorio: number;
  inscripcion_id: number;
  nombre_completo: string;
  email: string;
  telefono: string;
  origen_viaje: string;
  idioma: string;
  dieta: string;
  dieta_otro: string | null;
  condicion_medica: string | null;
  preferencia_habitacion: string | null;
  transporte: string | null;
  oracion: string | null;
  apoyo_otras_mujeres: string | null;
  como_se_entero: string | null;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  pago_descripcion: string | null;
  monto: number | null;
  metodo: string | null;
  estado: string | null;
  reportado_en: string | null;
  pagado_en: string | null;
  verificado_en: string | null;
  verificado_por: string | null;
  nota_admin: string | null;
  creado_en: string;
}

const ENCABEZADOS = [
  'Orden de pago',
  'N° inscripción',
  'Nombre y apellidos',
  'Email',
  'Teléfono',
  'Pago',
  'Monto (AUD)',
  'Método',
  'Estado',
  'Fecha del pago',
  'Reportado',
  'Verificado',
  'Verificado por',
  'Nota',
  'Viaja desde',
  'Idioma',
  'Alimentación',
  'Otra alimentación',
  'Condición médica',
  'Compañera de habitación',
  'Transporte',
  'Tiempo de oración',
  'Apoyo a otras mujeres',
  'Cómo se enteró',
  'Contacto emergencia',
  'Tel. emergencia',
  'Inscripta el'
];

const nombreLegible = (valor: string | null): string => {
  try {
    const lista = JSON.parse(valor ?? '[]');
    return Array.isArray(lista) ? lista.join(', ') : String(valor ?? '');
  } catch {
    return String(valor ?? '');
  }
};

export const onRequestGet: PagesFunction<AdminEnv> = async ({ request, env }) => {
  const rechazo = requireAdmin(request, env, true);
  if (rechazo) return rechazo;

  const formato = new URL(request.url).searchParams.get('formato') === 'csv' ? 'csv' : 'xlsx';

  try {
    const { results } = await env.DB.prepare(
      `SELECT
         i.id AS inscripcion_id, i.nombre_completo, i.email, i.telefono,
         i.origen_viaje, i.idioma, i.dieta, i.dieta_otro, i.condicion_medica,
         i.preferencia_habitacion, i.transporte, i.oracion, i.apoyo_otras_mujeres,
         i.como_se_entero, i.contacto_emergencia_nombre, i.contacto_emergencia_telefono,
         i.creado_en,
         p.descripcion AS pago_descripcion, p.monto, p.metodo, p.estado,
         p.reportado_en, p.pagado_en, p.verificado_en, p.verificado_por, p.nota_admin
       FROM inscripciones i
       LEFT JOIN pagos p ON p.inscripcion_id = i.id
       ORDER BY COALESCE(p.pagado_en, p.reportado_en), i.id`
    ).all<FilaExport>();

    // El puesto se numera sólo entre los pagos verificados.
    let puesto = 0;
    const filas: Celda[][] = [ENCABEZADOS];

    for (const f of results) {
      const verificado = f.estado === 'verificado';
      if (verificado) puesto += 1;

      filas.push([
        verificado ? puesto : '',
        f.inscripcion_id,
        f.nombre_completo,
        f.email,
        f.telefono,
        f.pago_descripcion ?? 'Sin pago registrado',
        f.monto ?? '',
        f.metodo ?? '',
        f.estado ?? '',
        f.pagado_en ?? '',
        f.reportado_en ?? '',
        f.verificado_en ?? '',
        f.verificado_por ?? '',
        f.nota_admin ?? '',
        f.origen_viaje,
        f.idioma === 'es' ? 'Español' : f.idioma === 'en' ? 'Inglés' : 'Ambos',
        nombreLegible(f.dieta),
        f.dieta_otro ?? '',
        f.condicion_medica ?? '',
        f.preferencia_habitacion ?? '',
        f.transporte ?? '',
        f.oracion ?? '',
        f.apoyo_otras_mujeres ?? '',
        f.como_se_entero ?? '',
        f.contacto_emergencia_nombre,
        f.contacto_emergencia_telefono,
        f.creado_en
      ]);
    }

    const sello = new Date().toISOString().slice(0, 10);

    if (formato === 'csv') {
      return new Response(construirCsv(filas), {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="renueva-2026-${sello}.csv"`,
          'cache-control': 'no-store'
        }
      });
    }

    return new Response(construirXlsx(filas), {
      headers: {
        'content-type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'content-disposition': `attachment; filename="renueva-2026-${sello}.xlsx"`,
        'cache-control': 'no-store'
      }
    });
  } catch (err) {
    console.error('Error generando la exportación', err);
    return json({ ok: false, error: 'No pudimos generar la planilla.' }, 500);
  }
};
