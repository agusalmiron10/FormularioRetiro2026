/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Languages, Users, Info, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { RegistrationData } from '../types';
import { TRAVEL_ORIGINS, DIETARY_OPTIONS, IMAGE_URLS } from '../data';
import { Question, RadioOption, CheckOption, StepProgress } from './FormControls';
import { motion } from 'motion/react';

interface Step2Props {
  data: RegistrationData;
  onChange: (updated: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
  key?: string;
}

export default function Step2Preferences({ data, onChange, onNext, onBack }: Step2Props) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const toggleDietary = (option: string) => {
    const isSelected = data.dietary.includes(option);
    let next: string[];

    if (isSelected) {
      next = data.dietary.filter((o) => o !== option);
    } else if (option === 'Ninguna') {
      // "Ninguna" es excluyente: descarta cualquier otra selección.
      next = ['Ninguna'];
    } else {
      next = [...data.dietary.filter((o) => o !== 'Ninguna'), option];
    }

    onChange({ dietary: next, ...(next.includes('Otro') ? {} : { otherDietary: '' }) });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { [key: string]: string } = {};

    if (!data.travelOrigin) {
      next.travelOrigin = 'Seleccioná desde dónde viajarás al retiro.';
    } else if (
      (data.travelOrigin === 'Otros' || data.travelOrigin === 'Desde otro país') &&
      !data.travelOriginOther.trim()
    ) {
      next.travelOrigin = 'Indicá la ciudad o el país desde el que viajás.';
    }

    if (data.dietary.length === 0) {
      next.dietary = 'Seleccioná al menos una opción. Si no tenés requerimientos, elegí "Ninguna".';
    } else if (data.dietary.includes('Otro') && !data.otherDietary.trim()) {
      next.dietary = 'Especificá tu requerimiento alimenticio en el campo "Otro".';
    }

    setErrors(next);
    if (Object.keys(next).length === 0) onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-5xl mx-auto"
    >
      <StepProgress step={2} label="Preferencias y Alimentación" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Formulario */}
        <div className="md:col-span-8 bg-white rounded-2xl p-6 md:p-8 border border-primary/5 shadow-sm text-left">
          <form onSubmit={handleNext} className="space-y-10">
            {/* Q10 — Idioma de preferencia */}
            <Question title="Idioma de preferencia">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'es', label: 'Español', Icon: Globe },
                  { value: 'en', label: 'Inglés', Icon: Languages },
                  { value: 'both', label: 'Ambos', Icon: Users }
                ].map(({ value, label, Icon }) => (
                  <label key={value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="language"
                      checked={data.language === value}
                      onChange={() => onChange({ language: value as RegistrationData['language'] })}
                      className="peer sr-only"
                    />
                    <div className="p-4 border-2 border-outline-variant/40 rounded-xl transition-all hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-primary/5 flex flex-col items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-sans text-sm font-semibold text-on-surface">{label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </Question>

            {/* Q11 — Origen del viaje */}
            <Question
              title="¿Desde qué ciudad o país viajarás al retiro?"
              error={errors.travelOrigin}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRAVEL_ORIGINS.map((city) => (
                  <RadioOption
                    key={city}
                    name="travelOrigin"
                    value={city}
                    checked={data.travelOrigin === city}
                    onSelect={(value) => onChange({ travelOrigin: value, travelOriginOther: '' })}
                    label={city}
                  />
                ))}
              </div>

              {(data.travelOrigin === 'Otros' || data.travelOrigin === 'Desde otro país') && (
                <input
                  type="text"
                  value={data.travelOriginOther}
                  onChange={(e) => onChange({ travelOriginOther: e.target.value })}
                  placeholder="Especificá tu ciudad o país"
                  className="soft-input font-sans text-sm mt-4"
                />
              )}
            </Question>

            {/* Q12 — Requerimientos alimenticios */}
            <Question
              title="¿Tenés algún requerimiento alimenticio especial o alergia?"
              description={
                <>
                  <p>
                    Durante el retiro se ofrecerán opciones de dietas especiales únicamente para las
                    comidas principales. Por favor indicanos tus necesidades con anticipación para que
                    podamos coordinarlas con el lugar.
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-primary font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-secondary" />
                    Importante: las notificaciones sobre requerimientos alimenticios serán recibidas
                    hasta el 1 de septiembre de 2026.
                  </p>
                </>
              }
              error={errors.dietary}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DIETARY_OPTIONS.map((option) => (
                  <CheckOption
                    key={option}
                    checked={data.dietary.includes(option)}
                    onToggle={() => toggleDietary(option)}
                    label={option}
                  />
                ))}
              </div>

              {data.dietary.includes('Otro') && (
                <textarea
                  value={data.otherDietary}
                  onChange={(e) => onChange({ otherDietary: e.target.value })}
                  rows={3}
                  placeholder="Especificá tu requerimiento o alergia..."
                  className="soft-input font-sans text-sm resize-none mt-4 rounded-t-md"
                />
              )}
            </Question>

            {/* Navegación */}
            <div className="pt-6 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 border-t border-primary/10">
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
                className="w-full sm:w-auto bg-primary text-white font-sans text-sm font-semibold px-10 py-3 rounded-full hover:bg-primary-container hover:text-on-primary-container hover:shadow-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <aside className="md:col-span-4 space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-primary/5 bg-white text-left">
            <div
              className="h-44 relative bg-cover bg-center"
              style={{ backgroundImage: `url('${IMAGE_URLS.wisemansFerryMini}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-white">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-85 block">
                    Ubicación del Retiro
                  </span>
                  <h3 className="font-display text-xl">Wisemans Retreat, NSW</h3>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="font-sans text-xs md:text-sm text-on-surface-variant italic leading-relaxed">
                11 al 13 de septiembre de 2026. Check-in viernes 5:00 pm · Check-out domingo 3:00 pm.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-wider">
                Nota Importante
              </h4>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Toda la información proporcionada es confidencial y será utilizada exclusivamente para
              personalizar tu experiencia y garantizar tu seguridad durante el retiro.
            </p>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
