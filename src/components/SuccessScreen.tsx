/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, Camera, MessageCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface SuccessScreenProps {
  fullName: string;
  onReset: () => void;
  key?: string;
}

export default function SuccessScreen({ fullName, onReset }: SuccessScreenProps) {
  // Extract first name for greeting
  const firstName = fullName ? fullName.split(' ')[0] : 'Hermana';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center py-10"
    >
      {/* Icon Circle */}
      <div className="w-24 h-24 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <Check className="w-12 h-12 stroke-[3]" />
      </div>

      {/* Majestic Title */}
      <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">
        ¡Registro Exitoso!
      </h1>

      {/* Description */}
      <p className="font-sans text-sm md:text-base text-on-surface-variant max-w-lg mx-auto mb-10 leading-relaxed">
        ¡Gracias por registrarte, <strong>{firstName}</strong>! Recibimos tu inscripción y tu comprobante de pago. Nuestro equipo verificará la transferencia y te enviaremos un correo confirmando tu lugar en <strong>Renueva 2026</strong>. Nos vemos del 11 al 13 de septiembre en Wisemans Retreat.
      </p>

      {/* Action cards: Instagram & WhatsApp */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mx-auto mb-10">
        
        {/* Instagram Card */}
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-3 p-5 border border-outline-variant/50 hover:border-primary/40 rounded-2xl hover:bg-surface-container-low transition-all duration-300 group text-left cursor-pointer focus:outline-none"
        >
          <Camera className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform duration-300" />
          <div>
            <p className="font-sans text-xs font-semibold text-on-surface">Instagram</p>
            <p className="font-sans text-[11px] text-on-surface-variant mt-0.5">Síguenos para novedades diarias</p>
          </div>
        </a>

        {/* WhatsApp Card */}
        <a 
          href="https://whatsapp.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-3 p-5 border border-outline-variant/50 hover:border-primary/40 rounded-2xl hover:bg-surface-container-low transition-all duration-300 group text-left cursor-pointer focus:outline-none"
        >
          <MessageCircle className="w-6 h-6 text-status-success group-hover:scale-110 transition-transform duration-300" />
          <div>
            <p className="font-sans text-xs font-semibold text-on-surface">Comunidad WhatsApp</p>
            <p className="font-sans text-[11px] text-on-surface-variant mt-0.5">Únete al grupo de oración</p>
          </div>
        </a>

      </div>

      {/* Reset button */}
      <button 
        onClick={onReset}
        className="inline-flex items-center gap-2 text-primary hover:text-primary-container font-sans text-sm font-semibold hover:underline decoration-2 underline-offset-4 cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        Volver al inicio
      </button>
    </motion.div>
  );
}
