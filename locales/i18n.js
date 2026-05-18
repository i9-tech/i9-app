import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import pt from './pt.json';
import en from './en.json';
import es from './es.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es },
};

const getDeviceLanguage = () => {
  const locales = Localization.getLocales();
  
  if (locales && locales.length > 0) {
    const { regionCode, languageCode } = locales[0];
    
    if (regionCode === 'BR') {
      return 'pt';
    }
    
    if (['pt', 'en', 'es'].includes(languageCode)) {
      return languageCode;
    }
  }
  
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;