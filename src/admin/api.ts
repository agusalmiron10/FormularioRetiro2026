/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pago {
  id: number;
  inscripcion_id: number;
  tipo: string;
  descripcion: string;
  monto: number | null;
  metodo: string;
  estado: 'pendiente' | 'verificado' | 'rechazado';
  comprobante_key: string | null;
  comprobante_nombre: string | null;
  comprobante_tipo: string | null;
  reportado_en: string;
  pagado_en: string | null;
  verificado_en: string | null;
  verificado_por: string | null;
  nota_admin: string | null;
  puesto: number | null;
}

export interface Inscripcion {
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
  creado_en: string;
  pagos: Pago[];
  total_verificado: number;
  tiene_pendientes: boolean;
}

export interface Resumen {
  inscriptas: number;
  pagos_verificados: number;
  pagos_pendientes: number;
  recaudado: number;
  por_confirmar: number;
  deben_segunda_cuota: number;
}

export interface Listado {
  resumen: Resumen;
  inscripciones: Inscripcion[];
}

const TOKEN_KEY = 'renueva_admin_token';

/** El token vive sólo mientras dure la pestaña. */
export const guardarToken = (token: string) => sessionStorage.setItem(TOKEN_KEY, token);
export const leerToken = (): string => sessionStorage.getItem(TOKEN_KEY) ?? '';
export const borrarToken = () => sessionStorage.removeItem(TOKEN_KEY);

class ErrorApi extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

async function pedir<T>(url: string, opciones: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...opciones,
    headers: { ...(opciones.headers ?? {}), 'x-admin-token': leerToken() }
  });

  const data = (await res.json().catch(() => null)) as
    | ({ ok: boolean; error?: string } & T)
    | null;

  if (!res.ok || !data?.ok) {
    throw new ErrorApi(data?.error ?? 'Error inesperado del servidor.', res.status);
  }

  return data;
}

export const cargarListado = (filtros: { estado?: string; q?: string }) => {
  const params = new URLSearchParams();
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.q) params.set('q', filtros.q);
  return pedir<Listado>(`/api/admin/inscripciones?${params}`);
};

export const actualizarPago = (
  id: number,
  cambios: { estado: string; pagado_en?: string; nota?: string }
) =>
  pedir<Record<string, never>>(`/api/admin/pagos/${id}/verificar`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(cambios)
  });

/** El token va en la URL porque <img> y las descargas no mandan cabeceras. */
export const urlComprobante = (pagoId: number) =>
  `/api/admin/comprobante/${pagoId}?token=${encodeURIComponent(leerToken())}`;

export const urlExport = (formato: 'xlsx' | 'csv') =>
  `/api/admin/export?formato=${formato}&token=${encodeURIComponent(leerToken())}`;

export { ErrorApi };
