import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type Language, type Translations, translations, loadLanguage, saveLanguage } from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  strings: Translations;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "no",
  setLanguage: () => {},
  strings: translations.no,
  isLoaded: false,
});

export function LanguageProvider({
  children,
  onReady,
}: {
  children: React.ReactNode;
  onReady?: () => void;
}) {
  const [language, setLang] = useState<Language>("no");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadLanguage().then((lang) => {
      setLang(lang);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded && onReady) {
      onReady();
    }
  }, [isLoaded]);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    saveLanguage(lang);
  }, []);

  if (!isLoaded) return null;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        strings: translations[language],
        isLoaded,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  return ctx;
}
