/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, Check, ShieldAlert, ChevronLeft } from 'lucide-react';
import { RegistrationData } from '../types';
import { IMAGE_URLS } from '../data';
import { motion } from 'motion/react';

interface Step5Props {
  data: RegistrationData;
  onBack: () => void;
  onSubmit: () => void;
  key?: string;
}

export default function Step5Finalize({ data, onBack, onSubmit }: Step5Props) {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeComms, setAgreeComms] = useState(false);
  const [error, setError] = useState('');

  // Calculate pricing
  const basePrice = data.pricingTier === 'early' ? 450 : 480;
  const roomAddon = data.roomType === 'private' ? 100 : 0;
  const totalPrice = basePrice + roomAddon;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !agreeComms) {
      setError('Por favor, acepta los términos de participación y el envío de comunicaciones.');
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
      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-2">
          <span className="font-sans text-xs font-bold text-primary uppercase tracking-widest">Paso 5 de 5</span>
          <span className="font-sans text-xs font-semibold text-tertiary">Finalizar Registro</span>
        </div>
        <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-full transition-all duration-700 ease-out"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="registration-form-container">
        
        {/* Left Column: Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Summary Card */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
            <h2 className="font-display text-2xl text-primary mb-2">Resumen de Registro</h2>
            <p className="font-sans text-xs text-on-surface-variant mb-6">
              Por favor, revisa que toda la información sea correcta antes de enviar tu solicitud.
            </p>

            <div className="space-y-4 font-sans text-sm">
              <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                <span className="text-tertiary text-xs font-semibold uppercase tracking-wide">Participante</span>
                <span className="text-on-surface font-semibold">{data.fullName || 'No especificado'}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                <span className="text-tertiary text-xs font-semibold uppercase tracking-wide">Alojamiento</span>
                <span className="text-on-surface font-semibold">
                  {data.roomType === 'private' ? 'Habitación Individual (Privada)' : 'Habitación Doble (Compartida)'}
                </span>
              </div>
              
              <div className="flex justify-between items-start py-3 border-b border-outline-variant/10">
                <span className="text-tertiary text-xs font-semibold uppercase tracking-wide pt-0.5">Talleres seleccionados</span>
                <div className="text-right">
                  {data.selectedWorkshops.length > 0 ? (
                    data.selectedWorkshops.map((name, i) => (
                      <p key={i} className="text-on-surface font-semibold">{name}</p>
                    ))
                  ) : (
                    <p className="text-on-surface-variant italic">Ninguno seleccionado</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-tertiary text-xs font-semibold uppercase tracking-wide">Inversión Total</span>
                <div className="text-right">
                  <span className="font-display text-2xl text-primary font-medium">
                    ${totalPrice.toFixed(2)} AUD
                  </span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    (Base: ${basePrice} AUD {roomAddon > 0 && `+ Individual: $${roomAddon} AUD`})
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Terms & Conditions Section */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
            <h3 className="font-sans text-sm font-bold text-tertiary mb-4 uppercase tracking-wider">
              Términos y Condiciones
            </h3>
            
            <div className="max-h-40 overflow-y-auto p-4 bg-[#FAF9F6] border border-outline-variant/20 rounded-xl mb-6 text-xs text-on-surface-variant leading-relaxed space-y-3">
              <p>
                Al registrarse para el retiro "Renueva 2026", usted acepta que Alegría Retreats no se hace responsable de pérdidas personales o lesiones físicas durante el evento en Wisemans Ferry.
              </p>
              <p>
                <strong>Política de Cancelación:</strong> Se reembolsará el 100% si se cancela 60 días antes. El 50% si se cancela hasta 30 días antes. No hay reembolsos con menos de 15 días de antelación debido a compromisos previamente adquiridos con las cabañas.
              </p>
              <p>
                <strong>Comunidad Cristiana:</strong> Autorizo el uso de fotografías y grabaciones tomadas durante las actividades del retiro con fines únicamente inspiracionales y de difusión de futuros retiros en los canales de Alegría Retreats.
              </p>
            </div>

            {error && <p className="text-red-600 text-xs font-semibold mb-4 flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> {error}</p>}

            <div className="space-y-4">
              {/* Checkbox 1: Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-1">
                  <input 
                    type="checkbox" 
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms(!agreeTerms)}
                    className="peer h-5 w-5 rounded-full border-2 border-outline-variant appearance-none checked:bg-primary checked:border-primary transition-all" 
                  />
                  <Check className="w-3.5 h-3.5 text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="font-sans text-xs md:text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  He leído y acepto los términos y condiciones de participación.
                </span>
              </label>

              {/* Checkbox 2: Communications */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-1">
                  <input 
                    type="checkbox" 
                    checked={agreeComms}
                    onChange={() => setAgreeComms(!agreeComms)}
                    className="peer h-5 w-5 rounded-full border-2 border-outline-variant appearance-none checked:bg-primary checked:border-primary transition-all" 
                  />
                  <Check className="w-3.5 h-3.5 text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="font-sans text-xs md:text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Acepto recibir comunicaciones relacionadas con el retiro por email y WhatsApp.
                </span>
              </label>
            </div>
          </section>

        </div>

        {/* Right Column: Visual & Action (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Dock sunset landscape card */}
          <div className="rounded-2xl overflow-hidden aspect-[4/5] relative group shadow-lg">
            <img 
              src={IMAGE_URLS.dockSunset} 
              alt="Donde el espíritu florece de nuevo" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-left">
              <p className="font-display text-3xl text-white mb-2 italic">
                "Donde el espíritu florece de nuevo."
              </p>
              <p className="font-sans text-xs text-white/80 tracking-wide">
                Wisemans Ferry, Australia 2026
              </p>
            </div>
          </div>

          {/* Enviar Registro Button */}
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
        </div>

      </div>
    </motion.div>
  );
}
