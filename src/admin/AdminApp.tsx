/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Lock,
  Loader2,
  Search,
  RefreshCw,
  FileSpreadsheet,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import {
  Listado,
  Resumen,
  borrarToken,
  cargarListado,
  guardarToken,
  leerToken,
  urlExport
} from './api';
import FichaInscripcion from './FichaInscripcion';

const money = (n: number) =>
  `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function Tarjeta({
  etiqueta,
  valor,
  detalle,
  acento
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
  acento?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        acento ? 'bg-primary/5 border-primary/20' : 'bg-white border-outline-variant/20'
      }`}
    >
      <p className="font-sans text-[11px] font-bold text-tertiary uppercase tracking-wider">
        {etiqueta}
      </p>
      <p className="font-display text-3xl text-primary mt-1.5 leading-none">{valor}</p>
      {detalle && <p className="font-sans text-xs text-on-surface-variant mt-1.5">{detalle}</p>}
    </div>
  );
}

function Login({ onEntrar }: { onEntrar: () => void }) {
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const [probando, setProbando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor.trim()) return;

    setProbando(true);
    setError('');
    guardarToken(valor.trim());

    try {
      await cargarListado({});
      onEntrar();
    } catch (err) {
      borrarToken();
      setError(err instanceof Error ? err.message : 'No pudimos validar la clave.');
    } finally {
      setProbando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream-base">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm bg-white rounded-2xl border border-outline-variant/20 p-8 shadow-sm"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-display text-2xl text-primary mb-1">Panel de inscripciones</h1>
        <p className="font-sans text-xs text-on-surface-variant mb-6">
          Renueva 2026 — acceso restringido al equipo organizador.
        </p>

        <label className="font-sans text-xs font-semibold text-tertiary block mb-1">
          Clave de acceso
        </label>
        <input
          type="password"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          autoFocus
          className="soft-input font-sans text-sm"
          placeholder="••••••••••••"
        />

        {error && (
          <p className="text-red-600 text-xs font-semibold mt-3 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={probando || !valor.trim()}
          className="w-full mt-6 bg-primary text-white font-sans text-sm font-semibold py-3.5 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {probando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando…
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [autenticado, setAutenticado] = useState(Boolean(leerToken()));
  const [datos, setDatos] = useState<Listado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');

  const refrescar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setDatos(await cargarListado({ q: busqueda, estado }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar los datos.');
      if (err instanceof Error && err.message.includes('No autorizado')) {
        borrarToken();
        setAutenticado(false);
      }
    } finally {
      setCargando(false);
    }
  }, [busqueda, estado]);

  useEffect(() => {
    if (!autenticado) return;
    const t = setTimeout(refrescar, busqueda ? 300 : 0);
    return () => clearTimeout(t);
  }, [autenticado, refrescar, busqueda]);

  if (!autenticado) {
    return <Login onEntrar={() => setAutenticado(true)} />;
  }

  const resumen: Resumen | undefined = datos?.resumen;

  return (
    <div className="min-h-screen bg-cream-base">
      <header className="bg-white border-b border-outline-variant/20 px-4 md:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <h1 className="font-display text-xl text-primary leading-tight">
            Inscripciones · Renueva 2026
          </h1>
          <p className="font-sans text-[11px] text-tertiary">Panel del equipo organizador</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={urlExport('xlsx')}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-sans text-xs font-semibold rounded-full hover:bg-primary-container transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </a>
          <a
            href={urlExport('csv')}
            className="hidden md:block px-4 py-2.5 border border-outline-variant text-tertiary font-sans text-xs font-semibold rounded-full hover:border-primary hover:text-primary transition-colors"
          >
            CSV
          </a>
          <button
            onClick={refrescar}
            disabled={cargando}
            className="p-2.5 text-tertiary hover:text-primary hover:bg-primary/5 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              borrarToken();
              setAutenticado(false);
              setDatos(null);
            }}
            className="p-2.5 text-tertiary hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
            aria-label="Salir"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {resumen && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Tarjeta etiqueta="Inscriptas" valor={String(resumen.inscriptas)} />
            <Tarjeta
              etiqueta="Recaudado"
              valor={money(resumen.recaudado)}
              detalle={`${resumen.pagos_verificados} pagos verificados`}
              acento
            />
            <Tarjeta
              etiqueta="Por confirmar"
              valor={money(resumen.por_confirmar)}
              detalle={`${resumen.pagos_pendientes} pagos sin verificar`}
            />
            <Tarjeta
              etiqueta="Deben 2da cuota"
              valor={String(resumen.deben_segunda_cuota)}
              detalle="Pagaron la primera"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-tertiary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o email…"
              className="w-full bg-white border border-outline-variant/40 rounded-full pl-11 pr-4 py-3 font-sans text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex gap-2">
            {[
              { valor: '', texto: 'Todas' },
              { valor: 'pendiente', texto: 'Pendientes' },
              { valor: 'verificado', texto: 'Verificadas' }
            ].map((opcion) => (
              <button
                key={opcion.valor}
                onClick={() => setEstado(opcion.valor)}
                className={`px-4 py-3 rounded-full font-sans text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  estado === opcion.valor
                    ? 'bg-primary text-white'
                    : 'bg-white border border-outline-variant/40 text-tertiary hover:border-primary hover:text-primary'
                }`}
              >
                {opcion.texto}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-semibold mb-6 bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </p>
        )}

        {cargando && !datos && (
          <div className="flex items-center justify-center py-20 text-tertiary">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {datos && datos.inscripciones.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-primary mb-2">Todavía no hay inscripciones</p>
            <p className="font-sans text-sm text-on-surface-variant">
              {busqueda || estado
                ? 'Probá cambiando el filtro o la búsqueda.'
                : 'Cuando alguien complete el formulario, va a aparecer acá.'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {datos?.inscripciones.map((inscripcion) => (
            <FichaInscripcion
              key={inscripcion.id}
              inscripcion={inscripcion}
              onCambio={refrescar}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
