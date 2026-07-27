/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check, Camera, MessageCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface SuccessScreenProps {
  fullName: string;
  registrationNumber: number | null;
  onReset: () => void;
  key?: string;
}

export default function SuccessScreen({
  fullName,
  registrationNumber,
  onReset
}: SuccessScreenProps) {
  const firstName = fullName ? fullName.split(' ')[0] : 'Hermana';

  // 🎉 Confetti al montar — multi-burst con colores del branding
  useEffect(() => {
    const COLORS = ['#5C7A5C', '#C17A5A', '#D4AF37', '#A8C5A0', '#F0E6D3'];

    // Burst central
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { x: 0.5, y: 0.55 },
      colors: COLORS,
      startVelocity: 45,
      gravity: 0.9,
      ticks: 200
    });

    // Burst lateral izquierdo (con pequeño delay)
    const t1 = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: COLORS,
        startVelocity: 50,
        gravity: 0.85
      });
    }, 200);

    // Burst lateral derecho
    const t2 = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: COLORS,
        startVelocity: 50,
        gravity: 0.85
      });
    }, 400);

    // Burst final suave para que no corte seco
    const t3 = setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: COLORS,
        startVelocity: 20,
        gravity: 0.6,
        ticks: 250
      });
    }, 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center py-10"
    >
      {/* Icon Circle — pulsa una vez */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}
        className="w-24 h-24 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm"
      >
        <Check className="w-12 h-12 stroke-[3]" />
      </motion.div>

      {/* Majestic Title */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-4xl md:text-5xl text-primary mb-4"
      >
        ¡Registro Exitoso!
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="font-sans text-sm md:text-base text-on-surface-variant max-w-lg mx-auto mb-10 leading-relaxed"
      >
        ¡Gracias por registrarte, <strong>{firstName}</strong>! Recibimos tu inscripción y tu comprobante de pago. Nuestro equipo verificará la transferencia y te enviaremos un correo confirmando tu lugar en <strong>Renueva 2026</strong>. Nos vemos del 11 al 13 de septiembre en Wisemans Retreat.
      </motion.p>

      {registrationNumber !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/5 border border-primary/10 mb-10"
        >
          <span className="font-sans text-xs font-semibold text-tertiary uppercase tracking-wider">
            Tu número de inscripción
          </span>
          <span className="font-display text-2xl text-primary leading-none">
            #{String(registrationNumber).padStart(3, '0')}
          </span>
        </motion.div>
      )}

      {/* Action cards: Instagram & WhatsApp */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mx-auto mb-10"
      >
        {/* Instagram Card */}
        <a 
          href="https://instagram.com/alegria_retreats" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-3 p-5 border border-outline-variant/50 hover:border-primary/40 rounded-2xl hover:bg-surface-container-low transition-all duration-300 group text-left cursor-pointer focus:outline-none"
        >
          <Camera className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform duration-300" />
          <div>
            <p className="font-sans text-xs font-semibold text-on-surface">Instagram</p>
            <p className="font-sans text-[11px] text-on-surface-variant mt-0.5">Seguí @alegria_retreats</p>
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
      </motion.div>

      {/* Reset button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={onReset}
        className="inline-flex items-center gap-2 text-primary hover:text-primary-container font-sans text-sm font-semibold hover:underline decoration-2 underline-offset-4 cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        Volver al inicio
      </motion.button>
    </motion.div>
  );
}
