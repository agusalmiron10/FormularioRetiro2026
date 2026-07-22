/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PaymentProof {
  name: string;
  type: string;
  size: number;
  /** Sólo para la vista previa en pantalla. */
  dataUrl: string;
  /** El archivo original, que es lo que se sube al servidor. */
  file: File;
}

export interface RegistrationData {
  // Paso 1: Información personal
  fullName: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  age: string;
  emergencyName: string;
  emergencyPhone: string;

  // Paso 2: Preferencias
  language: 'es' | 'en' | 'both';
  travelOrigin: string;
  travelOriginOther: string;
  dietary: string[];
  otherDietary: string;

  // Paso 3: Registro y pago
  sponsorship: string;
  paymentOption: string;
  paymentProof: PaymentProof | null;

  // Paso 4: Tu experiencia
  medicalNotes: string;
  roommatePreference: string;
  transport: string;
  prayerSession: string;
  prayerOther: string;
  expectations: string[];
  expectationsOther: string;
  referralSource: string;
  referralOther: string;

  // Paso 5: Confirmación
  confirmReservation: boolean;
  confirmCancellation: boolean;
  confirmTerms: boolean;
  comments: string;
}

export type RegistrationStep = 'landing' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'success';
