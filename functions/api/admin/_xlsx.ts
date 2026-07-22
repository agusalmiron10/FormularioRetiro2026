/**
 * Generador mínimo de archivos .xlsx.
 *
 * Un xlsx es un ZIP con unos pocos XML adentro. Se arma a mano en lugar de
 * sumar una librería de un mega al bundle del Worker. Los archivos se guardan
 * sin comprimir (método STORE), que el formato ZIP admite y evita tener que
 * implementar deflate.
 */

export type Celda = string | number | null | undefined;

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[i] = c >>> 0;
  }
  return tabla;
})();

const crc32 = (datos: Uint8Array): number => {
  let c = 0xffffffff;
  for (let i = 0; i < datos.length; i++) c = TABLA_CRC[(c ^ datos[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const escaparXml = (valor: string): string =>
  valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Excel rechaza el archivo si aparecen caracteres de control.
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');

/** 0 -> A, 25 -> Z, 26 -> AA */
const columna = (indice: number): string => {
  let nombre = '';
  let n = indice;
  do {
    nombre = String.fromCharCode(65 + (n % 26)) + nombre;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return nombre;
};

const hojaXml = (filas: Celda[][]): string => {
  const cuerpo = filas
    .map((fila, f) => {
      const celdas = fila
        .map((valor, c) => {
          const ref = `${columna(c)}${f + 1}`;
          if (valor === null || valor === undefined || valor === '') return '';
          if (typeof valor === 'number' && Number.isFinite(valor)) {
            return `<c r="${ref}"><v>${valor}</v></c>`;
          }
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escaparXml(String(valor))}</t></is></c>`;
        })
        .join('');
      return `<row r="${f + 1}">${celdas}</row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${cuerpo}</sheetData></worksheet>`;
};

interface Entrada {
  nombre: string;
  datos: Uint8Array;
  crc: number;
}

const escribirUint32 = (vista: DataView, pos: number, valor: number) =>
  vista.setUint32(pos, valor, true);

const armarZip = (archivos: { nombre: string; contenido: string }[]): Uint8Array => {
  const codificador = new TextEncoder();
  const entradas: Entrada[] = archivos.map((a) => {
    const datos = codificador.encode(a.contenido);
    return { nombre: a.nombre, datos, crc: crc32(datos) };
  });

  const partesLocales: Uint8Array[] = [];
  const partesCentrales: Uint8Array[] = [];
  let offset = 0;

  for (const entrada of entradas) {
    const nombreBytes = codificador.encode(entrada.nombre);
    const tamano = entrada.datos.length;

    const local = new Uint8Array(30 + nombreBytes.length + tamano);
    const vl = new DataView(local.buffer);
    escribirUint32(vl, 0, 0x04034b50);
    vl.setUint16(4, 20, true); // versión necesaria
    vl.setUint16(6, 0, true); // flags
    vl.setUint16(8, 0, true); // sin compresión
    vl.setUint16(10, 0, true); // hora
    vl.setUint16(12, 0x21, true); // fecha (1980-01-01)
    escribirUint32(vl, 14, entrada.crc);
    escribirUint32(vl, 18, tamano);
    escribirUint32(vl, 22, tamano);
    vl.setUint16(26, nombreBytes.length, true);
    vl.setUint16(28, 0, true);
    local.set(nombreBytes, 30);
    local.set(entrada.datos, 30 + nombreBytes.length);
    partesLocales.push(local);

    const central = new Uint8Array(46 + nombreBytes.length);
    const vc = new DataView(central.buffer);
    escribirUint32(vc, 0, 0x02014b50);
    vc.setUint16(4, 20, true); // versión que lo creó
    vc.setUint16(6, 20, true);
    vc.setUint16(8, 0, true);
    vc.setUint16(10, 0, true);
    vc.setUint16(12, 0, true);
    vc.setUint16(14, 0x21, true);
    escribirUint32(vc, 16, entrada.crc);
    escribirUint32(vc, 20, tamano);
    escribirUint32(vc, 24, tamano);
    vc.setUint16(28, nombreBytes.length, true);
    escribirUint32(vc, 42, offset);
    central.set(nombreBytes, 46);
    partesCentrales.push(central);

    offset += local.length;
  }

  const tamanoCentral = partesCentrales.reduce((acc, p) => acc + p.length, 0);
  const fin = new Uint8Array(22);
  const vf = new DataView(fin.buffer);
  escribirUint32(vf, 0, 0x06054b50);
  vf.setUint16(8, entradas.length, true);
  vf.setUint16(10, entradas.length, true);
  escribirUint32(vf, 12, tamanoCentral);
  escribirUint32(vf, 16, offset);

  const total =
    partesLocales.reduce((acc, p) => acc + p.length, 0) + tamanoCentral + fin.length;
  const salida = new Uint8Array(total);
  let pos = 0;
  for (const parte of [...partesLocales, ...partesCentrales, fin]) {
    salida.set(parte, pos);
    pos += parte.length;
  }
  return salida;
};

/** Arma un .xlsx de una sola hoja a partir de una matriz de celdas. */
export const construirXlsx = (filas: Celda[][], nombreHoja = 'Inscripciones'): Uint8Array =>
  armarZip([
    {
      nombre: '[Content_Types].xml',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`
    },
    {
      nombre: '_rels/.rels',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
    },
    {
      nombre: 'xl/workbook.xml',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escaparXml(nombreHoja).slice(0, 31)}" sheetId="1" r:id="rId1"/></sheets></workbook>`
    },
    {
      nombre: 'xl/_rels/workbook.xml.rels',
      contenido: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`
    },
    { nombre: 'xl/worksheets/sheet1.xml', contenido: hojaXml(filas) }
  ]);

/** CSV con BOM para que Excel respete los acentos al abrirlo. */
export const construirCsv = (filas: Celda[][]): string => {
  const celda = (valor: Celda): string => {
    if (valor === null || valor === undefined) return '';
    const texto = String(valor);
    return /[",\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  return '﻿' + filas.map((fila) => fila.map(celda).join(',')).join('\r\n');
};
