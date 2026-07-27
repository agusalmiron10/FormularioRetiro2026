/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Confirmación antes de mandar el mail de recordatorio de pago. A diferencia
 * de un link de WhatsApp, este envío lo hace el propio servidor — por eso
 * pide confirmar antes, igual que Verificar/Rechazar.
 */

import { useState } from 'react';
import { Mail, Loader2, Check, AlertTriangle } from 'lucide-react';
import { Inscripcion, enviarRecordatorio } from './api';
import { Recordatorio } from './recordatorios';

const primerNombre = (nombreCompleto: string): string =>
  nombreCompleto.trim().split(/\s+/)[0] || 'Hola';

export default function ModalRecordatorio({
  inscripcion,
  recordatorio,
  onCerrar,
  onEnviado
}: {
  inscripcion: Inscripcion;
  recordatorio: Recordatorio;
  onCerrar: () => void;
  onEnviado?: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const confirmar = async () => {
    setEnviando(true);
    setError('');
    try {
      await enviarRecordatorio(inscripcion.id, recordatorio.detalle);
      setEnviado(true);
      onEnviado?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos mandar el mail.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-xl"
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4 bg-secondary/15 text-secondary">
          {enviado ? <Check className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
        </div>

        {enviado ? (
          <>
            <h3 className="font-display text-xl text-primary mb-1.5">Mail enviado</h3>
            <p className="font-sans text-sm text-on-surface-variant mb-5">
              Le llegó el recordatorio a <strong className="text-on-surface">{inscripcion.email}</strong>.
            </p>
            <div className="flex justify-end">
              <button
                onClick={onCerrar}
                className="px-5 py-2 rounded-full bg-primary text-white font-sans text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-display text-xl text-primary mb-1.5">
              ¿Mandamos el recordatorio de pago?
            </h3>
            <p className="font-sans text-sm text-on-surface-variant mb-4">
              A <strong className="text-on-surface">{inscripcion.email}</strong>, avisándole que{' '}
              {recordatorio.detalle}.
            </p>

            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 mb-5">
              <p className="font-sans text-[10px] font-bold text-tertiary uppercase tracking-wider mb-1.5">
                Vista previa
              </p>
              <p className="font-sans text-xs text-on-surface-variant italic leading-relaxed">
                "¡Hola {primerNombre(inscripcion.nombre_completo)}! Te escribimos de Alegría
                Retreats por tu inscripción a Renueva 2026. Vemos que {recordatorio.detalle} para
                confirmar tu lugar en el retiro…"
              </p>
            </div>

            {error && (
              <p className="text-red-600 text-xs font-semibold flex items-center gap-1.5 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={onCerrar}
                disabled={enviando}
                className="px-4 py-2 rounded-full font-sans text-xs font-semibold text-tertiary hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmar}
                disabled={enviando}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-secondary text-white font-sans text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {enviando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Sí, mandar mail
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
