/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Landmark, CreditCard, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import { RegistrationData } from '../types';
import { motion } from 'motion/react';

interface Step3Props {
  data: RegistrationData;
  onChange: (updated: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
  key?: string;
}

export default function Step3Payment({ data, onChange, onNext, onBack }: Step3Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-[800px] mx-auto text-left"
    >
      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="font-sans text-xs font-bold text-primary uppercase tracking-widest">Paso 3 de 5: Pago</span>
          <span className="font-sans text-xs font-semibold text-tertiary">60% completado</span>
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-700 ease-out w-3/5"></div>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl text-primary mb-2">Detalles de Registro y Pago</h1>
        <p className="font-sans text-sm text-on-surface-variant">
          Elige tu modalidad de participación y completa tu registro para asegurar tu lugar en Wisemans Ferry.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Pricing Options */}
        <section>
          <h2 className="font-sans text-sm font-bold text-secondary mb-4 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-secondary" />
            Opciones de Precio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Early Bird Card */}
            <label className="relative cursor-pointer block">
              <input 
                type="radio" 
                name="pricing" 
                checked={data.pricingTier === 'early'} 
                onChange={() => onChange({ pricingTier: 'early' })}
                className="sr-only peer" 
              />
              <div className="p-6 border-2 border-outline-variant/40 rounded-2xl transition-all hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-[#f4fbf5] h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-pricing-early/10 text-pricing-early text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Recomendado
                  </span>
                  <div className="w-5 h-5 rounded-full border-2 border-outline-variant flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary">
                    {data.pricingTier === 'early' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
                <div>
                  <h3 className="font-sans text-base font-semibold text-primary">Early Bird</h3>
                  <p className="font-display text-3xl text-primary mb-1 mt-1">$450 AUD</p>
                  <p className="font-sans text-xs text-on-surface-variant italic">
                    Válido hasta el 15 de Octubre, 2025
                  </p>
                </div>
              </div>
            </label>

            {/* Regular Card */}
            <label className="relative cursor-pointer block">
              <input 
                type="radio" 
                name="pricing" 
                checked={data.pricingTier === 'regular'} 
                onChange={() => onChange({ pricingTier: 'regular' })}
                className="sr-only peer" 
              />
              <div className="p-6 border-2 border-outline-variant/40 rounded-2xl transition-all hover:bg-surface-container-low peer-checked:border-primary peer-checked:bg-[#f4fbf5] h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-pricing-regular/10 text-pricing-regular text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Estándar
                  </span>
                  <div className="w-5 h-5 rounded-full border-2 border-outline-variant flex items-center justify-center">
                    {data.pricingTier === 'regular' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
                <div>
                  <h3 className="font-sans text-base font-semibold text-primary">Regular</h3>
                  <p className="font-display text-3xl text-primary mb-1 mt-1">$480 AUD</p>
                  <p className="font-sans text-xs text-on-surface-variant italic">
                    Precio regular a partir de Octubre
                  </p>
                </div>
              </div>
            </label>

          </div>
        </section>

        {/* Payment Selection */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5">
          <h2 className="font-sans text-sm font-bold text-secondary mb-4 uppercase tracking-wider">Tipo de Pago</h2>
          <div className="space-y-3">
            
            {/* Pago Completo */}
            <label className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 cursor-pointer hover:border-primary/40 transition-colors">
              <input 
                type="radio" 
                name="payment_type" 
                value="full" 
                checked={data.paymentType === 'full'}
                onChange={() => onChange({ paymentType: 'full' })}
                className="w-5 h-5 text-primary focus:ring-primary border-outline-variant"
              />
              <span className="font-sans text-sm font-semibold text-on-surface">Pago Completo</span>
            </label>

            {/* Pago en Cuotas */}
            <label className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 cursor-pointer hover:border-primary/40 transition-colors">
              <input 
                type="radio" 
                name="payment_type" 
                value="installments" 
                checked={data.paymentType === 'installments'}
                onChange={() => onChange({ paymentType: 'installments' })}
                className="w-5 h-5 text-primary focus:ring-primary border-outline-variant"
              />
              <span className="font-sans text-sm font-semibold text-on-surface">Pago en Cuotas (Facilidades)</span>
            </label>

            {/* Incluir Donación Extra */}
            <label className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 cursor-pointer hover:border-primary/40 transition-colors">
              <input 
                type="radio" 
                name="payment_type" 
                value="donation" 
                checked={data.paymentType === 'donation'}
                onChange={() => onChange({ paymentType: 'donation' })}
                className="w-5 h-5 text-primary focus:ring-primary border-outline-variant"
              />
              <span className="font-sans text-sm font-semibold text-on-surface">Incluir Donación Extra para otra hermana</span>
            </label>

          </div>
        </section>

        {/* Bank Details (Earth-toned Box) */}
        <section className="bg-[#e9e1d8] p-6 md:p-8 rounded-2xl border-l-4 border-terracotta-soft text-on-surface">
          <div className="flex items-start gap-4">
            <Landmark className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
            <div className="w-full">
              <h2 className="font-sans text-xs font-bold text-tertiary mb-3 uppercase tracking-wide">
                Detalles de Transferencia Bancaria
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-sans text-xs text-tertiary">Nombre de la cuenta</p>
                  <p className="font-sans text-sm font-bold text-on-surface">Alegria BeWell House</p>
                </div>
                <div>
                  <p className="font-sans text-xs text-tertiary">BSB</p>
                  <p className="font-sans text-sm font-bold text-on-surface tracking-wider">062559</p>
                </div>
                <div>
                  <p className="font-sans text-xs text-tertiary">Número de Cuenta</p>
                  <p className="font-sans text-sm font-bold text-on-surface tracking-wider">10485590</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-sans text-xs text-tertiary italic mt-1">
                    Por favor, usa tu nombre completo como referencia en tu transferencia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation Policy */}
        <section className="p-6 rounded-2xl border border-outline-variant/40 bg-[#FAF9F6]/50">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-terracotta-soft mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-sans text-sm font-bold text-terracotta-soft mb-2">Política de Cancelación</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Entendemos que los planes pueden cambiar. Se ofrecerá un reembolso completo por cancelaciones realizadas con más de 30 días de antelación. Las cancelaciones realizadas entre 15 y 30 días antes del evento recibirán un crédito para futuros retiros. No se ofrecen reembolsos para cancelaciones con menos de 14 días de antelación debido a compromisos previos con el lugar.
              </p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-primary/10">
          <button 
            type="button" 
            onClick={onBack}
            className="text-primary font-sans text-sm font-semibold hover:underline decoration-2 underline-offset-4 cursor-pointer"
          >
            Volver al paso anterior
          </button>
          <button 
            type="submit"
            className="w-full sm:w-auto bg-primary text-white font-sans text-sm font-semibold px-10 py-4 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container hover:text-on-primary-container hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </motion.div>
  );
}
