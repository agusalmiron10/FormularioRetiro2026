/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { UploadCloud, AlertTriangle, Loader2, Check, FileSpreadsheet } from 'lucide-react';
import { FilaImportada, leerArchivoImportacion } from './importarExcel';
import { importarInscripciones } from './api';

export default function ModalImportarExcel({
  onCerrar,
  onImportado
}: {
  onCerrar: () => void;
  onImportado: () => void;
}) {
  const [filas, setFilas] = useState<FilaImportada[] | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [leyendo, setLeyendo] = useState(false);
  const [importando, setImportando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<{
    insertadas: number;
    omitidas: { email: string; motivo: string }[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const elegirArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setLeyendo(true);
    setError('');
    setResultado(null);
    try {
      const leidas = await leerArchivoImportacion(file);
      setFilas(leidas);
      setNombreArchivo(file.name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No pudimos leer el archivo. ¿Es un Excel o CSV válido?'
      );
      setFilas(null);
    } finally {
      setLeyendo(false);
    }
  };

  const confirmarImportacion = async () => {
    if (!filas) return;
    setImportando(true);
    setError('');
    try {
      const res = await importarInscripciones(filas);
      setResultado({ insertadas: res.insertadas, omitidas: res.omitidas });
      onImportado();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos importar las filas.');
    } finally {
      setImportando(false);
    }
  };

  const validas = filas?.filter((f) => f.nombre_completo && f.email) ?? [];
  const invalidas = filas?.filter((f) => !f.nombre_completo || !f.email) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-xl max-h-[88vh] overflow-y-auto"
      >
        <h3 className="font-display text-xl text-primary mb-1.5 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-secondary" />
          Importar desde Excel / CSV
        </h3>
        <p className="font-sans text-xs text-on-surface-variant mb-5 leading-relaxed">
          Para respaldar planillas de respuestas de Google Forms (RENUEVA u otras). Ningún email
          se manda por esta vía y ningún pago se marca como verificado — todo entra en
          "pendiente" para que lo chequeen contra el banco. Las filas cuyo email ya exista en la
          base se saltean solas.
        </p>

        {resultado ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-status-success/10 border border-status-success/20 rounded-xl p-4">
              <Check className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-on-surface">
                Se importaron <strong>{resultado.insertadas}</strong> inscripciones.
              </p>
            </div>
            {resultado.omitidas.length > 0 && (
              <div>
                <p className="font-sans text-xs font-semibold text-tertiary uppercase tracking-wider mb-2">
                  Omitidas ({resultado.omitidas.length})
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {resultado.omitidas.map((o) => (
                    <p key={o.email} className="font-sans text-xs text-on-surface-variant">
                      <span className="font-semibold text-on-surface">{o.email}</span> — {o.motivo}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-outline-variant/20">
              <button
                onClick={onCerrar}
                className="px-5 py-2.5 rounded-full bg-primary text-white font-sans text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : !filas ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border-2 border-dashed border-outline-variant p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-surface-container-low transition-all"
          >
            {leyendo ? (
              <Loader2 className="w-8 h-8 text-secondary mx-auto mb-3 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-secondary mx-auto mb-3" />
            )}
            <p className="font-sans text-sm font-semibold text-primary">
              {leyendo ? 'Leyendo archivo…' : 'Elegí un archivo .xlsx o .csv'}
            </p>
            <p className="font-sans text-xs text-on-surface-variant mt-1">
              La primera hoja, con encabezados en la primera fila.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={elegirArchivo}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-sans text-xs text-on-surface-variant">
              <strong className="text-on-surface">{nombreArchivo}</strong> · {validas.length} filas
              listas
              {invalidas.length > 0 && `, ${invalidas.length} sin nombre o email (no se importan)`}
            </p>

            <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low sticky top-0">
                    <tr>
                      {['Nombre', 'Email', 'Teléfono', 'Pago', 'Monto', 'Avisos'].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 font-sans text-[10px] font-bold text-tertiary uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((f, i) => (
                      <tr
                        key={i}
                        className={`border-t border-outline-variant/10 ${!f.nombre_completo || !f.email ? 'bg-red-50' : ''}`}
                      >
                        <td className="px-3 py-2 font-sans text-xs text-on-surface whitespace-nowrap">
                          {f.nombre_completo || '—'}
                        </td>
                        <td className="px-3 py-2 font-sans text-xs text-on-surface-variant">
                          {f.email || '—'}
                        </td>
                        <td className="px-3 py-2 font-sans text-xs text-on-surface-variant whitespace-nowrap">
                          {f.telefono || '—'}
                        </td>
                        <td className="px-3 py-2 font-sans text-xs text-on-surface-variant max-w-[180px] truncate">
                          {f.pagos[0]?.tipo ?? '—'}
                        </td>
                        <td className="px-3 py-2 font-sans text-xs text-on-surface-variant whitespace-nowrap">
                          {f.pagos[0]?.monto ? `$${f.pagos[0].monto}` : '—'}
                        </td>
                        <td className="px-3 py-2 font-sans text-[11px] text-terracotta-soft">
                          {f.advertencias.join(' · ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
              <button
                onClick={() => {
                  setFilas(null);
                  setError('');
                }}
                disabled={importando}
                className="px-4 py-2.5 rounded-full font-sans text-xs font-semibold text-tertiary hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-50"
              >
                Elegir otro archivo
              </button>
              <button
                onClick={confirmarImportacion}
                disabled={importando || validas.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-sans text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-50"
              >
                {importando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Importar {validas.length} inscripciones
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
