/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RegistrationData } from './types';

export const IMAGE_URLS = {
  hero: '/img-4500.jpeg',
  handsTea: '/chatgpt_1.png',
  cabin: '/chatgpt_2.png',
  forestGroup: '/chatgpt_3.png',
  dockSunset: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6FoqR4I3ie_cbYpAqxmi9dmmVAjXuXgDlFPfGRJkZu_Ev64dvvuklYgTSUWhCB-6s_6Xgx-ZqIB27EIIb_r9UAp2R_o9bU5E-AoRLbufFerZ6GX_MsRqBOiXR6aL6UlwhZxRhhwOIA_hSo3dYJDtaHOK44puhKYi2wxBtLn9BuJPfyysxH2_HVehFB4h-w1zaW6KWupW-KYivnaNThgjluoCBIFEtmcpId7PuRnrqUgnSah-W_4Gj_N7ROzAUSRenzooHUrE5mJAK',
  accentLeaf: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCT_qlnOLJJjqZfo5yuQzezgvq5mORuXHrXeQ9fvK9McCicnJhG9her9s9rC7risoZ5bS-B2RlotclCDwVLSTZi3JEb7wzBXNw5n9YSXKsbsqWYQw2uRwGgi2JNFKhcQHvRLZk6B0sJ3zyIHwL-u1BiijOJE2Np8U-GwnqTw34OlYU3pXMxVGMOcpvUNiGs3G_5LN48ERyaU_ZYyE1zY_Ht_QEuSfnfQBXERE1UfhXD6_2d7gY1syHM2mngzm-LvmhFIPFdkg4mXsv',
  wisemansFerryMini: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwUvh_Gx6gzLBtkOQ6D4SHunu32bvbI5syQ1HPteULNN3gJkvtOtHs4y_468e4HQcvVVFqrRtROJ5JLZxOseLyAzwFvzYbHNU7d_e32HN66dROK6HXy-pErAdm3abL7jltXKuCbETCLul8c-Vl-ep06ZyushzP6tuHVHesbokLpfN_WR2x6lsAeewW2ES3ZFyGohg_ahzTsMBNRV4zOulidsCgr-LixSZqSjuB6603akhBxLuHdmiE0cb5b0O7-qizs2K0W5TxgILm'
};

/** Q11 — ¿Desde qué ciudad o país viajarás al retiro? */
export const TRAVEL_ORIGINS = [
  'Sídney',
  'Melbourne',
  'Brisbane',
  'Gold Coast',
  'Sunshine Coast',
  'Perth',
  'Darwin',
  'Desde otro país',
  'Otros'
];

/** Q12 — Requerimientos alimenticios o alergias */
export const DIETARY_OPTIONS = [
  'Vegetariana',
  'Vegana',
  'Celíaca',
  'Libre de gluten',
  'Libre de trigo',
  'Libre de lácteos',
  'Intolerancia a la lactosa',
  'Ninguna',
  'Otro'
];

/** Q13 — ¿Te gustaría apoyar a otras mujeres para que puedan asistir al retiro? */
export const SPONSORSHIP_OPTIONS = [
  'Apadriná a otra mujer',
  'Donación adicional para el retiro',
  'No, esta vez no puedo colaborar'
];

/** Q14 — ¿Qué pago estás realizando? */
export const PAYMENT_OPTIONS: {
  id: string;
  label: string;
  group: 'anticipado' | 'regular' | 'voluntaria' | 'donacion';
  amount: number | null;
}[] = [
  { id: 'early-full', label: 'Precio anticipado — Pago completo $450', group: 'anticipado', amount: 450 },
  { id: 'early-1', label: 'Precio anticipado — Primera cuota $225', group: 'anticipado', amount: 225 },
  { id: 'early-2', label: 'Precio anticipado — Segunda cuota $225', group: 'anticipado', amount: 225 },
  { id: 'regular-full', label: 'Precio regular — Pago completo $480', group: 'regular', amount: 480 },
  { id: 'volunteer-full', label: 'Voluntaria — Pago completo', group: 'voluntaria', amount: null },
  { id: 'volunteer-1', label: 'Voluntaria — Primera cuota', group: 'voluntaria', amount: null },
  { id: 'volunteer-2', label: 'Voluntaria — Segunda cuota', group: 'voluntaria', amount: null },
  { id: 'donation-woman', label: 'Donación para apoyar a otra mujer', group: 'donacion', amount: null },
  { id: 'donation-ministry', label: 'Donación para bendecir el ministerio', group: 'donacion', amount: null }
];

/** Datos bancarios oficiales */
export const BANK_DETAILS = {
  accountName: 'Alegria BeWell House',
  bsb: '062559',
  accountNumber: '10485590',
  referenceHint: 'Nombre completo + RENUEVA'
};

/** Q16 — Transporte */
export const TRANSPORT_OPTIONS = [
  'Tengo auto y puedo llevar a otras participantes',
  'Necesito ayuda para coordinar traslado o carpool',
  'Ya tengo mi transporte organizado'
];

/** Q17 — Tiempo especial de oración (Healing Room) */
export const PRAYER_OPTIONS = [
  'Sí, me gustaría recibir oración en el Healing Session',
  'Lo decidiré más adelante, durante el retiro',
  'No, en esta ocasión no participaré del tiempo de oración',
  'Otros'
];

/** Q18 — ¿Qué esperas recibir o experimentar en este retiro? */
export const EXPECTATION_OPTIONS = [
  'Ser renovada integralmente: mente, espíritu y cuerpo',
  'Fortalecer mi relación con Dios',
  'Encontrar paz, renuevo y restauración en mi corazón',
  'Profundizar en mi identidad como hija de Dios',
  'Descubrir o reafirmar mi propósito',
  'Recibir dirección y claridad para la próxima etapa de mi vida',
  'Sanar heridas emocionales y avanzar con esperanza',
  'Conectar con otras mujeres de fe, formar nuevas amistades',
  'Recibir guía y motivación para mi vida personal, profesional o familiar',
  'Dedicar tiempo para mí, lejos de las responsabilidades diarias',
  'Otro'
];

/** Q19 — ¿Cómo te enteraste de Alegría Retreat 2026? */
export const REFERRAL_OPTIONS = [
  'Me invitó una amiga o familiar',
  'En Instagram / Redes sociales',
  'Por WhatsApp - Alegría Comunidad',
  'Ya participé en un retiro anterior de Alegría Retreat',
  'Por mi iglesia o grupo de fe',
  'Otro (especificar)'
];

/** Qué incluye el retiro */
export const INCLUSIONS = [
  'Alojamiento por 2 noches',
  'Todas las comidas: desayuno, morning tea, almuerzo, afternoon tea y cena',
  'Habitación con ropa de cama completa, toallas y baño privado',
  'Café y té disponibles en la habitación',
  'Materiales del retiro y kit de bienvenida'
];

/** Enlaces oficiales */
export const LINKS = {
  website: 'https://alegriabewell.com',
  instagramBewell: 'https://instagram.com/alegriabewell',
  instagramRetreats: 'https://instagram.com/alegria_retreats',
  venue: 'https://wisemans.com.au'
};

/** Comprobante de pago: reglas de validación */
export const PROOF_RULES = {
  maxSizeMB: 8,
  acceptedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'application/pdf'],
  accept: 'image/png,image/jpeg,image/webp,image/heic,application/pdf'
};

export const INITIAL_REGISTRATION_DATA: RegistrationData = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  birthDate: '',
  age: '',
  emergencyName: '',
  emergencyPhone: '',
  language: 'es',
  travelOrigin: '',
  travelOriginOther: '',
  dietary: [],
  otherDietary: '',
  sponsorship: '',
  paymentOption: '',
  paymentProof: null,
  medicalNotes: '',
  roommatePreference: '',
  transport: '',
  prayerSession: '',
  prayerOther: '',
  expectations: [],
  expectationsOther: '',
  referralSource: '',
  referralOther: '',
  confirmReservation: false,
  confirmCancellation: false,
  confirmTerms: false,
  comments: ''
};
