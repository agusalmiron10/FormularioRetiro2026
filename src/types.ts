/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RegistrationData {
  // Step 1: Personal Info
  fullName: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  age: string;
  emergencyName: string;
  emergencyPhone: string;

  // Step 2: Preferences & Health
  language: 'es' | 'en' | 'both';
  travelOrigin: string;
  dietaryRequirements: {
    vegetariana: boolean;
    vegana: boolean;
    celiaca: boolean;
    sinLacteos: boolean;
    sinFrutosSecos: boolean;
  };
  otherDietary: string;

  // Step 3: Pricing & Payment
  pricingTier: 'early' | 'regular';
  paymentType: 'full' | 'installments' | 'donation';

  // Step 4: Room & Workshops
  roomType: 'shared' | 'private';
  selectedWorkshops: string[]; // maximum 2
}

export type RegistrationStep = 'landing' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'success';
