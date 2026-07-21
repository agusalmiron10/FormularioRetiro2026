/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Languages, Users, MapPin, Info, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { RegistrationData } from '../types';
import { CITIES, IMAGE_URLS } from '../data';
import { motion } from 'motion/react';

interface Step2Props {
  data: RegistrationData;
  onChange: (updated: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
  key?: string;
}

export default function Step2Preferences({ data, onChange, onNext, onBack }: Step2Props) {
  const [error, setError] = useState('');

  const handleCheckboxChange = (key: keyof RegistrationData['dietaryRequirements']) => {
    onChange({
      dietaryRequirements: {
        ...data.dietaryRequirements,
        [key]: !data.dietaryRequirements[key]
      }
    });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.travelOrigin) {
      setError('Por favor, selecciona tu origen de viaje.');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto"
    >
      {/* Progress Header */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-2">
          <span className="font-sans text-xs font-bold text-primary uppercase tracking-widest">Paso 2 de 5</span>
          <span className="font-sans text-xs font-semibold text-tertiary">Preferencias y Salud</span>
        </div>
        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary w-2/5 transition-all duration-700 ease-out"></div>
        </div>
      </div>

      {/* Grid Layout: Form Left, Sidebar Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Form Card (8 cols) */}
        <div className="md:col-span-8 bg-white rounded-2xl p-6 md:p-8 border border-primary/5 shadow-sm text-left">
          <form onSubmit={handleNext} className="space-y-8">
            
            {/* Language Preference */}
            <section>
              <h2 className="font-display text-2xl text-primary mb-2">Idioma de preferencia</h2>
              <p className="font-sans text-xs text-on-surface-variant mb-4">
                Seleccione el idioma en el que desea recibir los materiales del retiro.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Spanish Option */}
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="language" 
                    checked={data.language === 'es'} 
                    onChange={() => onChange({ language: 'es' })}
                    className="peer sr-only" 
                  />
                  <div className="p-4 border-2 border-outline-variant rounded-xl transition-all hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-primary/5 flex flex-col items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="font-sans text-sm font-semibold text-on-surface">Español</span>
                  </div>
                </label>

                {/* English Option */}
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="language" 
                    checked={data.language === 'en'} 
                    onChange={() => onChange({ language: 'en' })}
                    className="peer sr-only" 
                  />
                  <div className="p-4 border-2 border-outline-variant rounded-xl transition-all hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-primary/5 flex flex-col items-center gap-2">
                    <Languages className="w-5 h-5 text-primary" />
                    <span className="font-sans text-sm font-semibold text-on-surface">Inglés</span>
                  </div>
                </label>

                {/* Both Option */}
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="language" 
                    checked={data.language === 'both'} 
                    onChange={() => onChange({ language: 'both' })}
                    className="peer sr-only" 
                  />
                  <div className="p-4 border-2 border-outline-variant rounded-xl transition-all hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-primary/5 flex flex-col items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-sans text-sm font-semibold text-on-surface">Ambos</span>
                  </div>
                </label>
              </div>
            </section>

            {/* Travel Origin */}
            <section>
              <h2 className="font-display text-2xl text-primary mb-2">Origen del viaje</h2>
              <div className="relative mt-4">
                <label className="block font-sans text-xs font-semibold text-tertiary mb-1">
                  Ciudad / País de origen
                </label>
                <select 
                  value={data.travelOrigin}
                  onChange={(e) => onChange({ travelOrigin: e.target.value })}
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 px-3 font-sans text-sm text-on-surface outline-none appearance-none cursor-pointer rounded-t-md"
                >
                  <option value="" disabled>Seleccione su ciudad</option>
                  {CITIES.map((city, i) => (
                    <option key={i} value={city}>{city}</option>
                  ))}
                </select>
                {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
              </div>
            </section>

            {/* Dietary Requirements */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-display text-2xl text-primary">Requerimientos dietarios</h2>
              </div>
              <p className="font-sans text-xs text-on-surface-variant mb-6">
                Nos preocupamos por tu bienestar. Por favor infórmanos sobre cualquier necesidad alimentaria especial.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                {/* Vegetariana */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      checked={data.dietaryRequirements.vegetariana}
                      onChange={() => handleCheckboxChange('vegetariana')}
                      className="peer h-5 w-5 rounded-full border-2 border-outline-variant checked:bg-primary checked:border-primary focus:ring-primary/20 appearance-none transition-all"
                    />
                    <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="font-sans text-sm text-on-surface group-hover:text-primary transition-colors">
                    Vegetariana
                  </span>
                </label>

                {/* Vegana */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      checked={data.dietaryRequirements.vegana}
                      onChange={() => handleCheckboxChange('vegana')}
                      className="peer h-5 w-5 rounded-full border-2 border-outline-variant checked:bg-primary checked:border-primary focus:ring-primary/20 appearance-none transition-all"
                    />
                    <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="font-sans text-sm text-on-surface group-hover:text-primary transition-colors">
                    Vegana
                  </span>
                </label>

                {/* Celíaca */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      checked={data.dietaryRequirements.celiaca}
                      onChange={() => handleCheckboxChange('celiaca')}
                      className="peer h-5 w-5 rounded-full border-2 border-outline-variant checked:bg-primary checked:border-primary focus:ring-primary/20 appearance-none transition-all"
                    />
                    <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="font-sans text-sm text-on-surface group-hover:text-primary transition-colors">
                    Celíaca
                  </span>
                </label>

                {/* Sin Lácteos */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      checked={data.dietaryRequirements.sinLacteos}
                      onChange={() => handleCheckboxChange('sinLacteos')}
                      className="peer h-5 w-5 rounded-full border-2 border-outline-variant checked:bg-primary checked:border-primary focus:ring-primary/20 appearance-none transition-all"
                    />
                    <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="font-sans text-sm text-on-surface group-hover:text-primary transition-colors">
                    Sin Lácteos
                  </span>
                </label>

                {/* Sin Frutos Secos */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      checked={data.dietaryRequirements.sinFrutosSecos}
                      onChange={() => handleCheckboxChange('sinFrutosSecos')}
                      className="peer h-5 w-5 rounded-full border-2 border-outline-variant checked:bg-primary checked:border-primary focus:ring-primary/20 appearance-none transition-all"
                    />
                    <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="font-sans text-sm text-on-surface group-hover:text-primary transition-colors">
                    Sin Frutos Secos
                  </span>
                </label>
              </div>

              <div className="mt-6">
                <label className="block font-sans text-xs font-semibold text-tertiary mb-2">
                  Otros requerimientos o alergias graves
                </label>
                <textarea 
                  value={data.otherDietary}
                  onChange={(e) => onChange({ otherDietary: e.target.value })}
                  rows={3}
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all py-3 px-3 font-sans text-sm text-on-surface resize-none outline-none rounded-t-md"
                  placeholder="Por favor describa detalladamente cualquier otra alergia o preferencia..."
                />
              </div>
            </section>

            {/* Navigation Buttons */}
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
                className="w-full sm:w-auto bg-primary text-white font-sans text-sm font-semibold px-10 py-3 rounded-full hover:bg-primary-container hover:text-on-primary-container hover:shadow-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer animate-pulse-once"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>

        {/* Sidebar Context (4 cols) */}
        <aside className="md:col-span-4 space-y-6">
          {/* Location Preview Card */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-primary/5 bg-white text-left">
            <div className="h-44 relative bg-cover bg-center" style={{ backgroundImage: `url('${IMAGE_URLS.wisemansFerryMini}')` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-white">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-85 block">
                    Ubicación del Retiro
                  </span>
                  <h3 className="font-display text-xl">Wisemans Ferry, NSW</h3>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="font-sans text-xs md:text-sm text-on-surface-variant italic leading-relaxed">
                "Un lugar para reconectar con tu esencia y la naturaleza en un entorno de paz absoluta."
              </p>
            </div>
          </div>

          {/* Info Important Card */}
          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-wider">Nota Importante</h4>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Toda la información proporcionada es confidencial y será utilizada exclusivamente para personalizar tu experiencia y garantizar tu seguridad durante el retiro.
            </p>
          </div>
        </aside>

      </div>
    </motion.div>
  );
}
