/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sparkles, Trash2, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Step1PersonalInfo from './components/Step1PersonalInfo';
import Step2Preferences from './components/Step2Preferences';
import Step3Payment from './components/Step3Payment';
import Step4Workshops from './components/Step4Workshops';
import Step5Finalize from './components/Step5Finalize';
import SuccessScreen from './components/SuccessScreen';
import { RegistrationData, RegistrationStep } from './types';
import { INITIAL_REGISTRATION_DATA, IMAGE_URLS } from './data';

export default function App() {
  const [step, setStep] = useState<RegistrationStep>('landing');
  const [formData, setFormData] = useState<RegistrationData>(INITIAL_REGISTRATION_DATA);
  const [draftSaved, setDraftSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Check for existing draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('renueva_2026_draft');
    if (saved) {
      setHasDraft(true);
    }
  }, []);

  const handleUpdateData = (updated: Partial<RegistrationData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updated };
      // Clear draftSaved feedback if they change things
      if (draftSaved) setDraftSaved(false);
      return next;
    });
  };

  const handleSaveDraft = () => {
    localStorage.setItem('renueva_2026_draft', JSON.stringify(formData));
    setDraftSaved(true);
    showToast('¡Progreso de inscripción guardado como borrador!');
    setHasDraft(true);
  };

  const handleRestoreDraft = () => {
    const saved = localStorage.getItem('renueva_2026_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        setStep('step1');
        showToast('¡Borrador restaurado con éxito!');
        setHasDraft(false);
      } catch (err) {
        console.error('Error restoring draft', err);
      }
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem('renueva_2026_draft');
    setHasDraft(false);
    showToast('Borrador eliminado.');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleRegistrationSubmit = () => {
    // Clear draft on successful submission
    localStorage.removeItem('renueva_2026_draft');
    setHasDraft(false);
    setStep('success');
  };

  const handleReset = () => {
    setFormData(INITIAL_REGISTRATION_DATA);
    setStep('landing');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-on-surface bg-[#FAF9F6] selection:bg-sage-light/30">
      {/* Persistent Header */}
      <Header currentStep={step} onNavigate={setStep} />

      {/* Main Container */}
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        
        {/* Dynamic Draft notification */}
        {hasDraft && step === 'landing' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 max-w-xl mx-auto flex items-center justify-between gap-4 text-left shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-secondary shrink-0" />
              <div>
                <p className="font-sans text-xs font-bold text-primary">TIENES UN BORRADOR GUARDADO</p>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">Recupera tu progreso de inscripción previo.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRestoreDraft}
                className="px-4 py-2 bg-primary hover:bg-primary-container text-white hover:text-on-primary-container text-xs font-semibold rounded-full shadow-sm transition-all cursor-pointer"
              >
                Cargar
              </button>
              <button 
                onClick={handleClearDraft}
                className="p-2 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                title="Eliminar borrador"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Dynamic Wizard Steps */}
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <LandingPage key="landing" onStartRegistration={() => setStep('step1')} />
          )}

          {step === 'step1' && (
            <Step1PersonalInfo 
              key="step1"
              data={formData} 
              onChange={handleUpdateData} 
              onNext={() => setStep('step2')} 
              onSaveDraft={handleSaveDraft}
              draftSaved={draftSaved}
            />
          )}

          {step === 'step2' && (
            <Step2Preferences 
              key="step2"
              data={formData} 
              onChange={handleUpdateData} 
              onNext={() => setStep('step3')} 
              onBack={() => setStep('step1')} 
            />
          )}

          {step === 'step3' && (
            <Step3Payment 
              key="step3"
              data={formData} 
              onChange={handleUpdateData} 
              onNext={() => setStep('step4')} 
              onBack={() => setStep('step2')} 
            />
          )}

          {step === 'step4' && (
            <Step4Workshops 
              key="step4"
              data={formData} 
              onChange={handleUpdateData} 
              onNext={() => setStep('step5')} 
              onBack={() => setStep('step3')} 
            />
          )}

          {step === 'step5' && (
            <Step5Finalize 
              key="step5"
              data={formData} 
              onBack={() => setStep('step4')} 
              onSubmit={handleRegistrationSubmit} 
            />
          )}

          {step === 'success' && (
            <SuccessScreen 
              key="success"
              fullName={formData.fullName} 
              onReset={handleReset} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Floating Custom Toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl bg-forest-deep text-white shadow-xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-status-success shrink-0" />
            <span className="font-sans text-xs font-semibold tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Accent Element: Soft Eucalyptus Leaf Image in background */}
      <div className="fixed bottom-0 right-0 -z-10 opacity-10 pointer-events-none overflow-hidden select-none">
        <img 
          src={IMAGE_URLS.accentLeaf} 
          alt="Eucalyptus branch accent" 
          className="w-96 translate-x-20 translate-y-20 rotate-12"
        />
      </div>

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
}
