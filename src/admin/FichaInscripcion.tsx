/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import type { MouseEvent } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  FileText,
  Loader2,
  Trophy,
  Undo2,
  HeartPulse,
  Mail,
  ShieldAlert,
  Edit3,
  Save,
  Trash2,
  Plus
} from 'lucide-react';
import {
  Inscripcion,
  Pago,
  actualizarPago,
  actualizarInscripcion,
  borrarInscripcion,
  editarPago,
  agregarPago,
  urlComprobante
} from './api';
import { calcularRecordatorio } from './recordatorios';
import ModalRecordatorio from './ModalRecordatorio';

const COLOR_DEBE = '#B45309';
const COLOR_DEBE_FONDO = 'rgba(180, 83, 9, 0.12)';

const ESTILO_ESTADO: Record<Pago['estado'], string> = {
  verificado: 'bg-status-success/15 text-status-success',
  pendiente: 'bg-accent-gold/20 text-[#8A6A00]',
  rechazado: 'bg-red-100 text-red-700'
};

/** Confirmación antes de verificar/rechazar — por defecto ambas acciones mandan un mail real. */
function ModalConfirmacion({
  tipo,
  nombreInscripta,
  email,
  pagoDescripcion,
  guardando,
  onCancelar,
  onConfirmar
}: {
  tipo: 'verificado' | 'rechazado';
  nombreInscripta: string;
  email: string;
  pagoDescripcion: string;
  guardando: boolean;
  onCancelar: () => void;
  onConfirmar: (notificar: boolean) => void;
}) {
  const esVerificar = tipo === 'verificado';
  const [notificar, setNotificar] = useState(true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancelar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-xl"
      >
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${
            esVerificar ? 'bg-status-success/15 text-status-success' : 'bg-red-100 text-red-700'
          }`}
        >
          {esVerificar ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </div>

        <h3 className="font-display text-xl text-primary mb-1.5">
          {esVerificar ? '¿Confirmás que verificaste este pago?' : '¿Confirmás que rechazás este pago?'}
        </h3>
        <p className="font-sans text-sm text-on-surface-variant mb-4">
          {pagoDescripcion} de <strong className="text-on-surface">{nombreInscripta}</strong>.
        </p>

        <label className="flex items-start gap-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={notificar}
            onChange={(e) => setNotificar(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary cursor-pointer shrink-0"
          />
          <span className="font-sans text-xs text-on-surface-variant">
            <Mail className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-tertiary" />
            {notificar ? (
              <>
                Avisar por mail a <strong>{email}</strong>{' '}
                {esVerificar
                  ? 'de que su lugar quedó confirmado.'
                  : 'pidiéndole que aclare el pago.'}
              </>
            ) : (
              <>Sólo actualizar el estado acá — no se le manda ningún mail.</>
            )}
          </span>
        </label>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancelar}
            disabled={guardando}
            className="px-4 py-2 rounded-full font-sans text-xs font-semibold text-tertiary hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(notificar)}
            disabled={guardando}
            className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full font-sans text-xs font-semibold text-white transition-opacity cursor-pointer disabled:opacity-50 ${
              esVerificar ? 'bg-status-success hover:opacity-90' : 'bg-red-600 hover:opacity-90'
            }`}
          >
            {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {esVerificar ? 'Sí, verificar' : 'Sí, rechazar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BloquePago({
  pago,
  nombreInscripta,
  email,
  onCambio
}: {
  pago: Pago;
  nombreInscripta: string;
  email: string;
  onCambio: () => void;
  key?: number;
}) {
  const [fecha, setFecha] = useState(pago.pagado_en?.slice(0, 10) ?? '');
  const [nota, setNota] = useState(pago.nota_admin ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState<'verificado' | 'rechazado' | null>(null);

  const [editandoPago, setEditandoPago] = useState(false);
  const [descripcionEdit, setDescripcionEdit] = useState(pago.descripcion);
  const [montoEdit, setMontoEdit] = useState(pago.monto?.toString() ?? '');
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  const cambiarEstado = async (estado: Pago['estado'], notificar = true) => {
    setGuardando(true);
    setError('');
    try {
      await actualizarPago(pago.id, { estado, pagado_en: fecha || undefined, nota, notificar });
      onCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar el cambio.');
    } finally {
      setGuardando(false);
      setConfirmando(null);
    }
  };

  const guardarEdicionPago = async () => {
    setGuardandoPago(true);
    setErrorPago('');
    try {
      await editarPago(pago.id, {
        descripcion: descripcionEdit,
        monto: montoEdit.trim() ? Number.parseFloat(montoEdit) : null
      });
      setEditandoPago(false);
      onCambio();
    } catch (err) {
      setErrorPago(err instanceof Error ? err.message : 'No pudimos guardar el cambio.');
    } finally {
      setGuardandoPago(false);
    }
  };

  const esImagen = pago.comprobante_tipo?.startsWith('image/');

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider ${ESTILO_ESTADO[pago.estado]}`}
            >
              {pago.estado}
            </span>
            {pago.puesto && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-sans text-[10px] font-bold uppercase tracking-wider">
                <Trophy className="w-3 h-3" />
                Pago n.º {pago.puesto}
              </span>
            )}
            <span className="font-sans text-[11px] text-tertiary uppercase tracking-wider">
              {pago.metodo}
            </span>
          </div>
          {editandoPago ? (
            <input
              type="text"
              value={descripcionEdit}
              onChange={(e) => setDescripcionEdit(e.target.value)}
              className="w-full bg-white border border-outline-variant/40 rounded-lg px-2.5 py-1.5 font-sans text-sm mt-1.5 outline-none focus:border-primary"
            />
          ) : (
            <p className="font-sans text-sm font-semibold text-on-surface mt-1.5">
              {pago.descripcion}
            </p>
          )}
          <p className="font-sans text-xs text-on-surface-variant mt-0.5">
            Reportado el {pago.reportado_en}
            {pago.verificado_en && ` · Verificado el ${pago.verificado_en} por ${pago.verificado_por}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editandoPago ? (
            <div className="flex items-center gap-1">
              <span className="font-sans text-sm text-tertiary">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={montoEdit}
                onChange={(e) => setMontoEdit(e.target.value)}
                placeholder="Sin monto fijo"
                className="w-28 bg-white border border-outline-variant/40 rounded-lg px-2 py-1.5 font-sans text-sm outline-none focus:border-primary"
              />
            </div>
          ) : (
            pago.monto !== null && (
              <p className="font-display text-2xl text-primary">${pago.monto} AUD</p>
            )
          )}

          {editandoPago ? (
            <div className="flex gap-1">
              <button
                onClick={guardarEdicionPago}
                disabled={guardandoPago}
                title="Guardar"
                className="p-1.5 rounded-full bg-primary text-white hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-50"
              >
                {guardandoPago ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setEditandoPago(false);
                  setDescripcionEdit(pago.descripcion);
                  setMontoEdit(pago.monto?.toString() ?? '');
                  setErrorPago('');
                }}
                disabled={guardandoPago}
                title="Cancelar"
                className="p-1.5 rounded-full border border-outline-variant text-tertiary hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditandoPago(true)}
              title="Editar monto o descripción"
              className="p-1.5 rounded-full text-tertiary hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {errorPago && (
        <p className="text-red-600 text-xs font-semibold -mt-2 mb-3 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          {errorPago}
        </p>
      )}

      {/* Comprobante */}
      {pago.comprobante_key ? (
        <a
          href={urlComprobante(pago.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 p-2.5 pr-4 rounded-lg bg-white border border-outline-variant/40 hover:border-primary transition-colors mb-4 max-w-full"
        >
          {esImagen ? (
            <img
              src={urlComprobante(pago.id)}
              alt="Comprobante"
              className="w-12 h-12 object-cover rounded-md border border-outline-variant/30 shrink-0"
            />
          ) : (
            <span className="w-12 h-12 rounded-md bg-surface-container flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-tertiary" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block font-sans text-xs font-semibold text-primary">
              Ver comprobante
            </span>
            <span className="block font-sans text-[11px] text-on-surface-variant truncate">
              {pago.comprobante_nombre}
            </span>
          </span>
        </a>
      ) : (
        <p className="font-sans text-xs text-tertiary italic mb-4">
          Sin comprobante adjunto {pago.metodo === 'paypal' && '(pago por PayPal)'}
        </p>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-outline-variant/20">
        <div>
          <label className="block font-sans text-[11px] font-semibold text-tertiary mb-1">
            Fecha real del pago
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-xs outline-none focus:border-primary"
          />
        </div>

        <div className="flex-grow min-w-[180px]">
          <label className="block font-sans text-[11px] font-semibold text-tertiary mb-1">
            Nota interna
          </label>
          <input
            type="text"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Opcional"
            className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-xs outline-none focus:border-primary"
          />
        </div>

        <div className="flex gap-2">
          {pago.estado !== 'verificado' && (
            <button
              onClick={() => setConfirmando('verificado')}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-status-success text-white font-sans text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Verificar
            </button>
          )}

          {pago.estado === 'verificado' && (
            <button
              onClick={() => cambiarEstado('pendiente')}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant text-tertiary font-sans text-xs font-semibold hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              {guardando ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Undo2 className="w-3.5 h-3.5" />
              )}
              Deshacer
            </button>
          )}

          {pago.estado !== 'rechazado' && (
            <button
              onClick={() => setConfirmando('rechazado')}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-600 font-sans text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Rechazar
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-xs font-semibold mt-3 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}

      {confirmando && (
        <ModalConfirmacion
          tipo={confirmando}
          nombreInscripta={nombreInscripta}
          email={email}
          pagoDescripcion={pago.descripcion}
          guardando={guardando}
          onCancelar={() => setConfirmando(null)}
          onConfirmar={(notificar) => cambiarEstado(confirmando, notificar)}
        />
      )}
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | null | undefined }) {
  if (!valor) return null;
  return (
    <div>
      <dt className="font-sans text-[11px] font-semibold text-tertiary uppercase tracking-wider">
        {etiqueta}
      </dt>
      <dd className="font-sans text-sm text-on-surface mt-0.5 break-words">{valor}</dd>
    </div>
  );
}

/** Carga a mano un pago que nunca quedó registrado (venía de otro lado, se anotó por WhatsApp, etc.). */
function AgregarPago({ inscripcionId, onAgregado }: { inscripcionId: number; onAgregado: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const guardar = async () => {
    if (!descripcion.trim()) {
      setError('Falta describir el pago (ej. "Pago completo", "Primera cuota").');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await agregarPago(inscripcionId, {
        descripcion: descripcion.trim(),
        monto: monto.trim() ? Number.parseFloat(monto) : null
      });
      setDescripcion('');
      setMonto('');
      setAbierto(false);
      onAgregado();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar el pago.');
    } finally {
      setGuardando(false);
    }
  };

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-dashed border-outline-variant text-tertiary font-sans text-xs font-semibold hover:border-primary hover:text-primary transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar pago
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-outline-variant/60 p-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="flex-grow min-w-[200px]">
          <label className="block font-sans text-[11px] font-semibold text-tertiary mb-1">
            Descripción
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder='Ej. "Pago completo", "Segunda cuota"'
            className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block font-sans text-[11px] font-semibold text-tertiary mb-1">Monto</label>
          <div className="flex items-center gap-1">
            <span className="font-sans text-sm text-tertiary">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Sin monto fijo"
              className="w-32 bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-xs font-semibold flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            setAbierto(false);
            setError('');
          }}
          disabled={guardando}
          className="px-4 py-2 rounded-full font-sans text-xs font-semibold text-tertiary hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          disabled={guardando}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-white font-sans text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-50"
        >
          {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Guardar pago
        </button>
      </div>
    </div>
  );
}

/** Campos de texto simple: [clave, etiqueta]. */
const CAMPOS_PERSONALES: [keyof DatosEdicion, string][] = [
  ['nombre_completo', 'Nombre completo'],
  ['email', 'Email'],
  ['telefono', 'Teléfono'],
  ['direccion', 'Dirección'],
  ['fecha_nacimiento', 'Fecha de nacimiento'],
  ['edad', 'Edad'],
  ['contacto_emergencia_nombre', 'Contacto de emergencia'],
  ['contacto_emergencia_telefono', 'Teléfono del contacto']
];

const CAMPOS_RETIRO: [keyof DatosEdicion, string][] = [
  ['origen_viaje', 'Viaja desde'],
  ['apoyo_otras_mujeres', 'Apoyo a otras mujeres'],
  ['condicion_medica', 'Condición médica'],
  ['preferencia_habitacion', 'Compañera de habitación'],
  ['transporte', 'Transporte'],
  ['oracion', 'Tiempo de oración']
];

interface DatosEdicion {
  nombre_completo: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento: string;
  edad: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  idioma: string;
  origen_viaje: string;
  dieta: string;
  dieta_otro: string;
  apoyo_otras_mujeres: string;
  condicion_medica: string;
  preferencia_habitacion: string;
  transporte: string;
  oracion: string;
  expectativas: string;
  expectativas_otro: string;
  como_se_entero: string;
  comentarios: string;
}

const aDatosEdicion = (inscripcion: Inscripcion): DatosEdicion => ({
  nombre_completo: inscripcion.nombre_completo,
  email: inscripcion.email,
  telefono: inscripcion.telefono,
  direccion: inscripcion.direccion,
  fecha_nacimiento: inscripcion.fecha_nacimiento,
  edad: inscripcion.edad?.toString() ?? '',
  contacto_emergencia_nombre: inscripcion.contacto_emergencia_nombre,
  contacto_emergencia_telefono: inscripcion.contacto_emergencia_telefono,
  idioma: inscripcion.idioma,
  origen_viaje: inscripcion.origen_viaje,
  dieta: inscripcion.dieta.join(', '),
  dieta_otro: inscripcion.dieta_otro ?? '',
  apoyo_otras_mujeres: inscripcion.apoyo_otras_mujeres ?? '',
  condicion_medica: inscripcion.condicion_medica ?? '',
  preferencia_habitacion: inscripcion.preferencia_habitacion ?? '',
  transporte: inscripcion.transporte ?? '',
  oracion: inscripcion.oracion ?? '',
  expectativas: inscripcion.expectativas.join(', '),
  expectativas_otro: inscripcion.expectativas_otro ?? '',
  como_se_entero: inscripcion.como_se_entero ?? '',
  comentarios: inscripcion.comentarios ?? ''
});

function CampoTexto({
  etiqueta,
  valor,
  onChange
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div>
      <label className="block font-sans text-xs font-semibold text-tertiary mb-1">{etiqueta}</label>
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function ModalEdicion({
  inscripcion,
  onCancelar,
  onGuardar
}: {
  inscripcion: Inscripcion;
  onCancelar: () => void;
  onGuardar: () => void;
}) {
  const [datos, setDatos] = useState<DatosEdicion>(aDatosEdicion(inscripcion));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (campo: keyof DatosEdicion, valor: string) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardar = async () => {
    setGuardando(true);
    setError('');
    try {
      const listaDe = (texto: string) =>
        texto
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

      await actualizarInscripcion(inscripcion.id, {
        ...datos,
        edad: datos.edad.trim() ? Number.parseInt(datos.edad, 10) : null,
        dieta: listaDe(datos.dieta),
        expectativas: listaDe(datos.expectativas)
      });
      onGuardar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancelar}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <h3 className="font-display text-xl text-primary mb-4 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-secondary" />
          Editar Inscripción #{inscripcion.id}
        </h3>

        <div className="space-y-5 mb-6">
          <section className="space-y-3">
            <p className="font-sans text-[10px] font-bold text-tertiary uppercase tracking-wider">
              Datos personales
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CAMPOS_PERSONALES.map(([campo, etiqueta]) => (
                <div key={campo} className={campo === 'nombre_completo' ? 'col-span-2' : ''}>
                  <CampoTexto
                    etiqueta={etiqueta}
                    valor={datos[campo]}
                    onChange={(v) => handleChange(campo, v)}
                  />
                </div>
              ))}
              <div>
                <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Idioma</label>
                <select
                  value={datos.idioma}
                  onChange={(e) => handleChange('idioma', e.target.value)}
                  className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="font-sans text-[10px] font-bold text-tertiary uppercase tracking-wider">
              Del retiro
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CAMPOS_RETIRO.map(([campo, etiqueta]) => (
                <div key={campo}>
                  <CampoTexto
                    etiqueta={etiqueta}
                    valor={datos[campo]}
                    onChange={(v) => handleChange(campo, v)}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-sans text-xs font-semibold text-tertiary mb-1">
                  Dieta (separada por comas)
                </label>
                <input
                  type="text"
                  value={datos.dieta}
                  onChange={(e) => handleChange('dieta', e.target.value)}
                  className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary"
                />
              </div>
              <CampoTexto
                etiqueta="Dieta — otro"
                valor={datos.dieta_otro}
                onChange={(v) => handleChange('dieta_otro', v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-sans text-xs font-semibold text-tertiary mb-1">
                  Expectativas (separadas por comas)
                </label>
                <input
                  type="text"
                  value={datos.expectativas}
                  onChange={(e) => handleChange('expectativas', e.target.value)}
                  className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary"
                />
              </div>
              <CampoTexto
                etiqueta="Expectativas — otro"
                valor={datos.expectativas_otro}
                onChange={(v) => handleChange('expectativas_otro', v)}
              />
            </div>
            <CampoTexto
              etiqueta="Cómo se enteró"
              valor={datos.como_se_entero}
              onChange={(v) => handleChange('como_se_entero', v)}
            />
          </section>

          <div>
            <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Comentarios</label>
            <textarea
              value={datos.comentarios}
              onChange={(e) => handleChange('comentarios', e.target.value)}
              rows={3}
              className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-xs font-semibold mb-4 flex items-start gap-1.5 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-px" />
            {error}
          </p>
        )}

        <div className="flex gap-2 justify-end pt-4 border-t border-outline-variant/20">
          <button onClick={onCancelar} disabled={guardando} className="px-4 py-2 rounded-full font-sans text-xs font-semibold text-tertiary hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-white font-sans text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer disabled:opacity-50">
            {guardando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

/** Fila compacta de la lista — al tocarla, navega a la vista de detalle de esa persona. */
export default function FilaInscripcion({
  inscripcion,
  onAbrir
}: {
  inscripcion: Inscripcion;
  onAbrir: (id: number) => void;
  key?: number;
}) {
  const [modalRecordatorio, setModalRecordatorio] = useState(false);
  const recordatorio = calcularRecordatorio(inscripcion);

  const abrirRecordatorio = (e: MouseEvent) => {
    e.stopPropagation();
    setModalRecordatorio(true);
  };

  return (
    <article className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
      <button
        onClick={() => onAbrir(inscripcion.id)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-surface-container-low transition-colors cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-sans text-[11px] font-bold text-tertiary">
              #{String(inscripcion.id).padStart(3, '0')}
            </span>
            <h2 className="font-sans text-sm font-bold text-on-surface truncate">
              {inscripcion.nombre_completo}
            </h2>
            {inscripcion.tiene_pendientes && (
              <span className="px-2 py-0.5 rounded-full bg-accent-gold/20 text-[#8A6A00] font-sans text-[10px] font-bold uppercase tracking-wider">
                Por verificar
              </span>
            )}
            {recordatorio && (
              <span
                className="px-2 py-0.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: COLOR_DEBE_FONDO, color: COLOR_DEBE }}
              >
                Debe{recordatorio.monto ? ` $${recordatorio.monto}` : ''}
              </span>
            )}
            {inscripcion.condicion_medica &&
              inscripcion.condicion_medica.trim().toLowerCase() !== 'ninguna' && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-terracotta-soft/15 text-terracotta-soft font-sans text-[10px] font-bold uppercase tracking-wider"
                  title="Tiene una condición médica declarada"
                >
                  <HeartPulse className="w-3 h-3" />
                  Salud
                </span>
              )}
          </div>
          <p className="font-sans text-xs text-on-surface-variant mt-1 truncate">
            {inscripcion.email} · {inscripcion.origen_viaje}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {recordatorio && (
            <button
              onClick={abrirRecordatorio}
              title="Recordar por mail"
              className="p-2 rounded-full transition-colors cursor-pointer hover:opacity-80"
              style={{ backgroundColor: 'rgba(93, 35, 4, 0.1)', color: '#5D2304' }}
            >
              <Mail className="w-4 h-4" />
            </button>
          )}
          <div className="text-right">
            <p className="font-display text-xl text-primary leading-none">
              ${inscripcion.total_verificado}
            </p>
            <p className="font-sans text-[10px] text-tertiary uppercase tracking-wider mt-1">
              confirmado
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-tertiary shrink-0" />
        </div>
      </button>

      {modalRecordatorio && recordatorio && (
        <ModalRecordatorio
          inscripcion={inscripcion}
          recordatorio={recordatorio}
          onCerrar={() => setModalRecordatorio(false)}
        />
      )}
    </article>
  );
}

/** Vista de detalle de una sola persona — toda su información, edición y acciones en una sola pantalla. */
export function DetalleInscripcion({
  inscripcion,
  onCambio,
  onVolver
}: {
  inscripcion: Inscripcion;
  onCambio: () => void;
  onVolver: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [modalRecordatorio, setModalRecordatorio] = useState(false);
  const recordatorio = calcularRecordatorio(inscripcion);

  const handleBorrar = async () => {
    if (!window.confirm(`¿Estás segura de que querés borrar a ${inscripcion.nombre_completo}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setBorrando(true);
    try {
      await borrarInscripcion(inscripcion.id);
      onVolver();
      onCambio();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al borrar');
      setBorrando(false);
    }
  };

  return (
    <div className={borrando ? 'opacity-50 pointer-events-none' : ''}>
      <button
        onClick={onVolver}
        className="inline-flex items-center gap-1.5 mb-4 font-sans text-xs font-semibold text-tertiary hover:text-primary transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a la lista
      </button>

      <article className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="p-5 md:p-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sans text-[11px] font-bold text-tertiary">
                #{String(inscripcion.id).padStart(3, '0')}
              </span>
              <h2 className="font-display text-2xl text-primary">{inscripcion.nombre_completo}</h2>
              {inscripcion.tiene_pendientes && (
                <span className="px-2 py-0.5 rounded-full bg-accent-gold/20 text-[#8A6A00] font-sans text-[10px] font-bold uppercase tracking-wider">
                  Por verificar
                </span>
              )}
              {recordatorio && (
                <span
                  className="px-2 py-0.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: COLOR_DEBE_FONDO, color: COLOR_DEBE }}
                >
                  Debe{recordatorio.monto ? ` $${recordatorio.monto}` : ''}
                </span>
              )}
              {inscripcion.condicion_medica &&
                inscripcion.condicion_medica.trim().toLowerCase() !== 'ninguna' && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-terracotta-soft/15 text-terracotta-soft font-sans text-[10px] font-bold uppercase tracking-wider"
                    title="Tiene una condición médica declarada"
                  >
                    <HeartPulse className="w-3 h-3" />
                    Salud
                  </span>
                )}
            </div>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              {inscripcion.email} · {inscripcion.origen_viaje}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {recordatorio && (
              <button
                onClick={() => setModalRecordatorio(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-sans text-xs font-semibold transition-colors cursor-pointer hover:opacity-80"
                style={{ backgroundColor: 'rgba(93, 35, 4, 0.1)', color: '#5D2304' }}
              >
                <Mail className="w-3.5 h-3.5" />
                Mandar mail
              </button>
            )}
            <button
              onClick={() => setEditando(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-outline-variant text-tertiary font-sans text-xs font-semibold hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar
            </button>
            <button
              onClick={handleBorrar}
              disabled={borrando}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-red-200 text-red-600 font-sans text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Borrar inscripción"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Borrar
            </button>
            <div className="text-right pl-3 ml-1 border-l border-outline-variant/20">
              <p className="font-display text-xl text-primary leading-none">
                ${inscripcion.total_verificado}
              </p>
              <p className="font-sans text-[10px] text-tertiary uppercase tracking-wider mt-1">
                confirmado
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-outline-variant/20 p-5 md:p-6 space-y-6">
          <section>
            <h3 className="font-sans text-xs font-bold text-secondary uppercase tracking-wider mb-3">
              Pagos
            </h3>
            <div className="space-y-3">
              {inscripcion.pagos.length === 0 ? (
                <p className="font-sans text-sm text-on-surface-variant italic">
                  No hay pagos registrados.
                </p>
              ) : (
                inscripcion.pagos.map((pago) => (
                  <BloquePago
                    key={pago.id}
                    pago={pago}
                    nombreInscripta={inscripcion.nombre_completo}
                    email={inscripcion.email}
                    onCambio={onCambio}
                  />
                ))
              )}
            </div>
            <div className="mt-3">
              <AgregarPago inscripcionId={inscripcion.id} onAgregado={onCambio} />
            </div>
          </section>

          <section>
            <h3 className="font-sans text-xs font-bold text-secondary uppercase tracking-wider mb-3">
              Datos de la inscripción
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Dato etiqueta="Teléfono" valor={inscripcion.telefono} />
              <Dato etiqueta="Email" valor={inscripcion.email} />
              <Dato etiqueta="Dirección" valor={inscripcion.direccion} />
              <Dato
                etiqueta="Nacimiento"
                valor={`${inscripcion.fecha_nacimiento}${inscripcion.edad ? ` · ${inscripcion.edad} años` : ''}`}
              />
              <Dato
                etiqueta="Contacto de emergencia"
                valor={`${inscripcion.contacto_emergencia_nombre} · ${inscripcion.contacto_emergencia_telefono}`}
              />
              <Dato
                etiqueta="Idioma"
                valor={
                  inscripcion.idioma === 'es'
                    ? 'Español'
                    : inscripcion.idioma === 'en'
                      ? 'Inglés'
                      : 'Ambos'
                }
              />
              <Dato
                etiqueta="Alimentación"
                valor={[inscripcion.dieta.join(', '), inscripcion.dieta_otro]
                  .filter(Boolean)
                  .join(' · ')}
              />
              <Dato etiqueta="Condición médica" valor={inscripcion.condicion_medica} />
              <Dato
                etiqueta="Compañera de habitación"
                valor={inscripcion.preferencia_habitacion}
              />
              <Dato etiqueta="Transporte" valor={inscripcion.transporte} />
              <Dato etiqueta="Tiempo de oración" valor={inscripcion.oracion} />
              <Dato etiqueta="Apoyo a otras mujeres" valor={inscripcion.apoyo_otras_mujeres} />
              <Dato etiqueta="Cómo se enteró" valor={inscripcion.como_se_entero} />
              <Dato etiqueta="Inscripta el" valor={inscripcion.creado_en} />
            </dl>

            {inscripcion.expectativas.length > 0 && (
              <div className="mt-4">
                <p className="font-sans text-[11px] font-semibold text-tertiary uppercase tracking-wider mb-2">
                  Qué espera del retiro
                </p>
                <div className="flex flex-wrap gap-2">
                  {inscripcion.expectativas.map((e) => (
                    <span
                      key={e}
                      className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 font-sans text-xs text-on-surface-variant"
                    >
                      {e}
                    </span>
                  ))}
                  {inscripcion.expectativas_otro && (
                    <span className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 font-sans text-xs text-on-surface-variant">
                      {inscripcion.expectativas_otro}
                    </span>
                  )}
                </div>
              </div>
            )}

            {inscripcion.comentarios && (
              <div className="mt-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <p className="font-sans text-[11px] font-semibold text-tertiary uppercase tracking-wider mb-1">
                  Comentario
                </p>
                <p className="font-sans text-sm text-on-surface italic">
                  “{inscripcion.comentarios}”
                </p>
              </div>
            )}
          </section>
        </div>
      </article>

      {editando && (
        <ModalEdicion
          inscripcion={inscripcion}
          onCancelar={() => setEditando(false)}
          onGuardar={() => {
            setEditando(false);
            onCambio();
          }}
        />
      )}

      {modalRecordatorio && recordatorio && (
        <ModalRecordatorio
          inscripcion={inscripcion}
          recordatorio={recordatorio}
          onCerrar={() => setModalRecordatorio(false)}
        />
      )}
    </div>
  );
}
