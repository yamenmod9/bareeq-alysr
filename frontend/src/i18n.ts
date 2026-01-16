import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arCommon from './locales/ar/common.json';
import arAuth from './locales/ar/auth.json';
import arCustomer from './locales/ar/customer.json';
import arMerchant from './locales/ar/merchant.json';
import arErrors from './locales/ar/errors.json';
import arSettings from './locales/ar/settings.json';
import arAdmin from './locales/ar/admin.json';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enCustomer from './locales/en/customer.json';
import enMerchant from './locales/en/merchant.json';
import enErrors from './locales/en/errors.json';
import enSettings from './locales/en/settings.json';
import enAdmin from './locales/en/admin.json';

const resources = {
  ar: {
    common: arCommon,
    auth: arAuth,
    customer: arCustomer,
    merchant: arMerchant,
    errors: arErrors,
    settings: arSettings,
    admin: arAdmin,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    customer: enCustomer,
    merchant: enMerchant,
    errors: enErrors,
    settings: enSettings,
    admin: enAdmin,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    defaultNS: 'common',
    ns: ['common', 'auth', 'customer', 'merchant', 'errors', 'settings', 'admin'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
