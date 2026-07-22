/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Share2, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Footer() {
  const [activeModal, setActiveModal] = useState<'contact' | 'privacy' | 'terms' | null>(null);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'RENUEVA 2026 | Retiro Espiritual',
        text: 'Te invito a ser parte de Renueva 2026, un retiro espiritual diseñado para conectar con tu esencia en Wisemans Ferry.',
        url: window.location.href,
      }).catch((err) => console.log(err));
    } else {
      // fallback copy
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace de la aplicación copiado al portapapeles!');
    }
  };

  return (
    <footer className="w-full bg-[#F8EDE0] border-t border-primary/10 py-12 px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <h4 className="font-display text-xl font-medium text-primary">Alegría Retreats</h4>
        <p className="font-sans text-xs text-on-surface-variant mt-1.5">
          © 2026 Alegría Retreats. All rights reserved.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        <button 
          onClick={() => setActiveModal('contact')} 
          className="font-sans text-sm text-on-surface-variant hover:text-secondary hover:underline underline-offset-4 decoration-2 transition-colors cursor-pointer"
        >
          Contact Us
        </button>
        <button 
          onClick={() => setActiveModal('privacy')} 
          className="font-sans text-sm text-on-surface-variant hover:text-secondary hover:underline underline-offset-4 decoration-2 transition-colors cursor-pointer"
        >
          Privacy Policy
        </button>
        <button 
          onClick={() => setActiveModal('terms')} 
          className="font-sans text-sm text-on-surface-variant hover:text-secondary hover:underline underline-offset-4 decoration-2 transition-colors cursor-pointer"
        >
          Terms of Service
        </button>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
          title="Compartir retiro"
        >
          <Share2 className="w-4.5 h-4.5" />
        </button>
        <a 
          href="mailto:alegria@retreats.com?subject=Consulta%20Renueva%202026"
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
          title="Enviar correo"
        >
          <Mail className="w-4.5 h-4.5" />
        </a>
      </div>

      {/* Elegant Modal Overlays */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FCF9F2] border border-primary/20 rounded-2xl max-w-lg w-full p-6 relative shadow-xl"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-primary/5 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {activeModal === 'contact' && (
                <div>
                  <h3 className="font-display text-2xl text-primary mb-4">Contacto</h3>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-4">
                    ¿Tienes dudas sobre el retiro o necesitas ayuda con tu inscripción? Estamos a tu disposición para ayudarte a planificar tu viaje de renovación.
                  </p>
                  <div className="space-y-2 font-sans text-sm text-on-surface">
                    <p><strong>Email:</strong> contacto@alegriabewell.com</p>
                    <p><strong>Teléfono:</strong> +61 2 9876 5432</p>
                    <p><strong>Dirección:</strong> Wisemans Ferry, New South Wales, Australia</p>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div>
                  <h3 className="font-display text-2xl text-primary mb-4">Política de Privacidad</h3>
                  <div className="space-y-3 font-sans text-xs text-on-surface-variant leading-relaxed max-h-64 overflow-y-auto pr-2">
                    <p>
                      En Alegría Retreats nos comprometemos a proteger tu privacidad. Recopilamos información personal (como nombre, correo electrónico, teléfono, datos de salud y contacto de emergencia) con el único propósito de gestionar tu participación en el retiro "Renueva 2026".
                    </p>
                    <p>
                      Tus datos médicos, incluyendo alergias y requerimientos dietarios, se tratarán de forma confidencial y solo se compartirán con el personal de cocina y seguridad médica para garantizar tu bienestar.
                    </p>
                    <p>
                      No venderemos, distribuiremos ni cederemos tu información personal a terceros a menos que contemos con tu permiso expreso o la ley nos lo exija.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === 'terms' && (
                <div>
                  <h3 className="font-display text-2xl text-primary mb-4">Términos y Condiciones</h3>
                  <div className="space-y-3 font-sans text-xs text-on-surface-variant leading-relaxed max-h-64 overflow-y-auto pr-2">
                    <p>
                      Al registrarte para el retiro "Renueva 2026", confirmas tu aceptación de los siguientes términos de participación:
                    </p>
                    <p>
                      <strong>Reservas y Pagos:</strong> La confirmación de tu lugar requiere el depósito de los fondos mediante transferencia bancaria y el envío del comprobante correspondiente. El precio anticipado (Early Bird) es de $450 AUD, válido hasta el 31 de julio de 2026. A partir del 1 de agosto de 2026 el precio regular es de $480 AUD.
                    </p>
                    <p>
                      <strong>Cancelaciones:</strong> Los pagos realizados no son reembolsables, salvo situaciones de emergencia evaluadas por el equipo organizador, en cuyo caso podrá otorgarse un crédito para un próximo retiro de Alegría Retreats.
                    </p>
                    <p>
                      <strong>Responsabilidad:</strong> Alegría Retreats no se hace responsable por la pérdida o daño de pertenencias personales, ni por accidentes corporales leves derivados de actividades recreativas libres en la naturaleza.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 bg-primary text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
