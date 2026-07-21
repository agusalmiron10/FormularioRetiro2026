/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Bed, Check, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { RegistrationData } from '../types';
import { WORKSHOPS } from '../data';
import { motion } from 'motion/react';

interface Step4Props {
  data: RegistrationData;
  onChange: (updated: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
  key?: string;
}

export default function Step4Workshops({ data, onChange, onNext, onBack }: Step4Props) {
  const [error, setError] = useState('');

  const handleWorkshopToggle = (workshopName: string) => {
    const isSelected = data.selectedWorkshops.includes(workshopName);
    let updated: string[] = [];

    if (isSelected) {
      updated = data.selectedWorkshops.filter(name => name !== workshopName);
      setError('');
    } else {
      if (data.selectedWorkshops.length >= 2) {
        setError('Puedes seleccionar un máximo de 2 talleres creativos.');
        return;
      }
      updated = [...data.selectedWorkshops, workshopName];
      setError('');
    }

    onChange({ selectedWorkshops: updated });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.selectedWorkshops.length === 0) {
      setError('Por favor, selecciona al menos 1 taller de tu interés.');
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
      className="max-w-4xl mx-auto text-left"
    >
      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="font-sans text-xs font-bold text-primary uppercase tracking-widest">Paso 4 de 5</span>
          <span className="font-sans text-xs font-semibold text-tertiary">Alojamiento y Talleres</span>
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-700 ease-out w-4/5"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Content (8 cols) */}
        <div className="md:col-span-8 bg-white p-6 md:p-8 rounded-2xl border border-primary/5 shadow-sm space-y-8">
          <form onSubmit={handleNext} className="space-y-8">
            
            {/* Room Type */}
            <section>
              <h2 className="font-display text-2xl text-primary mb-2 flex items-center gap-2">
                <Bed className="w-5 h-5 text-secondary" />
                Tipo de Alojamiento
              </h2>
              <p className="font-sans text-xs text-on-surface-variant mb-4">
                Elige tu opción de descanso. El precio base cubre la habitación doble compartida.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Double Shared Room */}
                <label className="relative cursor-pointer block">
                  <input 
                    type="radio" 
                    name="roomType" 
                    checked={data.roomType === 'shared'} 
                    onChange={() => onChange({ roomType: 'shared' })}
                    className="sr-only peer" 
                  />
                  <div className="p-5 border-2 border-outline-variant/40 rounded-xl transition-all hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-[#FFF9F0] h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-sans text-sm font-bold text-primary">Habitación Doble</h3>
                      <p className="font-sans text-xs text-on-surface-variant mt-1">
                        Compartida con otra participante. Ideal para hacer comunidad.
                      </p>
                    </div>
                    <p className="font-sans text-xs font-semibold text-primary mt-4 bg-primary/10 px-2.5 py-1 rounded-full self-start">
                      Incluido en precio base
                    </p>
                  </div>
                </label>

                {/* Single Private Room */}
                <label className="relative cursor-pointer block">
                  <input 
                    type="radio" 
                    name="roomType" 
                    checked={data.roomType === 'private'} 
                    onChange={() => onChange({ roomType: 'private' })}
                    className="sr-only peer" 
                  />
                  <div className="p-5 border-2 border-outline-variant/40 rounded-xl transition-all hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-[#FFF9F0] h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-sans text-sm font-bold text-primary">Habitación Individual</h3>
                      <p className="font-sans text-xs text-on-surface-variant mt-1">
                        Habitación privada para mayor silencio y espacio personal de oración.
                      </p>
                    </div>
                    <p className="font-sans text-xs font-semibold text-secondary mt-4 bg-secondary/10 px-2.5 py-1 rounded-full self-start">
                      +$100 AUD Adicional
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* Workshops Selection */}
            <section>
              <h2 className="font-display text-2xl text-primary mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                Talleres de Renovación
              </h2>
              <p className="font-sans text-xs text-on-surface-variant mb-4">
                Por favor, selecciona <strong>hasta 2 talleres</strong> creativos y litúrgicos en los que deseas sumergirte durante el retiro:
              </p>

              {error && <p className="text-red-600 text-xs font-semibold mb-4 bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WORKSHOPS.map((workshop) => {
                  const isSelected = data.selectedWorkshops.includes(workshop.name);
                  return (
                    <div 
                      key={workshop.id}
                      onClick={() => handleWorkshopToggle(workshop.name)}
                      className={`p-5 border-2 rounded-xl transition-all cursor-pointer flex justify-between items-start ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-outline-variant/40 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-sans text-sm font-bold text-on-surface">{workshop.name}</h4>
                        <p className="font-sans text-xs text-on-surface-variant leading-relaxed pr-2">
                          {workshop.description}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary border-primary text-white' : 'border-outline-variant'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Navigation buttons */}
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

        {/* Sidebar Info (4 cols) */}
        <aside className="md:col-span-4 space-y-6">
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <HelpCircle className="w-5 h-5" />
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider">Talleres e Inclusión</h4>
            </div>
            <div className="space-y-3 font-sans text-xs text-on-surface-variant leading-relaxed text-left">
              <p>
                <strong>¿Todos los talleres están incluidos?</strong> Sí, todos los talleres, materiales de arte y cancioneros están completamente incluidos dentro del precio de tu entrada.
              </p>
              <p>
                <strong>¿Puedo cambiar de opinión?</strong> Al llegar a Wisemans Ferry podrás ajustar tus opciones de talleres según la disponibilidad de cupos en los salones.
              </p>
            </div>
          </div>
        </aside>
      </div>

    </motion.div>
  );
}
