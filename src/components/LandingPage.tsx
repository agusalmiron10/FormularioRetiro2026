/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, ArrowRight, MapPin, Heart, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { IMAGE_URLS } from '../data';
import { RegistrationStep } from '../types';

interface LandingPageProps {
  onStartRegistration: () => void;
  key?: string;
}

export default function LandingPage({ onStartRegistration }: LandingPageProps) {
  const scrollToDetails = () => {
    const el = document.getElementById('detalles');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center overflow-hidden pt-16 md:min-h-[90vh] md:h-[750px] md:justify-end md:pb-8">
        {/* Background Image: full, uncropped, matches its own aspect ratio on mobile; fills the section on desktop */}
        <div
          className="relative w-full aspect-[16/9] bg-contain bg-center bg-no-repeat bg-[#FCF9F2] transition-transform duration-1000 md:absolute md:inset-0 md:aspect-auto md:z-0 md:bg-cover md:scale-102"
          style={{ backgroundImage: `url('${IMAGE_URLS.hero}')` }}
        >

        </div>

        {/* Content Canvas */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center py-8 md:py-0">


          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto"
          >
            <button
              onClick={onStartRegistration}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-container text-white hover:text-on-primary-container rounded-full font-sans font-medium shadow-lg hover:shadow-primary/20 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Comenzar registro
              <ArrowRight className="w-4 h-4" />
            </button>

          </motion.div>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <button 
            onClick={scrollToDetails}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Ver detalles abajo"
          >
            <ChevronDown className="w-8 h-8" />
          </button>
        </div>
      </section>

      {/* Details Grid / Event Info */}
      <section id="detalles" className="py-24 bg-[#FCF9F2] px-6 md:px-16 scroll-mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Text Info (Left column) */}
            <div className="lg:col-span-5 space-y-6">
              <span className="font-sans text-xs font-semibold tracking-widest text-secondary uppercase block">
                La Experiencia
              </span>
              <h3 className="font-display text-4xl md:text-5xl text-primary leading-tight">
                Un santuario de paz en Wisemans Retreat
              </h3>
              <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed">
                Ubicado a orillas del majestuoso río Hawkesbury, Wisemans Retreat ofrece el escenario perfecto para desconectarse del ruido cotidiano. Durante tres días, nos sumergiremos en tiempos de enseñanza, sesiones de oración y ministración, y caminatas restauradoras bajo el dosel del bosque.
              </p>

              <div className="space-y-4 pt-4 border-t border-primary/10">
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-sage-light/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-sans text-sm font-semibold text-on-surface">Wisemans Ferry, NSW</p>
                    <p className="font-sans text-xs text-on-surface-variant italic mt-0.5">Ubicación privilegiada junto al río</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-sage-light/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-sans text-sm font-semibold text-on-surface">Cuidado Integral</p>
                    <p className="font-sans text-xs text-on-surface-variant italic mt-0.5">Cuerpo, mente y espíritu en armonía</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Asymmetric Bento-style Image Cluster (Right column) */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-4 h-[420px] md:h-[500px]">
              {/* Image 1: Left tall card */}
              <div 
                className="rounded-3xl overflow-hidden shadow-lg relative row-span-2 bg-cover bg-center"
                style={{ backgroundImage: `url('${IMAGE_URLS.handsTea}')` }}
                title="Comunidad y calidez"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>

              {/* Image 2: Right top card */}
              <div 
                className="rounded-3xl overflow-hidden shadow-md relative bg-cover bg-center"
                style={{ backgroundImage: `url('${IMAGE_URLS.cabin}')` }}
                title="Alojamiento e interiorismo"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>

              {/* Image 3: Right bottom card */}
              <div 
                className="rounded-3xl overflow-hidden shadow-md relative bg-cover bg-center"
                style={{ backgroundImage: `url('${IMAGE_URLS.forestGroup}')` }}
                title="Conexión en la naturaleza"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
            </div>

          </div>
        </div>
      </section>


    </div>
  );
}
