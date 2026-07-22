/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, HeartPulse, Car, Sparkles, Bed } from 'lucide-react';
import { RegistrationData } from '../types';
import {
  TRANSPORT_OPTIONS,
  PRAYER_OPTIONS,
  EXPECTATION_OPTIONS,
  REFERRAL_OPTIONS
} from '../data';
import { Question, RadioOption, CheckOption, StepProgress } from './FormControls';
import { motion } from 'motion/react';

interface Step4Props {
  data: RegistrationData;
  onChange: (updated: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
  key?: string;
}

export default function Step4Experience({ data, onChange, onNext, onBack }: Step4Props) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const toggleExpectation = (option: string) => {
    const next = data.expectations.includes(option)
      ? data.expectations.filter((o) => o !== option)
      : [...data.expectations, option];

    onChange({ expectations: next, ...(next.includes('Otro') ? {} : { expectationsOther: '' }) });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { [key: string]: string } = {};

    if (!data.medicalNotes.trim()) {
      next.medicalNotes =
        'Contanos si tenés alguna condición médica a tener en cuenta. Si no tenés ninguna, escribí "Ninguna".';
    }

    if (!data.transport) {
      next.transport = 'Seleccioná una opción de transporte.';
    }

    if (!data.prayerSession) {
      next.prayerSession = 'Seleccioná una opción.';
    } else if (data.prayerSession === 'Otros' && !data.prayerOther.trim()) {
      next.prayerSession = 'Contanos brevemente tu preferencia.';
    }

    if (data.expectations.length === 0) {
      next.expectations = 'Seleccioná al menos una expectativa.';
    } else if (data.expectations.includes('Otro') && !data.expectationsOther.trim()) {
      next.expectations = 'Especificá tu respuesta en el campo "Otro".';
    }

    if (data.referralSource === 'Otro (especificar)' && !data.referralOther.trim()) {
      next.referralSource = 'Especificá cómo te enteraste del retiro.';
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      document.querySelector('[data-error="true"]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }

    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-3xl mx-auto text-left"
    >
      <StepProgress step={4} label="Tu Experiencia en el Retiro" />

      <form onSubmit={handleNext} className="space-y-8">
        {/* Q15 — Condición médica y habitación */}
        <div
          data-error={Boolean(errors.medicalNotes)}
          className="bg-white p-6 md:p-8 rounded-2xl border border-primary/5 shadow-sm space-y-8"
        >
          <Question
            title="¿Tenés algún requisito o condición médica que debamos tener en cuenta?"
            description={
              <span className="flex items-start gap-2">
                <HeartPulse className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                Esta información es confidencial y nos permite acompañarte mejor durante el retiro.
              </span>
            }
            error={errors.medicalNotes}
          >
            <textarea
              value={data.medicalNotes}
              onChange={(e) => onChange({ medicalNotes: e.target.value })}
              rows={4}
              placeholder="Ej. medicación, movilidad reducida, alergias, condiciones a tener en cuenta... (si no tenés ninguna, escribí «Ninguna»)"
              className="soft-input font-sans text-sm resize-none rounded-t-md"
            />
          </Question>

          <Question
            title="¿Preferís compartir habitación con alguna amiga o familiar que asista al retiro?"
            required={false}
            description={
              <span className="flex items-start gap-2">
                <Bed className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                Las habitaciones son compartidas (2 personas por habitación). Haremos lo posible por
                respetar tu preferencia según disponibilidad.
              </span>
            }
          >
            <input
              type="text"
              value={data.roommatePreference}
              onChange={(e) => onChange({ roommatePreference: e.target.value })}
              placeholder="Nombre y apellido de la persona (opcional)"
              className="soft-input font-sans text-sm"
            />
          </Question>
        </div>

        {/* Q16 — Transporte */}
        <div
          data-error={Boolean(errors.transport)}
          className="bg-white p-6 md:p-8 rounded-2xl border border-primary/5 shadow-sm"
        >
          <Question
            title="Transporte al retiro"
            description={
              <span className="flex items-start gap-2">
                <Car className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                El retiro se realizará en un lugar al que no llega transporte público directo. Por
                favor, seleccioná una opción.
              </span>
            }
            error={errors.transport}
          >
            <div className="space-y-3">
              {TRANSPORT_OPTIONS.map((option) => (
                <RadioOption
                  key={option}
                  name="transport"
                  value={option}
                  checked={data.transport === option}
                  onSelect={(value) => onChange({ transport: value })}
                  label={option}
                />
              ))}
            </div>
          </Question>
        </div>

        {/* Q17 — Healing Session */}
        <div
          data-error={Boolean(errors.prayerSession)}
          className="bg-white p-6 md:p-8 rounded-2xl border border-primary/5 shadow-sm"
        >
          <Question
            title="¿Te gustaría participar en un tiempo especial de oración durante el retiro?"
            description="Durante el retiro habrá un espacio de ministración y oración personal (Healing Room), acompañado por el equipo de intercesión."
            error={errors.prayerSession}
          >
            <div className="space-y-3">
              {PRAYER_OPTIONS.map((option) => (
                <RadioOption
                  key={option}
                  name="prayerSession"
                  value={option}
                  checked={data.prayerSession === option}
                  onSelect={(value) => onChange({ prayerSession: value, prayerOther: '' })}
                  label={option}
                />
              ))}
            </div>

            {data.prayerSession === 'Otros' && (
              <input
                type="text"
                value={data.prayerOther}
                onChange={(e) => onChange({ prayerOther: e.target.value })}
                placeholder="Contanos tu preferencia"
                className="soft-input font-sans text-sm mt-4"
              />
            )}
          </Question>
        </div>

        {/* Q18 — Expectativas */}
        <div
          data-error={Boolean(errors.expectations)}
          className="bg-white p-6 md:p-8 rounded-2xl border border-primary/5 shadow-sm"
        >
          <Question
            title="¿Qué esperás recibir o experimentar en este retiro?"
            description={
              <span className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                Podés seleccionar todas las opciones que resuenen con vos.
              </span>
            }
            error={errors.expectations}
          >
            <div className="space-y-3">
              {EXPECTATION_OPTIONS.map((option) => (
                <CheckOption
                  key={option}
                  checked={data.expectations.includes(option)}
                  onToggle={() => toggleExpectation(option)}
                  label={option}
                />
              ))}
            </div>

            {data.expectations.includes('Otro') && (
              <textarea
                value={data.expectationsOther}
                onChange={(e) => onChange({ expectationsOther: e.target.value })}
                rows={3}
                placeholder="Contanos qué esperás de este retiro..."
                className="soft-input font-sans text-sm resize-none mt-4 rounded-t-md"
              />
            )}
          </Question>
        </div>

        {/* Q19 — Cómo te enteraste (opcional) */}
        <div
          data-error={Boolean(errors.referralSource)}
          className="bg-white p-6 md:p-8 rounded-2xl border border-primary/5 shadow-sm"
        >
          <Question
            title="¿Cómo te enteraste de Alegría Retreat 2026?"
            required={false}
            description="Esta pregunta es opcional, pero nos ayuda muchísimo a seguir llegando a más mujeres."
            error={errors.referralSource}
          >
            <div className="space-y-3">
              {REFERRAL_OPTIONS.map((option) => (
                <RadioOption
                  key={option}
                  name="referralSource"
                  value={option}
                  checked={data.referralSource === option}
                  onSelect={(value) => onChange({ referralSource: value, referralOther: '' })}
                  label={option}
                />
              ))}
            </div>

            {data.referralSource === 'Otro (especificar)' && (
              <input
                type="text"
                value={data.referralOther}
                onChange={(e) => onChange({ referralOther: e.target.value })}
                placeholder="Especificá cómo te enteraste"
                className="soft-input font-sans text-sm mt-4"
              />
            )}
          </Question>
        </div>

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
    </motion.div>
  );
}
