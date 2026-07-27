/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import type { MouseEvent } from 'react';
import {
  ChevronDown,
  Check,
  X,
  FileText,
  Loader2,
  Trophy,
  Undo2,
  HeartPulse,
  Mail,
  MessageCircle,
  ShieldAlert,
  Edit3,
  Save,
  Trash2
} from 'lucide-react';
import { Inscripcion, Pago, actualizarPago, actualizarInscripcion, borrarInscripcion, urlComprobante } from './api';
import { calcularRecordatorio, urlWhatsapp } from './recordatorios';

const VERDE_WHATSAPP = '#25D366';
const VERDE_WHATSAPP_TEXTO = '#128C4A';

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
          <p className="font-sans text-sm font-semibold text-on-surface mt-1.5">
            {pago.descripcion}
          </p>
          <p className="font-sans text-xs text-on-surface-variant mt-0.5">
            Reportado el {pago.reportado_en}
            {pago.verificado_en && ` · Verificado el ${pago.verificado_en} por ${pago.verificado_por}`}
          </p>
        </div>

        {pago.monto !== null && (
          <p className="font-display text-2xl text-primary shrink-0">${pago.monto} AUD</p>
        )}
      </div>

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

function ModalEdicion({
  inscripcion,
  onCancelar,
  onGuardar
}: {
  inscripcion: Inscripcion;
  onCancelar: () => void;
  onGuardar: () => void;
}) {
  const [datos, setDatos] = useState<Partial<Inscripcion>>({
    nombre_completo: inscripcion.nombre_completo,
    email: inscripcion.email,
    telefono: inscripcion.telefono,
    direccion: inscripcion.direccion,
    condicion_medica: inscripcion.condicion_medica || '',
    comentarios: inscripcion.comentarios || '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const guardar = async () => {
    setGuardando(true);
    setError('');
    try {
      await actualizarInscripcion(inscripcion.id, datos);
      onGuardar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (campo: keyof Inscripcion, valor: string) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
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

        <div className="space-y-4 mb-6">
          <div>
            <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Nombre completo</label>
            <input type="text" value={datos.nombre_completo} onChange={(e) => handleChange('nombre_completo', e.target.value)} className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Email</label>
              <input type="email" value={datos.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Teléfono</label>
              <input type="text" value={datos.telefono} onChange={(e) => handleChange('telefono', e.target.value)} className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Dirección</label>
            <input type="text" value={datos.direccion} onChange={(e) => handleChange('direccion', e.target.value)} className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Condición Médica</label>
            <input type="text" value={datos.condicion_medica || ''} onChange={(e) => handleChange('condicion_medica', e.target.value)} className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block font-sans text-xs font-semibold text-tertiary mb-1">Comentarios</label>
            <textarea value={datos.comentarios || ''} onChange={(e) => handleChange('comentarios', e.target.value)} rows={3} className="w-full bg-white border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm outline-none focus:border-primary resize-none" />
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

export default function FichaInscripcion({
  inscripcion,
  onCambio
}: {
  inscripcion: Inscripcion;
  onCambio: () => void;
  key?: number;
}) {
  const [abierta, setAbierta] = useState(false);
  const [editando, setEditando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const recordatorio = calcularRecordatorio(inscripcion);

  const enviarWhatsapp = (e: MouseEvent) => {
    e.stopPropagation();
    if (!recordatorio?.telefono) return;
    window.open(
      urlWhatsapp(recordatorio.telefono, recordatorio.mensaje),
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleBorrar = async () => {
    if (!window.confirm(`¿Estás segura de que querés borrar a ${inscripcion.nombre_completo}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setBorrando(true);
    try {
      await borrarInscripcion(inscripcion.id);
      onCambio();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al borrar');
      setBorrando(false);
    }
  };

  return (
    <article className={`bg-white rounded-2xl border border-outline-variant/20 overflow-hidden ${borrando ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        onClick={() => setAbierta(!abierta)}
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
                style={{ backgroundColor: `${VERDE_WHATSAPP}26`, color: VERDE_WHATSAPP_TEXTO }}
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
          {recordatorio?.telefono && (
            <button
              onClick={enviarWhatsapp}
              title="Recordar por WhatsApp"
              className="p-2 rounded-full transition-colors cursor-pointer"
              style={{ backgroundColor: `${VERDE_WHATSAPP}1A`, color: VERDE_WHATSAPP_TEXTO }}
            >
              <MessageCircle className="w-4 h-4" />
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
          <ChevronDown
            className={`w-5 h-5 text-tertiary transition-transform ${abierta ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {abierta && (
        <div className="border-t border-outline-variant/20 p-5 space-y-6">
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
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sans text-xs font-bold text-secondary uppercase tracking-wider">
                Datos de la inscripción
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditando(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant text-tertiary font-sans text-xs font-semibold hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  Editar
                </button>
                <button 
                  onClick={handleBorrar}
                  disabled={borrando}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 text-red-600 font-sans text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                  title="Borrar inscripción"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
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
      )}

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
    </article>
  );
}
