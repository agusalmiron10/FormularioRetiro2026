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
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-primary/5 shadow-sm shadow-primary/5 h-20 flex items-center justify-center px-6">
      <div className="w-full max-w-4xl flex items-center justify-between">
      {/* Brand Logo */}
      <button 
        onClick={() => onNavigate('landing')} 
        className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
        aria-label="Volver al inicio"
      >
        <img src="/mesa-de-trabajo-2.jpeg" alt="Alegria BeWell" className="h-16 w-auto object-contain" />
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <button 
          onClick={() => onNavigate('landing')}
          className={`font-sans text-base font-semibold tracking-wide transition-colors duration-300 cursor-pointer ${
            currentStep === 'landing' ? 'text-primary border-b-2 border-primary/40 pb-1' : 'text-primary/80 hover:text-primary'
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
          className="font-sans text-base font-semibold tracking-wide text-primary/80 hover:text-primary transition-colors duration-300 cursor-pointer"
        >
          La Experiencia
        </button>
        <button 
          onClick={() => onNavigate('step1')}
          className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white hover:text-on-primary-container rounded-full font-sans text-sm font-semibold tracking-wide shadow-sm hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
        >
          Comenzar registro
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
      </div>
    </header>
  );
}
