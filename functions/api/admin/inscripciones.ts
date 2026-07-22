/**
 * GET /api/admin/inscripciones
 *
 * Listado completo para el panel, con los pagos de cada inscripción y los
 * totales de arriba. Filtros opcionales: ?estado=pendiente|verificado|rechazado
 * y ?q=texto (nombre o email).
 */

import { AdminEnv, json, requireAdmin } from './_auth';

interface FilaInscripcion {
  id: number;
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
  dieta: string;
  dieta_otro: string | null;
  apoyo_otras_mujeres: string | null;
  condicion_medica: string | null;
  preferencia_habitacion: string | null;
  transporte: string | null;
  oracion: string | null;
  expectativas: string;
  expectativas_otro: string | null;
  como_se_entero: string | null;
  comentarios: string | null;
  creado_en: string;
}

interface FilaPago {
  id: number;
  inscripcion_id: number;
  tipo: string;
  descripcion: string;
  monto: number | null;
  metodo: string;
  estado: string;
  comprobante_key: string | null;
  comprobante_nombre: string | null;
  reportado_en: string;
  pagado_en: string | null;
  verificado_en: string | null;
  verificado_por: string | null;
  nota_admin: string | null;
}

const listaDeJson = (valor: string | null): string[] => {
  try {
    const parsed = JSON.parse(valor ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const onRequestGet: PagesFunction<AdminEnv> = async ({ request, env }) => {
  const rechazo = requireAdmin(request, env);
  if (rechazo) return rechazo;

  const url = new URL(request.url);
  const estado = url.searchParams.get('estado') ?? '';
  const busqueda = (url.searchParams.get('q') ?? '').trim().toLowerCase();

  try {
    const [inscripciones, pagos] = await Promise.all([
      env.DB.prepare('SELECT * FROM inscripciones ORDER BY id').all<FilaInscripcion>(),
      env.DB.prepare('SELECT * FROM pagos ORDER BY reportado_en').all<FilaPago>()
    ]);

    const pagosPorInscripcion = new Map<number, FilaPago[]>();
    for (const pago of pagos.results) {
      const lista = pagosPorInscripcion.get(pago.inscripcion_id) ?? [];
      lista.push(pago);
      pagosPorInscripcion.set(pago.inscripcion_id, lista);
    }

    // Orden de llegada del dinero: sólo cuenta lo verificado.
    const puestos = new Map<number, number>();
    pagos.results
      .filter((p) => p.estado === 'verificado')
      .sort((a, b) =>
        (a.pagado_en ?? a.reportado_en).localeCompare(b.pagado_en ?? b.reportado_en)
      )
      .forEach((pago, i) => puestos.set(pago.id, i + 1));

    let resultado = inscripciones.results.map((fila) => {
      const suyos = pagosPorInscripcion.get(fila.id) ?? [];
      return {
        ...fila,
        dieta: listaDeJson(fila.dieta),
        expectativas: listaDeJson(fila.expectativas),
        pagos: suyos.map((p) => ({ ...p, puesto: puestos.get(p.id) ?? null })),
        total_verificado: suyos
          .filter((p) => p.estado === 'verificado')
          .reduce((acc, p) => acc + (p.monto ?? 0), 0),
        tiene_pendientes: suyos.some((p) => p.estado === 'pendiente')
      };
    });

    if (estado) {
      resultado = resultado.filter((i) => i.pagos.some((p) => p.estado === estado));
    }

    if (busqueda) {
      resultado = resultado.filter(
        (i) =>
          i.nombre_completo.toLowerCase().includes(busqueda) ||
          i.email.toLowerCase().includes(busqueda)
      );
    }

    const verificados = pagos.results.filter((p) => p.estado === 'verificado');
    const pendientes = pagos.results.filter((p) => p.estado === 'pendiente');

    // Quiénes pagaron una primera cuota y todavía no registraron la segunda.
    const conPrimera = new Set(
      pagos.results
        .filter((p) => p.tipo === 'early-1' || p.tipo === 'volunteer-1')
        .map((p) => p.inscripcion_id)
    );
    const conSegunda = new Set(
      pagos.results
        .filter((p) => p.tipo === 'early-2' || p.tipo === 'volunteer-2')
        .map((p) => p.inscripcion_id)
    );
    const debenSegundaCuota = [...conPrimera].filter((id) => !conSegunda.has(id));

    return json(
      {
        ok: true,
        resumen: {
          inscriptas: inscripciones.results.length,
          pagos_verificados: verificados.length,
          pagos_pendientes: pendientes.length,
          recaudado: verificados.reduce((acc, p) => acc + (p.monto ?? 0), 0),
          por_confirmar: pendientes.reduce((acc, p) => acc + (p.monto ?? 0), 0),
          deben_segunda_cuota: debenSegundaCuota.length
        },
        inscripciones: resultado
      },
      200
    );
  } catch (err) {
    console.error('Error listando inscripciones', err);
    return json({ ok: false, error: 'No pudimos leer las inscripciones.' }, 500);
  }
};
