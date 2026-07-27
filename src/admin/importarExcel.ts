/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Lee un Excel/CSV de respuestas de Google Forms (como el que exporta el
 * formulario histórico de RENUEVA) y lo convierte a filas listas para
 * mandar a POST /api/admin/importar.
 *
 * El mapeo busca los encabezados por sub-texto en vez de exigir una
 * coincidencia exacta: las preguntas de Google Forms son frases largas y
 * estables, así que un match parcial es confiable y tolera pequeños
 * cambios de redacción entre versiones del formulario.
 */

import * as XLSX from 'xlsx';

export interface FilaImportada {
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
  pagos: { tipo: string; descripcion: string; monto: number | null }[];
  /** Filas que el mapeo no pudo interpretar con confianza. Se muestran en la vista previa. */
  advertencias: string[];
}

type Fila = Record<string, unknown>;

const columna = (fila: Fila, ...pistas: string[]): string => {
  const clave = Object.keys(fila).find((k) =>
    pistas.some((p) => k.toLowerCase().includes(p.toLowerCase()))
  );
  return clave ? String(fila[clave] ?? '').trim() : '';
};

const dividir = (texto: string): string[] =>
  texto
    .split(/,\s*(?=[A-ZÁÉÍÓÚÑ¿])/)
    .map((s) => s.replace(/\.\s*$/, '').trim())
    .filter(Boolean);

const esNoAplica = (texto: string): boolean => /^(n\/?a|ninguna?|no aplica)\.?$/i.test(texto.trim());

const pareceNombrePersona = (texto: string): boolean =>
  texto.length > 0 &&
  texto.split(/\s+/).length <= 4 &&
  !/\d/.test(texto) &&
  !/(alerg|asma|diabet|medicament|condici[oó]n|dolor|embaraz|operaci[oó]n|lesi[oó]n|cirug|enfermedad)/i.test(
    texto
  );

const idiomaDe = (texto: string): string => {
  const t = texto.toLowerCase();
  if (t.includes('ambos')) return 'both';
  const es = t.includes('español');
  const en = t.includes('ingles') || t.includes('inglés');
  if (es && en) return 'both';
  if (en) return 'en';
  return 'es';
};

const edadDe = (valor: unknown): number | null => {
  const m = String(valor ?? '').match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : null;
};

/**
 * Interpreta la respuesta de "¿Qué pago estás realizando?" y arma uno o dos
 * pagos. El caso especial: si menciona "primera" y "segunda" cuota a la vez
 * (formularios donde esa pregunta era de selección múltiple), sólo se carga
 * la primera — la segunda todavía no ocurrió.
 */
const pagosDe = (texto: string): { tipo: string; descripcion: string; monto: number | null }[] => {
  if (!texto) return [];
  const t = texto.toLowerCase();

  const prefijo = t.includes('voluntaria') ? 'volunteer' : t.includes('regular') ? 'regular' : 'early';
  const montoEnTexto = texto.match(/\$\s?(\d+)/)?.[1];
  const monto = montoEnTexto ? Number.parseInt(montoEnTexto, 10) : null;

  const mencionaPrimera = /primera cuota|dep[oó]sito/i.test(t);
  const mencionaSegunda = /segunda cuota/i.test(t);

  // Si menciona las dos (formularios donde esta pregunta era de selección
  // múltiple), se carga sólo la primera: la segunda todavía no ocurrió.
  if (mencionaPrimera) {
    return [{ tipo: `${prefijo}-1`, descripcion: texto, monto: monto ?? 225 }];
  }
  if (mencionaSegunda) {
    return [{ tipo: `${prefijo}-2`, descripcion: texto, monto: monto ?? 225 }];
  }
  if (t.includes('completo')) {
    const defecto = prefijo === 'regular' ? 480 : prefijo === 'early' ? 450 : null;
    // El formulario viejo mostraba $449 para el pago completo anticipado; el
    // precio vigente es $450, así que se normaliza al importar.
    const montoNormalizado = prefijo === 'early' && monto === 449 ? 450 : (monto ?? defecto);
    return [{ tipo: `${prefijo}-full`, descripcion: texto, monto: montoNormalizado }];
  }

  return [{ tipo: 'otro', descripcion: texto, monto }];
};

const fechaDe = (valor: unknown): string | null => {
  if (valor instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${valor.getFullYear()}-${pad(valor.getMonth() + 1)}-${pad(valor.getDate())} ${pad(valor.getHours())}:${pad(valor.getMinutes())}:${pad(valor.getSeconds())}`;
  }
  return null;
};

export function mapearFila(fila: Fila): FilaImportada {
  const advertencias: string[] = [];

  const nombre = columna(fila, 'nombre y apellidos');
  const email = (columna(fila, 'email:') || columna(fila, 'email address')).toLowerCase();
  if (!nombre) advertencias.push('Sin nombre.');
  if (!email) advertencias.push('Sin email.');

  const medicoRoommate = columna(fila, 'condición médica', 'condicion medica', 'requisito o condición');
  let condicionMedica: string | null = null;
  let preferenciaHabitacion: string | null = null;
  if (medicoRoommate && !esNoAplica(medicoRoommate)) {
    if (pareceNombrePersona(medicoRoommate)) {
      preferenciaHabitacion = medicoRoommate;
    } else {
      condicionMedica = medicoRoommate;
      advertencias.push('Revisar: puede mezclar condición médica y compañera de cuarto.');
    }
  }

  const pagoTexto = columna(fila, 'opciones de pago', 'qué pago estás realizando');
  const pagos = pagosDe(pagoTexto);
  if (pagos.length === 0) advertencias.push('No se pudo interpretar el pago.');

  return {
    nombre_completo: nombre,
    email,
    telefono: columna(fila, 'numero de telefono', 'número de teléfono:'),
    direccion: columna(fila, 'dirección'),
    fecha_nacimiento: columna(fila, 'fecha de nacimiento'),
    edad: edadDe(columna(fila, 'edad')),
    contacto_emergencia_nombre: columna(fila, 'nombre de contacto de emergencia'),
    contacto_emergencia_telefono: columna(fila, 'teléfono del contacto de emergencia'),
    idioma: idiomaDe(columna(fila, 'idioma de preferencia')),
    origen_viaje: columna(fila, 'ciudad o país viajarás'),
    dieta: dividir(columna(fila, 'requerimiento alimenticio')),
    dieta_otro: null,
    apoyo_otras_mujeres: columna(fila, 'apoyar a otras mujeres') || null,
    condicion_medica: condicionMedica,
    preferencia_habitacion: preferenciaHabitacion,
    transporte: columna(fila, 'información sobre el transporte', 'seleccioná una opción:') || null,
    oracion: columna(fila, 'tiempo especial de oración') || null,
    expectativas: dividir(columna(fila, 'esperas recibir o experimentar')),
    expectativas_otro: null,
    como_se_entero: columna(fila, 'cómo te enteraste') || null,
    comentarios: columna(fila, 'gracias por registrarte') || null,
    creado_en: fechaDe(fila['Timestamp']),
    pagos,
    advertencias
  };
}

export async function leerArchivoImportacion(file: File): Promise<FilaImportada[]> {
  const buffer = await file.arrayBuffer();
  const libro = XLSX.read(buffer, { type: 'array', cellDates: true });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json<Fila>(hoja, { defval: '' });
  return filas.map(mapearFila);
}
