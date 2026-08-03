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
  PAYMENT_OPTIONS,
  PROOF_RULES,
  SPONSORSHIP_OPTIONS
} from '../data';
import { Question, RadioOption, StepProgress } from './FormControls';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
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

  const copyAllBankDetails = async () => {
    const text = [
      `Banco: Alegria BeWell House`,
      `BSB: ${BANK_DETAILS.bsb}`,
      `Cuenta: ${BANK_DETAILS.accountNumber}`,
      `Referencia: Tu nombre completo + RENUEVA`
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      /* portapapeles bloqueado */
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
        dataUrl: reader.result as string,
        file
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
      <StepProgress step={3} label={t('step3.badge')} />

      <div className="mb-8">
        <h1 className="font-display text-4xl text-primary mb-2">{t('step3.title')}</h1>
        <p className="font-sans text-sm text-on-surface-variant">
          {t('step3.subtitle')}
        </p>
      </div>

      {/* Detalles de Registro y Pago */}
      <section className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm mb-8 space-y-4 font-sans text-sm text-on-surface-variant">
        <h2 className="font-sans text-xs font-bold text-on-surface uppercase tracking-wider">
          Detalles de Registro y Pago:
        </h2>
        <p>
          La inscripción incluye alojamiento por 2 noches, todas las comidas, materiales y regalos.
        </p>

        <div className="space-y-2">
          <p className="font-bold text-on-surface">Incluye:</p>
          <p>
            <span className="font-bold text-on-surface">Comidas completas:</span>{' '}
            desayuno, refrigerio de la mañana (Morning Tea), almuerzo, merienda de la tarde y cena,
          </p>
          <p>
            <span className="font-bold text-on-surface">Alojamiento:</span>{' '}
            todas las habitaciones cuentan con servicio completo — sábanas, toallas, manta, almohada,
            baño privado, cafetera, kettle, mini fridge, café y té.
          </p>
          <p>
            <span className="font-bold text-on-surface">Materiales</span> que se utilizarán durante
            las sesiones y talleres del retiro.
          </p>
          <p>Kit de bienvenida y regalo especial.</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-primary/10">
          <p className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400 shrink-0" />
            <span>
              <strong>Pago único de $450 AUD al registrarte.</strong>
            </span>
          </p>
          <p className="ml-5 text-xs">Disponible hasta el 4 de Septiembre de 2026.</p>

          <p className="flex items-start gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 shrink-0 mt-0.5" />
            <span className="italic text-xs">
              <strong>(Los cupos son limitados.</strong> Tu lugar queda confirmado al recibir tu pago
              inicial o total. Te recomendamos aprovechar el precio lanzamiento hasta el 1 de agosto
              2026.)
            </span>
          </p>
        </div>

        <div className="pt-3 border-t border-primary/10 space-y-1.5">
          <p className="font-bold text-on-surface text-xs uppercase tracking-wider">
            Detalles Bancarios:
          </p>
          <p>
            <strong>Nombre de la cuenta:</strong> {BANK_DETAILS.accountName}
          </p>
          <p>
            <strong>BSB:</strong> {BANK_DETAILS.bsb}
          </p>
          <p>
            <strong>Número de cuenta:</strong> {BANK_DETAILS.accountNumber}
          </p>
        </div>

        <div className="pt-2 border-t border-primary/10 space-y-1.5 text-xs">
          <p>
            <strong>Referencia:</strong> al realizar tu transferencia, escribí tu nombre completo y
            la palabra <strong>"RENUEVA"</strong> en el campo de referencia para identificar tu pago.
          </p>
          <p>
            <strong>Confirmación de pago:</strong> una vez hecha la transferencia, envía tu
            comprobante por email{' '}
            <a
              href="mailto:alegriabewell@gmail.com"
              className="text-primary underline hover:text-primary/80 transition-colors"
            >
              alegriabewell@gmail.com
            </a>{' '}
            para completar tu registro.
          </p>
        </div>
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
                  label={t(option)}
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
                    {t(GROUP_LABELS[group])}
                  </h3>
                  <div className="space-y-3">
                    {PAYMENT_OPTIONS.filter((o) => o.group === group).map((option) => (
                      <RadioOption
                        key={option.id}
                        name="paymentOption"
                        value={option.id}
                        checked={data.paymentOption === option.id}
                        onSelect={(value) => onChange({ paymentOption: value })}
                        label={t(option.label)}
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
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-sans text-xs font-bold text-tertiary uppercase tracking-wide">
                  {t('step3.bank')}
                </h2>
                <button
                  type="button"
                  onClick={copyAllBankDetails}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-semibold transition-all cursor-pointer ${
                    copiedAll
                      ? 'bg-status-success/15 text-status-success border border-status-success/30'
                      : 'bg-white border border-outline-variant/50 text-tertiary hover:border-primary hover:text-primary'
                  }`}
                >
                  {copiedAll ? (
                    <><Check className="w-3.5 h-3.5" /> {t('step3.copied')}</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> {t('step3.copyAll')}</>
                  )}
                </button>
              </div>
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
            title={t('step3.upload')}
            description={
              <>
                <p>
                  {t('step3.upload.desc')}
                </p>
                <p className="mt-1">
                  {t('step3.upload.help')}
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
                      {t('step3.uploaded')}
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
        <section className="p-6 rounded-2xl border border-outline-variant/40 bg-cream-base/50 space-y-3">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-terracotta-soft mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <h3 className="font-sans text-sm font-bold text-terracotta-soft">
                Política de Cancelación:
              </h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Debido a los compromisos asumidos con el lugar del retiro y a la planificación
                anticipada de todos los servicios, los depósitos y pagos realizados no son
                reembolsables. Sin embargo, si no podés asistir, podrás transferir tu lugar a otra
                participante, previa coordinación y aprobación de la organización.
              </p>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Para asegurar tu lugar en el retiro, se requiere el pago total o la primera cuota al
                momento de registrarte.
              </p>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                En el caso de elegir el Precio Anticipado, el pago total deberá completarse antes
                del 31 de julio de 2026.
              </p>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Desde el 1 de agosto de 2026, las inscripciones correspondientes al Precio Regular
                deberán abonarse en su totalidad al momento de registrarte.
              </p>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Agradecemos tu comprensión y tu compromiso, que nos permiten organizar el
                retiro con responsabilidad y cuidado, y seguir bendiciendo a más mujeres a través
                de Alegría Retreats.
              </p>

              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                <span className="font-bold text-on-surface">Confirmación de Registro:</span>{" "}
                Una vez que recibamos tu formulario de registro y tu pago, te enviaremos un correo
                electrónico de confirmación.
              </p>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Más cerca de la fecha del retiro recibirás por email todos los detalles logísticos,
                recomendaciones y materiales necesarios para vivir esta experiencia con tranquilidad.
              </p>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                <span className="font-bold text-on-surface">¿Dudas o preguntas?</span>{" "}
                Si necesitás más información, podés contactarnos por WhatsApp al{" "}
                <a
                  href="https://wa.me/58422351193"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80 transition-colors"
                >
                  0422 351 193
                </a>.
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
