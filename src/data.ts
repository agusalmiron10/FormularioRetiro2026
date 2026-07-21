/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RegistrationData } from './types';

export const IMAGE_URLS = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB-_qQ5JUCu-iXda6c3LwE0fS_BUvQu9vmXd3Al0ASIs8BWG4UHWYo6uBT2qD6jyc5kX4t2hHWfhUVsYgRFv7SYLAdXoSalQGqLzxk2DlKUYdR7zLBFFcaQXGPXHGxAyRG-cS5cUaSrOdiFRlwsCkm1Op4Nf4utSL3u-CQaPt_EEPzqtV83iyjqDqPcLHWte-fUGn9pDnSXKpDayl2jX1JIL2XzD9qJhKQsEnIKaj9Bqq5_kfbO304QrsdLScSolQDV2yENCrsA_pZ',
  handsTea: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdhgDbC8g0k8kwzialcMx8_rZnxV13CrxJxU3MDpHvkEDDQRgnyWk_hC8frqikoud0DSS0-m8ghuhFFOHCSxOgwFgQt7PENdkLov5-9AkatbOzQILcvqGSR_tsY9dhYszTL5Mmtg0F8pvjf7_UfsVK188KcPXAdBuMRcGPToiFrOSVNs6yhySU5PiNeBrPIPGWSFto9WtqAqQntejPXtgjeCL9XshQWA8-IBGSZbFqttqhF6LlVhuESLMvfiroJnfAOQifF_DB0mJC',
  cabin: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIJzzTkaJx7Qrh6yAMVrgPrcyTT_Ea2slpwZZNUC6o73J-5sfyHrbptWFHQoKRC2xYvcATW0wH3ce9vUdirga9kAqK06TFFt6WLciq3ykYB8h05vfsBdBn-_bsf_tMtvwsZJVfIejkdYLb6zIoBOlaeopop2Nvuc9O9vGyTHjvaiWtybHX23OyH2Qkq8PSEP9OruDBEqlmMUpqL4QGaCYDIO3pfN6k4ZkJsPy_jCuFfkZkQe68-ofqtOgMox88v9oTxIA4uBEZTlap',
  forestGroup: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6ncgFqMNfUZG7Q6DQkxFTl7-KPCR1lLNU9NeDreJ3KSZ7FPszYtexMQvJM1AtiOZ-bN6gJgSe6pjQ90vHkN7BEcC1xMPzeHNvxfaI1UtT0GfrKe0zR0RiEF2FOZeVqNvL-QPeSE5Xjb_NYEWi1k4ymLZxqviGWsMrhTzT61Es4J3B8zfkebnh4ZV8JrwDlDsjwWQUzCH-_btn27F6HvAYcUsPIQK8qQ_cFZM_mxOSxeruGwvquY2OWGh56BCh_WneqEbdlnTJkJ8b',
  dockSunset: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6FoqR4I3ie_cbYpAqxmi9dmmVAjXuXgDlFPfGRJkZu_Ev64dvvuklYgTSUWhCB-6s_6Xgx-ZqIB27EIIb_r9UAp2R_o9bU5E-AoRLbufFerZ6GX_MsRqBOiXR6aL6UlwhZxRhhwOIA_hSo3dYJDtaHOK44puhKYi2wxBtLn9BuJPfyysxH2_HVehFB4h-w1zaW6KWupW-KYivnaNThgjluoCBIFEtmcpId7PuRnrqUgnSah-W_4Gj_N7ROzAUSRenzooHUrE5mJAK',
  accentLeaf: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCT_qlnOLJJjqZfo5yuQzezgvq5mORuXHrXeQ9fvK9McCicnJhG9her9s9rC7risoZ5bS-B2RlotclCDwVLSTZi3JEb7wzBXNw5n9YSXKsbsqWYQw2uRwGgi2JNFKhcQHvRLZk6B0sJ3zyIHwL-u1BiijOJE2Np8U-GwnqTw34OlYU3pXMxVGMOcpvUNiGs3G_5LN48ERyaU_ZYyE1zY_Ht_QEuSfnfQBXERE1UfhXD6_2d7gY1syHM2mngzm-LvmhFIPFdkg4mXsv',
  wisemansFerryMini: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwUvh_Gx6gzLBtkOQ6D4SHunu32bvbI5syQ1HPteULNN3gJkvtOtHs4y_468e4HQcvVVFqrRtROJ5JLZxOseLyAzwFvzYbHNU7d_e32HN66dROK6HXy-pErAdm3abL7jltXKuCbETCLul8c-Vl-ep06ZyushzP6tuHVHesbokLpfN_WR2x6lsAeewW2ES3ZFyGohg_ahzTsMBNRV4zOulidsCgr-LixSZqSjuB6603akhBxLuHdmiE0cb5b0O7-qizs2K0W5TxgILm'
};

export const CITIES = [
  'Sydney, Australia',
  'Melbourne, Australia',
  'Brisbane, Australia',
  'Perth, Australia',
  'Adelaide, Australia',
  'Canberra, Australia',
  'Hobart, Australia',
  'Darwin, Australia',
  'Madrid, España',
  'Barcelona, España',
  'Otro / Internacional'
];

export const WORKSHOPS = [
  { id: 'pintura', name: 'Pintura Profética', description: 'Expresión visual de la fe guiada por el Espíritu.' },
  { id: 'danza', name: 'Danza Litúrgica', description: 'Movimiento y adoración corporal sagrada.' },
  { id: 'oracion', name: 'Meditación Contemplativa', description: 'Silencio profundo y oración reposada en la naturaleza.' },
  { id: 'escritura', name: 'Escritura Creativa', description: 'Diarios espirituales y canalización de la voz interior.' }
];

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
  dietaryRequirements: {
    vegetariana: false,
    vegana: false,
    celiaca: false,
    sinLacteos: false,
    sinFrutosSecos: false
  },
  otherDietary: '',
  pricingTier: 'early',
  paymentType: 'full',
  roomType: 'shared',
  selectedWorkshops: []
};
