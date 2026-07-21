/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Leaf, Menu } from 'lucide-react';
import { RegistrationStep } from '../types';

interface HeaderProps {
  currentStep: RegistrationStep;
  onNavigate: (step: RegistrationStep) => void;
}

export default function Header({ currentStep, onNavigate }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#FCF9F2] border-b border-primary/5 shadow-sm shadow-primary/5 h-16 flex items-center justify-between px-6 md:px-16">
      {/* Brand Logo */}
      <button 
        onClick={() => onNavigate('landing')} 
        className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
        aria-label="Volver al inicio"
      >
        <Leaf className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
        <h1 className="font-display text-2xl font-medium tracking-tight text-primary">
          RENUEVA 2026
        </h1>
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <button 
          onClick={() => onNavigate('landing')}
          className={`font-sans text-sm font-medium tracking-wide transition-colors duration-300 cursor-pointer ${
            currentStep === 'landing' ? 'text-primary font-semibold border-b-2 border-primary/40 pb-1' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          Inicio
        </button>
        <button 
          onClick={() => {
            onNavigate('landing');
            setTimeout(() => {
              const el = document.getElementById('detalles');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="font-sans text-sm font-medium tracking-wide text-on-surface-variant hover:text-primary transition-colors duration-300 cursor-pointer"
        >
          La Experiencia
        </button>
        <button 
          onClick={() => onNavigate('step1')}
          className={`font-sans text-sm font-medium tracking-wide transition-colors duration-300 cursor-pointer ${
            currentStep !== 'landing' && currentStep !== 'success' ? 'text-primary font-semibold border-b-2 border-primary/40 pb-1' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          Registro
        </button>
      </nav>

      {/* Mobile Indicator / Menu button */}
      <div className="flex items-center gap-3 md:hidden">
        {currentStep !== 'landing' && currentStep !== 'success' && (
          <span className="font-sans text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full uppercase">
            Registro activo
          </span>
        )}
        <button 
          className="p-1.5 text-primary hover:bg-primary/5 rounded-full transition-colors"
          aria-label="Abrir menú"
          onClick={() => onNavigate('landing')}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
