/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Sparkles, Check, Bookmark } from 'lucide-react';
import { RegistrationData } from '../types';
import { motion } from 'motion/react';

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!data.fullName.trim()) newErrors.fullName = 'El nombre y apellido es obligatorio.';
    if (!data.phone.trim()) newErrors.phone = 'El teléfono de contacto es obligatorio.';
    
    // Email regex
    if (!data.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Introduce un correo electrónico válido.';
    }

    if (!data.address.trim()) newErrors.address = 'La dirección completa es obligatoria.';
    if (!data.birthDate) newErrors.birthDate = 'La fecha de nacimiento es obligatoria.';
    if (!data.age || parseInt(data.age) <= 0) newErrors.age = 'Introduce una edad válida.';
    
    if (!data.emergencyName.trim()) newErrors.emergencyName = 'El nombre del contacto de emergencia es obligatorio.';
    if (!data.emergencyPhone.trim()) newErrors.emergencyPhone = 'El teléfono de emergencia es obligatorio.';

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
          <span className="font-sans text-xs font-bold text-primary uppercase tracking-widest">Paso 1 de 5</span>
          <span className="font-sans text-xs font-semibold text-on-surface-variant">Información Personal</span>
        </div>
        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/5 transition-all duration-700 ease-out"></div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-10 text-left">
        <h2 className="font-display text-4xl text-primary mb-3">Cuéntanos sobre ti</h2>
        <p className="font-sans text-sm text-tertiary leading-relaxed">
          Tu viaje de renovación comienza aquí. Por favor, completa tus datos para asegurar tu lugar en el retiro.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">Nombre y Apellidos</label>
            <input 
              type="text" 
              value={data.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder="Tu nombre completo"
              className="soft-input font-sans text-sm"
            />
            {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">Número de teléfono</label>
            <input 
              type="tel" 
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+34 000 000 000"
              className="soft-input font-sans text-sm"
            />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">Email</label>
            <input 
              type="email" 
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="correo@ejemplo.com"
              className="soft-input font-sans text-sm"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">Dirección</label>
            <input 
              type="text" 
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Calle, número, ciudad y código postal"
              className="soft-input font-sans text-sm"
            />
            {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Birth date */}
          <div>
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">Fecha de nacimiento</label>
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
            <label className="font-sans text-xs font-semibold text-tertiary block mb-1">Edad</label>
            <input 
              type="number" 
              value={data.age}
              onChange={(e) => onChange({ age: e.target.value })}
              placeholder="Ej. 35"
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
            Contacto de Emergencia
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="font-sans text-xs font-semibold text-tertiary block mb-1">Nombre del contacto</label>
              <input 
                type="text" 
                value={data.emergencyName}
                onChange={(e) => onChange({ emergencyName: e.target.value })}
                placeholder="Nombre completo"
                className="soft-input font-sans text-sm bg-white/70"
              />
              {errors.emergencyName && <p className="text-red-600 text-xs mt-1">{errors.emergencyName}</p>}
            </div>
            <div>
              <label className="font-sans text-xs font-semibold text-tertiary block mb-1">Teléfono de emergencia</label>
              <input 
                type="tel" 
                value={data.emergencyPhone}
                onChange={(e) => onChange({ emergencyPhone: e.target.value })}
                placeholder="+34 000 000 000"
                className="soft-input font-sans text-sm bg-white/70"
              />
              {errors.emergencyPhone && <p className="text-red-600 text-xs mt-1">{errors.emergencyPhone}</p>}
            </div>
          </div>
        </div>

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
                Borrador guardado
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-secondary" />
                Guardar Borrador
              </>
            )}
          </button>
          <button 
            type="submit"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-sans text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 shadow-md shadow-primary/15 cursor-pointer"
          >
            Siguiente Paso
          </button>
        </div>
      </form>
    </motion.div>
  );
}
