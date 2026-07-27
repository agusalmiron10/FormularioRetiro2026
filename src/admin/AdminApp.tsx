/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Lock,
  Loader2,
  Search,
  RefreshCw,
  FileSpreadsheet,
  LogOut,
  AlertTriangle,
  Clock,
  Printer,
  Mail,
  Upload
} from 'lucide-react';
import {
  ErrorApi,
  Inscripcion,
  Listado,
  Resumen,
  borrarToken,
  cargarListado,
  guardarToken,
  leerToken,
  urlExport
} from './api';
import { Recordatorio, calcularRecordatorio } from './recordatorios';
import FilaInscripcion, { DetalleInscripcion } from './FichaInscripcion';
import ModalImportarExcel from './ModalImportarExcel';
import ModalRecordatorio from './ModalRecordatorio';

const COLOR_RECORDATORIOS = '#5D2304';

function ModalRecordatorios({
  inscripciones,
  onCerrar,
  onCambio
}: {
  inscripciones: Inscripcion[];
  onCerrar: () => void;
  onCambio: () => void;
}) {
  const [enviarA, setEnviarA] = useState<{ inscripcion: Inscripcion; recordatorio: Recordatorio } | null>(
    null
  );

  const pendientes = inscripciones
    .map((inscripcion) => ({ inscripcion, recordatorio: calcularRecordatorio(inscripcion) }))
    .filter(
      (fila): fila is { inscripcion: Inscripcion; recordatorio: Recordatorio } =>
        fila.recordatorio !== null
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-xl max-h-[85vh] overflow-y-auto"
      >
        <h3 className="font-display text-xl text-primary mb-1.5 flex items-center gap-2">
          <Mail className="w-5 h-5" style={{ color: COLOR_RECORDATORIOS }} />
          Recordatorios de pago
        </h3>
        <p className="font-sans text-xs text-on-surface-variant mb-5 leading-relaxed">
          Cada "Mandar mail" te muestra una vista previa y recién al confirmar sale el mail — no
          se manda nada sin que lo apruebes antes.
        </p>

        {pendientes.length === 0 ? (
          <p className="font-sans text-sm text-on-surface-variant italic py-10 text-center">
            Nadie tiene un pago pendiente por ahora. 🎉
          </p>
        ) : (
          <div className="space-y-2">
            {pendientes.map(({ inscripcion, recordatorio }) => (
              <div
                key={inscripcion.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low"
              >
                <div className="min-w-0">
                  <p className="font-sans text-sm font-semibold text-on-surface truncate">
                    {inscripcion.nombre_completo}
                  </p>
                  <p className="font-sans text-xs text-on-surface-variant truncate">
                    {inscripcion.email} · {recordatorio.detalle}
                  </p>
                </div>
                <button
                  onClick={() => setEnviarA({ inscripcion, recordatorio })}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-white font-sans text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ backgroundColor: COLOR_RECORDATORIOS }}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Mandar mail
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 mt-4 border-t border-outline-variant/20">
          <button
            onClick={onCerrar}
            className="px-4 py-2 rounded-full font-sans text-xs font-semibold text-tertiary hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      {enviarA && (
        <ModalRecordatorio
          inscripcion={enviarA.inscripcion}
          recordatorio={enviarA.recordatorio}
          onCerrar={() => setEnviarA(null)}
          onEnviado={onCambio}
        />
      )}
    </div>
  );
}

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

// Tooltip personalizado para el chart
function CustomTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-outline-variant/30 rounded-xl p-3 shadow-lg text-left min-w-[160px]">
      <p className="font-sans text-[11px] font-bold text-tertiary uppercase tracking-wider mb-2">
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} className="font-sans text-xs text-on-surface flex justify-between gap-4">
          <span style={{ color: p.color }} className="font-semibold">
            {p.name}
          </span>
          <span className="font-bold">${p.value.toLocaleString('es-AR')}</span>
        </p>
      ))}
    </div>
  );
}

function GraficoRecaudacion({ resumen }: { resumen: Resumen }) {
  const data = [
    { name: 'Verificado', valor: resumen.recaudado, color: '#5C7A5C' },
    { name: 'Por confirmar', valor: resumen.por_confirmar, color: '#D4AF37' }
  ];

  const total = resumen.recaudado + resumen.por_confirmar;
  const pct = total > 0 ? Math.round((resumen.recaudado / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 p-5 mb-8">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="font-sans text-[11px] font-bold text-tertiary uppercase tracking-wider">
            Recaudación total
          </p>
          <p className="font-display text-3xl text-primary mt-1 leading-none">
            {money(total)}{' '}
            <span className="text-base font-sans text-tertiary font-normal">AUD</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-sans text-[11px] text-tertiary">Verificado</p>
          <p className="font-display text-2xl text-status-success leading-none">{pct}%</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="h-2 bg-surface-container-low rounded-full overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-status-success transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart
          data={data}
          barSize={40}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6', radius: 8 } as React.SVGProps<SVGRectElement>} />
          <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="font-sans text-[11px] text-tertiary">
              {d.name}: {money(d.valor)}
            </span>
          </div>
        ))}
      </div>
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
  const [orden, setOrden] = useState<'recientes' | 'antiguas' | 'mayor_pago' | 'alfabetico'>('recientes');
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  
  const [modalManual, setModalManual] = useState(false);
  const [nuevaInscripcion, setNuevaInscripcion] = useState({ nombre_completo: '', email: '', telefono: '' });
  const [creandoManual, setCreandoManual] = useState(false);
  const [modalRecordatorios, setModalRecordatorios] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);

  // Cada inscripta tiene su propia "pantalla" de detalle, en vez de un
  // acordeón dentro de la lista larga — se navega por query string (?ver=id)
  // para que el botón "atrás" del navegador también funcione.
  const idDesdeUrl = () => {
    const n = Number(new URLSearchParams(window.location.search).get('ver'));
    return Number.isInteger(n) && n > 0 ? n : null;
  };
  const [verId, setVerId] = useState<number | null>(idDesdeUrl);

  useEffect(() => {
    const sincronizar = () => setVerId(idDesdeUrl());
    window.addEventListener('popstate', sincronizar);
    return () => window.removeEventListener('popstate', sincronizar);
  }, []);

  const abrirDetalle = (id: number) => {
    window.history.pushState({}, '', `?ver=${id}`);
    setVerId(id);
  };

  const volverALista = () => {
    window.history.pushState({}, '', window.location.pathname);
    setVerId(null);
  };

  // Cuenta regresiva
  const fechaRetiro = new Date('2026-09-11T00:00:00');
  const hoy = new Date();
  const diasFaltantes = Math.ceil((fechaRetiro.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  const refrescar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setDatos(await cargarListado({ q: busqueda, estado }));
      setUltimaActualizacion(new Date());
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 401) {
        borrarToken();
        setAutenticado(false);
        setDatos(null);
      }
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setCargando(false);
    }
  }, [estado, busqueda]);

  const handleCrearManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaInscripcion.nombre_completo.trim()) return;
    
    setCreandoManual(true);
    try {
      const { crearInscripcionManual } = await import('./api');
      await crearInscripcionManual(nuevaInscripcion);
      setModalManual(false);
      setNuevaInscripcion({ nombre_completo: '', email: '', telefono: '' });
      await refrescar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setCreandoManual(false);
    }
  };

  useEffect(() => {
    if (!autenticado) return;
    const t = setTimeout(refrescar, busqueda ? 300 : 0);
    return () => clearTimeout(t);
  }, [autenticado, refrescar, busqueda]);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    if (!autenticado) return;
    const interval = setInterval(refrescar, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autenticado, refrescar]);

  if (!autenticado) {
    return <Login onEntrar={() => setAutenticado(true)} />;
  }

  const resumen: Resumen | undefined = datos?.resumen;

  // Conteos para badges de filtros
  const cuentaTodas = datos?.inscripciones.length ?? null;
  const cuentaPendientes =
    datos !== null
      ? datos.inscripciones.filter((i) => i.tiene_pendientes).length
      : null;
  const cuentaVerificadas =
    datos !== null
      ? datos.inscripciones.filter(
          (i) => !i.tiene_pendientes && i.pagos.some((p) => p.estado === 'verificado')
        ).length
      : null;
  const cuentaDeudoras =
    datos?.inscripciones.filter((i) => calcularRecordatorio(i) !== null).length ?? 0;

  const filtros: { valor: string; texto: string; badge: number | null }[] = [
    { valor: '', texto: 'Todas', badge: cuentaTodas },
    { valor: 'pendiente', texto: 'Pendientes', badge: cuentaPendientes },
    { valor: 'verificado', texto: 'Verificadas', badge: cuentaVerificadas }
  ];

  return (
    <div className="min-h-screen bg-cream-base">
      <header className="bg-white border-b border-outline-variant/20 px-4 md:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <h1 className="font-display text-xl text-primary leading-tight">
            Inscripciones · Renueva 2026
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="font-sans text-[11px] text-tertiary hidden sm:block">Panel del equipo organizador</p>
            <span className="inline-flex items-center font-sans text-[11px] font-bold text-[#8A6A00] bg-accent-gold/20 px-2 py-0.5 rounded-full">
              Faltan {diasFaltantes} días
            </span>
            {ultimaActualizacion && (
              <span className="inline-flex items-center gap-1 font-sans text-[10px] text-tertiary/70 border-l border-outline-variant/30 pl-2 ml-1">
                <Clock className="w-3 h-3" />
                Actualizado{' '}
                {ultimaActualizacion.toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-outline-variant/40 text-tertiary font-sans text-xs font-semibold rounded-full hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
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

      {/* Vista principal (oculta al imprimir) */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 print:hidden">
        {verId && datos?.inscripciones.find((i) => i.id === verId) ? (
          <DetalleInscripcion
            inscripcion={datos.inscripciones.find((i) => i.id === verId)!}
            onCambio={refrescar}
            onVolver={volverALista}
          />
        ) : (
          <>
        {resumen && (
          <>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

            {/* Gráfico de recaudación */}
            <GraficoRecaudacion resumen={resumen} />
          </>
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
            {filtros.map((opcion) => (
              <button
                key={opcion.valor}
                onClick={() => setEstado(opcion.valor)}
                className={`px-4 py-3 rounded-full font-sans text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  estado === opcion.valor
                    ? 'bg-primary text-white'
                    : 'bg-white border border-outline-variant/40 text-tertiary hover:border-primary hover:text-primary'
                }`}
              >
                {opcion.texto}
                {opcion.badge !== null && opcion.badge > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                      estado === opcion.valor
                        ? 'bg-white/20 text-white'
                        : opcion.valor === 'pendiente'
                        ? 'bg-accent-gold/25 text-[#8A6A00]'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {opcion.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setModalRecordatorios(true)}
            className="flex items-center gap-2 px-4 py-3 text-white font-sans text-xs font-semibold rounded-full hover:opacity-90 transition-opacity shadow-sm cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: COLOR_RECORDATORIOS }}
          >
            <Mail className="w-4 h-4" />
            Recordatorios
            {cuentaDeudoras > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-white/25 text-white">
                {cuentaDeudoras}
              </span>
            )}
          </button>

          <button
            onClick={() => setModalImportar(true)}
            className="ml-auto flex items-center gap-2 px-4 py-3 bg-white border border-outline-variant/40 text-tertiary font-sans text-xs font-semibold rounded-full hover:border-primary hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            Importar Excel
          </button>

          <button
            onClick={() => setModalManual(true)}
            className="flex items-center gap-2 px-4 py-3 bg-tertiary text-white font-sans text-xs font-semibold rounded-full hover:bg-tertiary/90 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            + Nueva manual
          </button>

          <div className="shrink-0">
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as any)}
              className="h-full bg-white border border-outline-variant/40 rounded-full px-4 py-3 font-sans text-xs font-semibold text-tertiary outline-none focus:border-primary transition-colors cursor-pointer appearance-none pr-8 relative"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '14px'
              }}
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguas">Más antiguas</option>
              <option value="mayor_pago">Mayor pago</option>
              <option value="alfabetico">Alfabético</option>
            </select>
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
          {datos?.inscripciones
            .slice()
            .sort((a, b) => {
              if (orden === 'recientes') return b.id - a.id;
              if (orden === 'antiguas') return a.id - b.id;
              if (orden === 'mayor_pago') return b.total_verificado - a.total_verificado;
              if (orden === 'alfabetico') return a.nombre_completo.localeCompare(b.nombre_completo);
              return 0;
            })
            .map((inscripcion) => (
            <FilaInscripcion key={inscripcion.id} inscripcion={inscripcion} onAbrir={abrirDetalle} />
          ))}
        </div>
          </>
        )}
      </main>

      {/* Vista de impresión (oculta en pantalla) */}
      <div className="hidden print:block bg-white p-8 font-sans text-black">
        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold font-display">Renueva 2026</h1>
            <p className="text-sm mt-1">Lista de Asistencia Oficial</p>
          </div>
          <div className="text-right text-sm">
            <p>Total inscriptas: {datos?.inscripciones.length || 0}</p>
            <p>Fecha de impresión: {new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b border-gray-400 py-3 px-2 w-16 text-center text-xs uppercase tracking-wider">Llegó</th>
              <th className="border-b border-gray-400 py-3 px-2 text-xs uppercase tracking-wider">Nombre completo</th>
              <th className="border-b border-gray-400 py-3 px-2 text-xs uppercase tracking-wider">Teléfono / Email</th>
              <th className="border-b border-gray-400 py-3 px-2 text-xs uppercase tracking-wider">Alergias / Dieta</th>
              <th className="border-b border-gray-400 py-3 px-2 text-xs uppercase tracking-wider">Firma</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {datos?.inscripciones
              .slice()
              .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo))
              .map((i, index) => (
                <tr key={i.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border-b border-gray-200 py-3 px-2 text-center">
                    <div className="w-6 h-6 border-2 border-gray-400 mx-auto rounded-sm"></div>
                  </td>
                  <td className="border-b border-gray-200 py-3 px-2 font-bold">{i.nombre_completo}</td>
                  <td className="border-b border-gray-200 py-3 px-2">
                    <div className="whitespace-nowrap">{i.telefono}</div>
                    <div className="text-xs text-gray-500">{i.email}</div>
                  </td>
                  <td className="border-b border-gray-200 py-3 px-2 text-xs">
                    {[i.dieta.join(', '), i.dieta_otro, i.condicion_medica].filter(Boolean).join(' · ') || '-'}
                  </td>
                  <td className="border-b border-gray-200 py-3 px-2">
                    <div className="w-32 border-b border-gray-300 mx-auto mt-4"></div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal Recordatorios de pago por mail */}
      {modalRecordatorios && (
        <ModalRecordatorios
          inscripciones={datos?.inscripciones ?? []}
          onCerrar={() => setModalRecordatorios(false)}
          onCambio={refrescar}
        />
      )}

      {/* Modal Importar Excel */}
      {modalImportar && (
        <ModalImportarExcel
          onCerrar={() => setModalImportar(false)}
          onImportado={refrescar}
        />
      )}

      {/* Modal Nueva Inscripción Manual */}
      {modalManual && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <h2 className="font-display text-2xl text-primary mb-1">Cargar manual</h2>
            <p className="font-sans text-xs text-on-surface-variant mb-6">
              Creará una ficha vacía con estos datos básicos. Luego podés expandirla y hacer clic en "Editar" para completar el resto.
            </p>
            
            <form onSubmit={handleCrearManual} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={nuevaInscripcion.nombre_completo}
                  onChange={e => setNuevaInscripcion({ ...nuevaInscripcion, nombre_completo: e.target.value })}
                  className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 font-sans text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Email</label>
                <input
                  type="email"
                  value={nuevaInscripcion.email}
                  onChange={e => setNuevaInscripcion({ ...nuevaInscripcion, email: e.target.value })}
                  className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 font-sans text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={nuevaInscripcion.telefono}
                  onChange={e => setNuevaInscripcion({ ...nuevaInscripcion, telefono: e.target.value })}
                  className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 font-sans text-sm outline-none focus:border-primary"
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-outline-variant/20 mt-6">
                <button
                  type="button"
                  onClick={() => setModalManual(false)}
                  className="flex-1 px-4 py-2.5 border border-outline-variant text-tertiary font-sans text-sm font-semibold rounded-full hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creandoManual || !nuevaInscripcion.nombre_completo.trim()}
                  className="flex-1 px-4 py-2.5 bg-primary text-white font-sans text-sm font-semibold rounded-full hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creandoManual ? 'Creando...' : 'Crear ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
