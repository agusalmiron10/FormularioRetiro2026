/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, ShieldAlert, ChevronLeft, FileText, Instagram, Globe, Loader2 } from 'lucide-react';
import { RegistrationData } from '../types';
import { IMAGE_URLS, PAYMENT_OPTIONS, LINKS } from '../data';
import { CheckOption, StepProgress } from './FormControls';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface Step5Props {
  data: RegistrationData;
  onChange: (updated: Partial<RegistrationData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
  key?: string;
}

export default function Step5Finalize({
  data,
  onChange,
  onBack,
  onSubmit,
  submitting,
  submitError
}: Step5Props) {
  const { t } = useLanguage();
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
      setError(t('error.receipt'));
      return;
    }

    if (!data.confirmReservation || !data.confirmCancellation || !data.confirmTerms) {
      setError(t('error.terms'));
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
      <StepProgress step={5} label={t('step5.badge')} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="registration-form-container">
        {/* Columna izquierda: resumen + T&C */}
        <div className="lg:col-span-7 space-y-6">
          {/* Resumen */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
            <h2 className="font-display text-2xl text-primary mb-2">{t('step5.title')}</h2>
            <p className="font-sans text-xs text-on-surface-variant mb-6">
              {t('step5.subtitle')}
            </p>

            <dl className="font-sans text-sm divide-y divide-outline-variant/10">
              {[
                { label: t('step5.summary.personal'), value: data.fullName },
                { label: 'Email', value: data.email },
                { label: t('step1.phone'), value: data.phone },
                { label: t('step1.emergency'), value: `${data.emergencyName} · ${data.emergencyPhone}` },
                {
                  label: t('step2.lang'),
                  value: data.language === 'es' ? t('step2.lang.es') : data.language === 'en' ? t('step2.lang.en') : t('step2.lang.both')
                },
                { label: t('step2.origin'), value: origin },
                { label: t('step5.summary.diet'), value: dietaryLabel },
                { label: t('step4.support'), value: t(data.sponsorship) },
                { label: t('step4.transport'), value: t(data.transport) },
                { label: t('step4.prayer'), value: data.prayerSession === 'Otros' ? data.prayerOther : t(data.prayerSession) },
                {
                  label: t('step5.summary.roommate'),
                  value: data.roommatePreference || t('step5.summary.empty')
                }
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4 py-3">
                  <dt className="text-tertiary text-xs font-semibold uppercase tracking-wide shrink-0">
                    {label}
                  </dt>
                  <dd className="text-on-surface font-semibold text-right min-w-0 break-words">
                    {value || <span className="text-on-surface-variant italic font-normal">{t('step5.summary.empty')}</span>}
                  </dd>
                </div>
              ))}

              {/* Pago */}
              <div className="flex justify-between items-start gap-4 py-3">
                <dt className="text-tertiary text-xs font-semibold uppercase tracking-wide shrink-0">
                  {t('step3.badge')}
                </dt>
                <dd className="text-right min-w-0">
                  <span className="text-on-surface font-semibold break-words block">
                    {selectedPayment?.label ? t(selectedPayment.label) : t('step5.summary.empty')}
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
                  {t('step3.upload')}
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
                        {t('step3.uploaded')}
                      </span>
                    </span>
                  ) : (
                    <span className="font-sans text-xs font-bold text-red-600">{t('step5.summary.empty')}</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {/* Comentarios finales */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
            <h3 className="font-display text-2xl text-primary mb-1">
              {t('step5.comments')}
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mb-4">
              {t('step5.comments.ph')}
            </p>
            <textarea
              value={data.comments}
              onChange={(e) => onChange({ comments: e.target.value })}
              rows={4}
              placeholder={t('step5.comments.ph')}
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

          {/* Términos y condiciones */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
            <h3 className="font-sans text-sm font-bold text-tertiary mb-4 uppercase tracking-wider">
              {t('step5.terms.title')}
            </h3>

            <div className="max-h-40 overflow-y-auto p-4 bg-cream-base border border-outline-variant/20 rounded-xl mb-6 text-xs text-on-surface-variant leading-relaxed space-y-3">
              <p>
                <strong>1. Inscripción.</strong> Tu lugar en el retiro quedará confirmado únicamente
                una vez recibido el pago y su comprobante.
              </p>
              <p>
                <strong>2. Responsabilidad.</strong> Cada participante es responsable de su bienestar.
              </p>
              <p>
                <strong>3. Convivencia.</strong> Se espera una conducta respetuosa hacia todas las participantes.
              </p>
              <p>
                <strong>4. Cancelación.</strong> Los pagos no son reembolsables salvo emergencias evaluadas.
              </p>
            </div>

            <h4 className="font-sans text-xs font-bold text-primary mb-3 uppercase tracking-wider">
              {t('step5.confirm.title')}
              <span className="text-secondary align-super ml-1">*</span>
            </h4>

            <div className="space-y-3">
              <CheckOption
                checked={data.confirmReservation}
                onToggle={() => onChange({ confirmReservation: !data.confirmReservation })}
                label={t('step5.confirm.reservation')}
              />
              <CheckOption
                checked={data.confirmCancellation}
                onToggle={() => onChange({ confirmCancellation: !data.confirmCancellation })}
                label={t('step5.confirm.cancellation')}
              />
              <CheckOption
                checked={data.confirmTerms}
                onToggle={() => onChange({ confirmTerms: !data.confirmTerms })}
                label={t('step5.confirm.terms')}
              />
            </div>

            {(error || submitError) && (
              <p className="text-red-600 text-xs font-semibold mt-4 flex items-start gap-1.5 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-px" />
                {error || submitError}
              </p>
            )}
          </section>

          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-container text-white hover:text-on-primary-container py-5 rounded-full font-sans text-base font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-95 duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('step5.submitting')}</span>
              </>
            ) : (
              <>
                <span>{t('step5.submit')}</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="text-primary hover:text-primary-container text-center font-sans text-sm font-semibold flex items-center justify-center gap-1 cursor-pointer self-center mt-6"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('form.back')}
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
