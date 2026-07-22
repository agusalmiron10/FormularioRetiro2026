/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, Check, ShieldAlert, ChevronLeft, FileText, Instagram, Globe } from 'lucide-react';
import { RegistrationData } from '../types';
import { IMAGE_URLS, PAYMENT_OPTIONS, LINKS } from '../data';
import { CheckOption, StepProgress } from './FormControls';
import { motion } from 'motion/react';

interface Step5Props {
  data: RegistrationData;
  onChange: (updated: Partial<RegistrationData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  key?: string;
}

export default function Step5Finalize({ data, onChange, onBack, onSubmit }: Step5Props) {
  const [error, setError] = useState('');

  const selectedPayment = PAYMENT_OPTIONS.find((o) => o.id === data.paymentOption);
  const origin =
    data.travelOrigin === 'Otros' || data.travelOrigin === 'Desde otro país'
      ? data.travelOriginOther || data.travelOrigin
      : data.travelOrigin;

  const dietaryLabel = data.dietary
    .map((d) => (d === 'Otro' && data.otherDietary ? `Otro: ${data.otherDietary}` : d))
    .join(', ');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.paymentProof) {
      setError(
        'Falta el comprobante de pago. Volvé al paso 3 y adjuntá la captura de tu transferencia.'
      );
      return;
    }

    if (!data.confirmReservation || !data.confirmCancellation || !data.confirmTerms) {
      setError('Debés marcar las tres confirmaciones para poder enviar tu registro.');
      return;
    }

    setError('');
    onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-5xl mx-auto text-left"
    >
      <StepProgress step={5} label="Confirmación y Envío" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="registration-form-container">
        {/* Columna izquierda: resumen + T&C */}
        <div className="lg:col-span-7 space-y-6">
          {/* Resumen */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
            <h2 className="font-display text-2xl text-primary mb-2">Resumen de tu Registro</h2>
            <p className="font-sans text-xs text-on-surface-variant mb-6">
              Revisá que toda la información sea correcta antes de enviar tu solicitud.
            </p>

            <dl className="font-sans text-sm divide-y divide-outline-variant/10">
              {[
                { label: 'Participante', value: data.fullName },
                { label: 'Email', value: data.email },
                { label: 'Teléfono', value: data.phone },
                { label: 'Contacto de emergencia', value: `${data.emergencyName} · ${data.emergencyPhone}` },
                {
                  label: 'Idioma',
                  value: data.language === 'es' ? 'Español' : data.language === 'en' ? 'Inglés' : 'Ambos'
                },
                { label: 'Viaja desde', value: origin },
                { label: 'Alimentación', value: dietaryLabel },
                { label: 'Apoyo a otras mujeres', value: data.sponsorship },
                { label: 'Transporte', value: data.transport },
                { label: 'Tiempo de oración', value: data.prayerSession === 'Otros' ? data.prayerOther : data.prayerSession },
                {
                  label: 'Compañera de habitación',
                  value: data.roommatePreference || 'Sin preferencia'
                }
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4 py-3">
                  <dt className="text-tertiary text-xs font-semibold uppercase tracking-wide shrink-0">
                    {label}
                  </dt>
                  <dd className="text-on-surface font-semibold text-right min-w-0 break-words">
                    {value || <span className="text-on-surface-variant italic font-normal">No especificado</span>}
                  </dd>
                </div>
              ))}

              {/* Pago */}
              <div className="flex justify-between items-start gap-4 py-3">
                <dt className="text-tertiary text-xs font-semibold uppercase tracking-wide shrink-0">
                  Pago realizado
                </dt>
                <dd className="text-right min-w-0">
                  <span className="text-on-surface font-semibold break-words block">
                    {selectedPayment?.label || 'No especificado'}
                  </span>
                  {selectedPayment?.amount && (
                    <span className="font-display text-2xl text-primary block mt-1">
                      ${selectedPayment.amount}.00 AUD
                    </span>
                  )}
                </dd>
              </div>

              {/* Comprobante */}
              <div className="flex justify-between items-start gap-4 py-3">
                <dt className="text-tertiary text-xs font-semibold uppercase tracking-wide shrink-0">
                  Comprobante
                </dt>
                <dd className="text-right min-w-0">
                  {data.paymentProof ? (
                    <span className="inline-flex items-center gap-2">
                      {data.paymentProof.type.startsWith('image/') ? (
                        <img
                          src={data.paymentProof.dataUrl}
                          alt="Comprobante de pago adjuntado"
                          className="w-12 h-12 object-cover rounded-lg border border-outline-variant/40"
                        />
                      ) : (
                        <FileText className="w-5 h-5 text-tertiary" />
                      )}
                      <span className="font-sans text-xs font-semibold text-status-success">
                        Adjuntado
                      </span>
                    </span>
                  ) : (
                    <span className="font-sans text-xs font-bold text-red-600">Falta adjuntar</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {/* Términos y condiciones */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
            <h3 className="font-sans text-sm font-bold text-tertiary mb-4 uppercase tracking-wider">
              Términos y Condiciones — Alegría Retreats: Renueva 2026
            </h3>

            <div className="max-h-56 overflow-y-auto p-4 bg-cream-base border border-outline-variant/20 rounded-xl mb-6 text-xs text-on-surface-variant leading-relaxed space-y-3">
              <p>
                <strong>1. Inscripción.</strong> Tu lugar en el retiro quedará confirmado únicamente
                una vez recibido el pago y su comprobante correspondiente.
              </p>
              <p>
                <strong>2. Responsabilidad personal.</strong> Cada participante es responsable de su
                propio bienestar y se compromete a informar cualquier condición médica relevante al
                momento de la inscripción.
              </p>
              <p>
                <strong>3. Pérdidas y accidentes.</strong> Alegría Retreats no se hace responsable por
                pérdidas de objetos personales ni por accidentes ocurridos durante el evento.
              </p>
              <p>
                <strong>4. Convivencia.</strong> Se espera una conducta respetuosa hacia todas las
                participantes y el equipo organizador durante toda la estadía.
              </p>
              <p>
                <strong>5. Sustancias.</strong> No está permitido el consumo de alcohol ni de
                sustancias prohibidas dentro del predio del retiro.
              </p>
              <p>
                <strong>6. Fotografías y video.</strong> Autorizo el uso de fotografías y grabaciones
                tomadas durante las actividades del retiro con fines de difusión y promoción de
                futuros retiros en los canales de Alegría Retreats.
              </p>
              <p>
                <strong>7. Fuerza mayor.</strong> Ante situaciones de fuerza mayor ajenas a la
                organización, el retiro podrá ser reprogramado, ofreciéndose el traslado de la
                inscripción a la nueva fecha.
              </p>
              <p>
                <strong>8. Cancelación.</strong> Los pagos no son reembolsables, salvo situaciones de
                emergencia evaluadas por el equipo organizador, en cuyo caso podrá otorgarse un
                crédito para un próximo retiro.
              </p>
            </div>

            <h4 className="font-sans text-xs font-bold text-primary mb-3 uppercase tracking-wider">
              Confirmación y aceptación
              <span className="text-secondary align-super ml-1">*</span>
            </h4>

            <div className="space-y-3">
              <CheckOption
                checked={data.confirmReservation}
                onToggle={() => onChange({ confirmReservation: !data.confirmReservation })}
                label="Confirmo que entiendo que mi lugar quedará reservado una vez recibido el pago."
              />
              <CheckOption
                checked={data.confirmCancellation}
                onToggle={() => onChange({ confirmCancellation: !data.confirmCancellation })}
                label="Confirmo que he leído y acepto la Política de Cancelación."
              />
              <CheckOption
                checked={data.confirmTerms}
                onToggle={() => onChange({ confirmTerms: !data.confirmTerms })}
                label="Confirmo que he leído y acepto los Términos y Condiciones."
              />
            </div>

            {error && (
              <p className="text-red-600 text-xs font-semibold mt-4 flex items-start gap-1.5 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-px" />
                {error}
              </p>
            )}
          </section>

          {/* Comentarios finales */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
            <h3 className="font-display text-2xl text-primary mb-1">
              ¿Querés dejarnos algún comentario?
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mb-4">
              Opcional. Cualquier cosa que quieras compartir con el equipo antes del retiro.
            </p>
            <textarea
              value={data.comments}
              onChange={(e) => onChange({ comments: e.target.value })}
              rows={4}
              placeholder="Tu respuesta"
              className="soft-input font-sans text-sm resize-none rounded-t-md"
            />
          </section>
        </div>

        {/* Columna derecha: visual y acción */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl overflow-hidden aspect-[4/5] relative group shadow-lg">
            <img
              src={IMAGE_URLS.dockSunset}
              alt="Donde el espíritu florece de nuevo"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-left">
              <p className="font-display text-3xl text-white mb-2 italic">
                "Donde el espíritu florece de nuevo."
              </p>
              <p className="font-sans text-xs text-white/80 tracking-wide">
                Wisemans Retreat, NSW · 11–13 de septiembre de 2026
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFormSubmit}
            className="w-full bg-primary hover:bg-primary-container text-white hover:text-on-primary-container py-5 rounded-full font-sans text-base font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-95 duration-200"
          >
            <span>Enviar Registro</span>
            <Send className="w-4 h-4" />
          </button>

          <p className="text-center font-sans text-xs text-tertiary italic">
            Tu registro será procesado de forma segura.
          </p>

          <button
            type="button"
            onClick={onBack}
            className="text-primary hover:text-primary-container text-center font-sans text-sm font-semibold flex items-center justify-center gap-1 cursor-pointer self-center"
          >
            <ChevronLeft className="w-4 h-4" />
            Corregir datos anteriores
          </button>

          {/* Enlaces oficiales */}
          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 space-y-3">
            <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-wider">
              Seguí conectada
            </h4>
            <a
              href={LINKS.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              <Globe className="w-4 h-4 text-secondary" />
              alegriabewell.com
            </a>
            <a
              href={LINKS.instagramRetreats}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              <Instagram className="w-4 h-4 text-secondary" />
              @alegria_retreats
            </a>
            <a
              href={LINKS.instagramBewell}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              <Instagram className="w-4 h-4 text-secondary" />
              @alegriabewell
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
