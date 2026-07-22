/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check } from 'lucide-react';

interface QuestionProps {
  title: string;
  description?: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

/** Bloque de pregunta con título, ayuda opcional y mensaje de error. */
export function Question({ title, description, required = true, error, children }: QuestionProps) {
  return (
    <section>
      <h2 className="font-display text-2xl text-primary mb-1">
        {title}
        {required && <span className="text-secondary font-sans text-base align-super ml-1">*</span>}
      </h2>
      {description && (
        <div className="font-sans text-xs text-on-surface-variant mb-4 leading-relaxed">{description}</div>
      )}
      <div className={description ? '' : 'mt-4'}>{children}</div>
      {error && (
        <p className="text-red-600 text-xs font-semibold mt-3 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
          {error}
        </p>
      )}
    </section>
  );
}

interface RadioOptionProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  label: string;
  hint?: string;
  key?: string;
}

/** Opción de selección única, estilo tarjeta. */
export function RadioOption({ name, value, checked, onSelect, label, hint }: RadioOptionProps) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
        checked
          ? 'border-primary bg-primary/5'
          : 'border-outline-variant/40 hover:bg-surface-container-low hover:border-primary/30'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="sr-only"
      />
      <span
        className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          checked ? 'border-primary' : 'border-outline-variant'
        }`}
      >
        {checked && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </span>
      <span className="min-w-0">
        <span className="block font-sans text-sm text-on-surface">{label}</span>
        {hint && <span className="block font-sans text-xs text-on-surface-variant mt-0.5">{hint}</span>}
      </span>
    </label>
  );
}

interface CheckOptionProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  key?: string;
}

/** Opción de selección múltiple. */
export function CheckOption({ checked, onToggle, label }: CheckOptionProps) {
  return (
    <label
      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
        checked
          ? 'border-primary bg-primary/5'
          : 'border-outline-variant/40 hover:bg-surface-container-low hover:border-primary/30'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <span
        className={`w-5 h-5 mt-0.5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          checked ? 'bg-primary border-primary text-white' : 'border-outline-variant'
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </span>
      <span className="font-sans text-sm text-on-surface min-w-0">{label}</span>
    </label>
  );
}

interface ProgressProps {
  step: number;
  label: string;
}

/** Indicador de progreso del asistente (5 pasos). */
export function StepProgress({ step, label }: ProgressProps) {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-end mb-2">
        <span className="font-sans text-xs font-bold text-primary uppercase tracking-widest">
          Paso {step} de 5
        </span>
        <span className="font-sans text-xs font-semibold text-tertiary">{label}</span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
