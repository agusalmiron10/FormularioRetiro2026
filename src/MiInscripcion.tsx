/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Portal personal de sólo lectura: /mi-inscripcion?t=<token>
 * Sin login — el link (mandado por mail) es la llave. Muestra únicamente
 * el estado de los pagos, nada de datos personales sensibles.
 */

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { Loader2, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface PagoPublico {
  descripcion: string;
  monto: number | null;
  estado: 'pendiente' | 'verificado' | 'rechazado';
  pagado_en: string | null;
}

interface Resumen {
  estado: 'debe' | 'al_dia' | 'en_revision' | 'sin_pagos';
  mensaje: string;
  monto: number | null;
}

interface Respuesta {
  ok: boolean;
  numero?: number;
  nombre?: string;
  pagos?: PagoPublico[];
  resumen?: Resumen;
  error?: string;
}

const ESTILO_RESUMEN: Record<Resumen['estado'], { fondo: string; borde: string; color: string }> = {
  debe: { fondo: '#FCEEE4', borde: '#F2D6BE', color: '#8a5a2e' },
  al_dia: { fondo: '#EFF3E4', borde: '#d9e2c4', color: '#3d5620' },
  en_revision: { fondo: '#FDF5ED', borde: '#ECDCCA', color: '#8A6A00' },
  sin_pagos: { fondo: '#FDF5ED', borde: '#ECDCCA', color: '#8a7a68' }
};

const ESTILO: Record<PagoPublico['estado'], { icono: ReactElement; texto: string; color: string }> = {
  verificado: {
    icono: <CheckCircle2 className="w-5 h-5" />,
    texto: 'Confirmado',
    color: '#3d5620'
  },
  pendiente: {
    icono: <Clock className="w-5 h-5" />,
    texto: 'En revisión',
    color: '#8A6A00'
  },
  rechazado: {
    icono: <XCircle className="w-5 h-5" />,
    texto: 'A revisar',
    color: '#B03A2E'
  }
};

export default function MiInscripcion() {
  const [datos, setDatos] = useState<Respuesta | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('t');
    if (!token) {
      setDatos({ ok: false, error: 'Falta el link completo — abrilo desde el mail que te mandamos.' });
      setCargando(false);
      return;
    }
    fetch(`/api/mi-inscripcion?t=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d: Respuesta) => setDatos(d))
      .catch(() => setDatos({ ok: false, error: 'No pudimos cargar tu inscripción. Probá de nuevo en un rato.' }))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FCF9F2] flex items-start justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-[#5D2304]">RENUEVA 2026</h1>
          <p className="font-sans text-xs text-[#8a7a68] mt-1">Alegría Retreats</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#ECDCCA] p-6 md:p-8 shadow-sm">
          {cargando ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <Loader2 className="w-6 h-6 text-[#5D2304] animate-spin" />
              <p className="font-sans text-sm text-[#8a7a68]">Buscando tu inscripción…</p>
            </div>
          ) : !datos?.ok ? (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <AlertTriangle className="w-8 h-8 text-[#B03A2E]" />
              <p className="font-sans text-sm text-[#5C4A3A]">
                {datos?.error ?? 'No pudimos encontrar tu inscripción.'}
              </p>
              <p className="font-sans text-xs text-[#8a7a68]">
                ¿Necesitás ayuda? Escribinos a{' '}
                <a href="mailto:hello.alegriabewell@gmail.com" className="underline">
                  hello.alegriabewell@gmail.com
                </a>
              </p>
            </div>
          ) : (
            <>
              <p className="font-display text-xl text-[#5D2304] mb-1">¡Hola {datos.nombre}!</p>
              <p className="font-sans text-xs text-[#8a7a68] mb-4">
                Inscripción #{String(datos.numero).padStart(3, '0')}
              </p>

              {datos.resumen && (
                <div
                  className="rounded-xl p-4 mb-5 border"
                  style={{
                    backgroundColor: ESTILO_RESUMEN[datos.resumen.estado].fondo,
                    borderColor: ESTILO_RESUMEN[datos.resumen.estado].borde
                  }}
                >
                  <p
                    className="font-sans text-sm font-semibold"
                    style={{ color: ESTILO_RESUMEN[datos.resumen.estado].color }}
                  >
                    {datos.resumen.mensaje}
                  </p>
                </div>
              )}

              {datos.pagos && datos.pagos.length > 0 ? (
                <div className="space-y-3">
                  {datos.pagos.map((pago, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[#ECDCCA] bg-[#FDF5ED]"
                    >
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-semibold text-[#2D1A0E] truncate">
                          {pago.descripcion}
                        </p>
                        <p
                          className="font-sans text-xs font-semibold mt-0.5 flex items-center gap-1"
                          style={{ color: ESTILO[pago.estado].color }}
                        >
                          <span className="w-3.5 h-3.5 [&>svg]:w-full [&>svg]:h-full">
                            {ESTILO[pago.estado].icono}
                          </span>
                          {ESTILO[pago.estado].texto}
                        </p>
                      </div>
                      {pago.monto !== null && (
                        <p className="font-display text-lg text-[#5D2304] shrink-0">${pago.monto}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-sm text-[#8a7a68] italic">
                  Todavía no tenés ningún pago registrado.
                </p>
              )}

              <p className="font-sans text-xs text-[#8a7a68] mt-6 pt-6 border-t border-[#ECDCCA]">
                ¿Alguna duda? Escribinos a{' '}
                <a href="mailto:hello.alegriabewell@gmail.com" className="underline">
                  hello.alegriabewell@gmail.com
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
