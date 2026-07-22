/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Landmark,
  Info,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  UploadCloud,
  FileText,
  Trash2,
  ShieldAlert,
  Heart
} from 'lucide-react';
import { RegistrationData, PaymentProof } from '../types';
import {
  BANK_DETAILS,
  INCLUSIONS,
  PAYMENT_OPTIONS,
  PROOF_RULES,
  SPONSORSHIP_OPTIONS
} from '../data';
import { Question, RadioOption, StepProgress } from './FormControls';
import { motion } from 'motion/react';

interface Step3Props {
  data: RegistrationData;
  onChange: (updated: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
  key?: string;
}

const GROUP_LABELS: Record<string, string> = {
  anticipado: 'Precio anticipado — $450 AUD (hasta el 31 de julio de 2026)',
  regular: 'Precio regular — $480 AUD (desde el 1 de agosto de 2026)',
  voluntaria: 'Voluntaria',
  donacion: 'Donación'
};

export default function Step3Payment({ data, onChange, onNext, onBack }: Step3Props) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* El portapapeles puede estar bloqueado; el dato sigue visible en pantalla. */
    }
  };

  const readFile = (file: File) => {
    if (!PROOF_RULES.acceptedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        paymentProof: 'Formato no válido. Subí una imagen (JPG, PNG, WEBP) o un PDF.'
      }));
      return;
    }

    if (file.size > PROOF_RULES.maxSizeMB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        paymentProof: `El archivo supera los ${PROOF_RULES.maxSizeMB} MB. Probá con una captura más liviana.`
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const proof: PaymentProof = {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result as string
      };
      onChange({ paymentProof: proof });
      setErrors((prev) => {
        const next = { ...prev };
        delete next.paymentProof;
        return next;
      });
    };
    reader.onerror = () => {
      setErrors((prev) => ({
        ...prev,
        paymentProof: 'No pudimos leer el archivo. Intentá nuevamente con otra captura.'
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const removeProof = () => {
    onChange({ paymentProof: null });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { [key: string]: string } = {};

    if (!data.sponsorship) {
      next.sponsorship = 'Seleccioná una opción para continuar.';
    }

    if (!data.paymentOption) {
      next.paymentOption = 'Indicá qué pago estás realizando.';
    }

    if (!data.paymentProof) {
      next.paymentProof =
        'El comprobante de pago es obligatorio. Sin la captura de la transferencia no podemos confirmar tu lugar.';
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      const firstError = document.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onNext();
  };

  const selectedOption = PAYMENT_OPTIONS.find((o) => o.id === data.paymentOption);
  const isImageProof = data.paymentProof?.type.startsWith('image/');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-3xl mx-auto text-left"
    >
      <StepProgress step={3} label="Registro y Pago" />

      <div className="mb-8">
        <h1 className="font-display text-4xl text-primary mb-2">Detalles de Registro y Pago</h1>
        <p className="font-sans text-sm text-on-surface-variant">
          Tu lugar queda reservado una vez recibido el pago. Completá los datos y adjuntá el
          comprobante de tu transferencia.
        </p>
      </div>

      {/* Qué incluye */}
      <section className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm mb-8">
        <h2 className="font-sans text-xs font-bold text-secondary mb-4 uppercase tracking-wider">
          Tu inscripción incluye
        </h2>
        <ul className="space-y-2.5">
          {INCLUSIONS.map((item) => (
            <li key={item} className="flex items-start gap-2.5 font-sans text-sm text-on-surface-variant">
              <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Q13 — Apadrinar */}
        <div
          data-error={Boolean(errors.sponsorship)}
          className="bg-white p-6 md:p-8 rounded-2xl border border-primary/5 shadow-sm"
        >
          <Question
            title="¿Te gustaría apoyar a otras mujeres para que puedan asistir al retiro?"
            description={
              <span className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                Gracias a estos aportes, muchas mujeres que no podrían costear el retiro logran
                participar.
              </span>
            }
            error={errors.sponsorship}
          >
            <div className="space-y-3">
              {SPONSORSHIP_OPTIONS.map((option) => (
                <RadioOption
                  key={option}
                  name="sponsorship"
                  value={option}
                  checked={data.sponsorship === option}
                  onSelect={(value) => onChange({ sponsorship: value })}
                  label={option}
                />
              ))}
            </div>
          </Question>
        </div>

        {/* Q14 — Qué pago estás realizando */}
        <div
          data-error={Boolean(errors.paymentOption)}
          className="bg-white p-6 md:p-8 rounded-2xl border border-primary/5 shadow-sm"
        >
          <Question title="¿Qué pago estás realizando?" error={errors.paymentOption}>
            <div className="space-y-6">
              {(['anticipado', 'regular', 'voluntaria', 'donacion'] as const).map((group) => (
                <div key={group}>
                  <h3 className="font-sans text-[11px] font-bold text-tertiary uppercase tracking-wider mb-2.5">
                    {GROUP_LABELS[group]}
                  </h3>
                  <div className="space-y-3">
                    {PAYMENT_OPTIONS.filter((o) => o.group === group).map((option) => (
                      <RadioOption
                        key={option.id}
                        name="paymentOption"
                        value={option.id}
                        checked={data.paymentOption === option.id}
                        onSelect={(value) => onChange({ paymentOption: value })}
                        label={option.label}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Question>
        </div>

        {/* Datos bancarios */}
        <section className="bg-surface-container-high p-6 md:p-8 rounded-2xl border-l-4 border-secondary text-on-surface">
          <div className="flex items-start gap-4">
            <Landmark className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
            <div className="w-full">
              <h2 className="font-sans text-xs font-bold text-tertiary mb-4 uppercase tracking-wide">
                Detalles de Transferencia Bancaria
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Nombre de la cuenta', value: BANK_DETAILS.accountName },
                  { label: 'BSB', value: BANK_DETAILS.bsb },
                  { label: 'Número de cuenta', value: BANK_DETAILS.accountNumber }
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="font-sans text-xs text-tertiary">{label}</p>
                    <div className="flex items-center gap-2">
                      <p className="font-sans text-sm font-bold text-on-surface tracking-wide">{value}</p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(label, value)}
                        className="p-1 text-tertiary hover:text-primary transition-colors cursor-pointer"
                        aria-label={`Copiar ${label}`}
                      >
                        {copied === label ? (
                          <Check className="w-3.5 h-3.5 text-status-success" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2 pt-2 border-t border-primary/10">
                  <p className="font-sans text-xs text-on-surface-variant">
                    <strong className="text-primary">Referencia obligatoria:</strong> tu nombre completo
                    + la palabra <strong>RENUEVA</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comprobante de pago — OBLIGATORIO */}
        <div
          data-error={Boolean(errors.paymentProof)}
          className={`bg-white p-6 md:p-8 rounded-2xl shadow-sm border-2 transition-colors ${
            errors.paymentProof ? 'border-red-300' : 'border-primary/5'
          }`}
        >
          <Question
            title="Comprobante de pago"
            description={
              <>
                <p>
                  Adjuntá la <strong>captura de pantalla o el PDF de tu transferencia</strong>. Este
                  paso es obligatorio: sin el comprobante no podemos confirmar tu reserva.
                </p>
                <p className="mt-1">
                  Formatos aceptados: JPG, PNG, WEBP o PDF · Máximo {PROOF_RULES.maxSizeMB} MB.
                </p>
              </>
            }
            error={errors.paymentProof}
          >
            {data.paymentProof ? (
              <div className="rounded-xl border-2 border-status-success/40 bg-status-success/5 p-4">
                <div className="flex items-start gap-4">
                  {isImageProof ? (
                    <img
                      src={data.paymentProof.dataUrl}
                      alt="Vista previa del comprobante de pago"
                      className="w-24 h-24 object-cover rounded-lg border border-outline-variant/40 shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-surface-container-low border border-outline-variant/40 flex items-center justify-center shrink-0">
                      <FileText className="w-8 h-8 text-tertiary" />
                    </div>
                  )}

                  <div className="min-w-0 flex-grow">
                    <p className="font-sans text-xs font-bold text-status-success uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Comprobante adjuntado
                    </p>
                    <p className="font-sans text-sm text-on-surface font-semibold mt-1 truncate">
                      {data.paymentProof.name}
                    </p>
                    <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                      {(data.paymentProof.size / 1024).toFixed(0)} KB
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-sans text-xs font-semibold text-primary hover:underline decoration-2 underline-offset-2 cursor-pointer"
                      >
                        Cambiar archivo
                      </button>
                      <button
                        type="button"
                        onClick={removeProof}
                        className="font-sans text-xs font-semibold text-red-600 hover:underline decoration-2 underline-offset-2 cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  dragging
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low'
                }`}
              >
                <UploadCloud className="w-10 h-10 text-secondary mx-auto mb-3" />
                <p className="font-sans text-sm font-semibold text-primary">
                  Subí la captura de tu transferencia
                </p>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  Arrastrá el archivo aquí o hacé clic para seleccionarlo
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={PROOF_RULES.accept}
              onChange={handleFileInput}
              className="hidden"
            />

            {selectedOption?.amount && (
              <p className="font-sans text-xs text-on-surface-variant mt-4 bg-surface-container-low px-3 py-2.5 rounded-lg border border-outline-variant/30">
                Verificá que el comprobante corresponda a{' '}
                <strong className="text-primary">${selectedOption.amount} AUD</strong> — {selectedOption.label}
              </p>
            )}
          </Question>
        </div>

        {/* Política de cancelación */}
        <section className="p-6 rounded-2xl border border-outline-variant/40 bg-cream-base/50">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-terracotta-soft mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-sans text-sm font-bold text-terracotta-soft mb-2">
                Política de Cancelación
              </h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Los pagos realizados no son reembolsables, salvo situaciones de emergencia evaluadas
                por el equipo organizador. En esos casos podrá otorgarse un crédito para un próximo
                retiro de Alegría Retreats. Tu lugar queda reservado únicamente una vez recibido el
                pago y su comprobante.
              </p>
            </div>
          </div>
        </section>

        {/* Navegación */}
        <div className="pt-6 flex flex-col-reverse sm:flex-row gap-4 items-center justify-between border-t border-primary/10">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-secondary font-sans text-sm font-semibold hover:bg-secondary/5 rounded-full transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto bg-primary text-white font-sans text-sm font-semibold px-10 py-4 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container hover:text-on-primary-container hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {!data.paymentProof && (
          <p className="font-sans text-xs text-tertiary flex items-center justify-center gap-1.5 text-center">
            <ShieldAlert className="w-3.5 h-3.5 text-secondary" />
            No podrás avanzar sin adjuntar el comprobante de pago.
          </p>
        )}
      </form>
    </motion.div>
  );
}
