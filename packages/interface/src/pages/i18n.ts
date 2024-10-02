import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import enTranslation from "../locales/en/translations.json";
import esTranslation from "../locales/es/translations.json";

const resources = {
    en: { translation: enTranslation },
    es: { translation: esTranslation },
  };

i18n
  .use(HttpApi) // Enables loading translation files over HTTP.
  .use(LanguageDetector) // Detects user language.
  .use(initReactI18next) // Initializes the react-i18next plugin.
  .init({
    resources,
    supportedLngs: ["en", "es"], // Languages we're supporting.
    fallbackLng: "en", // Fallback language if user's language isn't supported.
    detection: {
      order: ["cookie", "htmlTag", "localStorage", "path", "subdomain"], // Order of language detection.
      caches: ["cookie"], // Cache the detected language in cookies.
    }
  });

export default i18n;
