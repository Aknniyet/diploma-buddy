import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

const I18nContext = createContext(null);
const STORAGE_KEY = "kazakhbuddy_language";

function getNestedValue(object, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], object);
}

function formatText(text, values = {}) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text
  );
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem(STORAGE_KEY) || "en"
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo(() => {
    const current = translations[language] || translations.en;

    return {
      language,
      setLanguage,
      t: (key, values) => {
        const text = getNestedValue(current, key) ?? getNestedValue(translations.en, key) ?? key;
        return typeof text === "string" ? formatText(text, values) : text;
      },
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
