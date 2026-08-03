/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Sparkles, Check, Bookmark, Info } from 'lucide-react';
import { RegistrationData } from '../types';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface Step1Props {
  data: RegistrationData;
  onChange: (updated: Partial<RegistrationData>) => void;
  onNext: () => void;
  onSaveDraft: () => void;
  draftSaved: boolean;
  key?: string;
}

export default function Step1PersonalInfo({ 
  data, 
  onChange, 
  onNext, 
  onSaveDraft,
  draftSaved
}: Step1Props) {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!data.fullName.trim()) newErrors.fullName = t('error.required');
    if (!data.phone.trim()) newErrors.phone = t('error.required');
    
    // Email regex
    if (!data.email.trim()) {
      newErrors.email = t('error.required');
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = t('error.email');
    }

    if (!data.address.trim()) newErrors.address = t('error.required');
    if (!data.birthDate) newErrors.birthDate = t('error.required');
    if (!data.age || parseInt(data.age) <= 0) newErrors.age = t('error.age');
    
    if (!data.emergencyName.trim()) newErrors.emergencyName = t('error.required');
    if (!data.emergencyPhone.trim()) newErrors.emergencyPhone = t('error.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-2xl mx-auto"
    >
      {/* Progress Header */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-2">
          <span className="font-sans text-xs font-bold text-primary uppercase tracking-widest">{t('form.step').replace('{0}', '1')}</span>
          <span className="font-sans text-xs font-semibold text-on-surface-variant">{t('step1.badge')}</span>
        </div>
        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/5 transition-all duration-700 ease-out"></div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-10 text-left">
        <h2 className="font-display text-4xl text-primary mb-3">{t('step1.title')}</h2>
        <p className="font-sans text-sm text-tertiary leading-relaxed">
          {t('step1.subtitle')}
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">{t('step1.name')}</label>
            <input 
              type="text" 
              value={data.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder={t('step1.name.ph')}
              className="soft-input font-sans text-sm"
            />
            {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">{t('step1.phone')}</label>
            <input 
              type="tel" 
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder={t('step1.phone.ph')}
              className="soft-input font-sans text-sm"
            />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">{t('step1.email')}</label>
            <input 
              type="email" 
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder={t('step1.email.ph')}
              className="soft-input font-sans text-sm"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">{t('step1.address')}</label>
            <input 
              type="text" 
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder={t('step1.address.ph')}
              className="soft-input font-sans text-sm"
            />
            {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Birth date */}
          <div>
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">{t('step1.dob')}</label>
            <input 
              type="date" 
              value={data.birthDate}
              onChange={(e) => onChange({ birthDate: e.target.value })}
              className="soft-input font-sans text-sm"
            />
            {errors.birthDate && <p className="text-red-600 text-xs mt-1">{errors.birthDate}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">{t('step1.age')}</label>
            <input 
              type="number" 
              value={data.age}
              onChange={(e) => onChange({ age: e.target.value })}
              placeholder={t('step1.age.ph')}
              className="soft-input font-sans text-sm"
            />
            {errors.age && <p className="text-red-600 text-xs mt-1">{errors.age}</p>}
          </div>

        </div>

        {/* Decorative floral Separator */}
        <div className="py-6 flex items-center gap-4">
          <div className="h-[1px] flex-grow bg-primary/10"></div>
          <Sparkles className="w-5 h-5 text-sage-light rotate-12" />
          <div className="h-[1px] flex-grow bg-primary/10"></div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-primary/5">
          <h3 className="font-sans text-sm font-bold text-primary mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary" />
            {t('step1.emergency')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="font-sans text-xs font-semibold text-tertiary block mb-1">{t('step1.emergencyName')}</label>
              <input 
                type="text" 
                value={data.emergencyName}
                onChange={(e) => onChange({ emergencyName: e.target.value })}
                placeholder={t('step1.emergencyName.ph')}
                className="soft-input font-sans text-sm bg-white/70"
              />
              {errors.emergencyName && <p className="text-red-600 text-xs mt-1">{errors.emergencyName}</p>}
            </div>
            <div>
              <label className="font-sans text-xs font-semibold text-tertiary block mb-1">{t('step1.emergencyPhone')}</label>
              <input 
                type="tel" 
                value={data.emergencyPhone}
                onChange={(e) => onChange({ emergencyPhone: e.target.value })}
                placeholder={t('step1.emergencyPhone.ph')}
                className="soft-input font-sans text-sm bg-white/70"
              />
              {errors.emergencyPhone && <p className="text-red-600 text-xs mt-1">{errors.emergencyPhone}</p>}
            </div>
          </div>
        </div>

        {/* Política / Confirmación / Contacto */}
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

        {/* Action buttons */}

        <div className="pt-6 flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-primary/10">
          <button 
            type="button"
            onClick={onSaveDraft}
            className="w-full sm:w-auto px-6 py-4 rounded-full border border-secondary text-secondary font-sans text-sm font-medium hover:bg-secondary/5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            {draftSaved ? (
              <>
                <Check className="w-4 h-4 text-secondary" />
                {t('status.saved')}
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-secondary" />
                {t('form.save')}
              </>
            )}
          </button>
          <button 
            type="submit"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-sans text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 shadow-md shadow-primary/15 cursor-pointer"
          >
            {t('form.next')}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
