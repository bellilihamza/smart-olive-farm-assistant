"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import ar from "../i18n/ar-TN.json";
import fr from "../i18n/fr-FR.json";

type Language = "ar" | "fr";

interface LanguageContextType {
  lang: Language;
  dir: "rtl" | "ltr";
  setLang: (lang: Language) => void;
  t: (path: string) => string;
}

const dictionaries = { ar, fr };

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  dir: "rtl",
  setLang: () => {},
  t: (path: string) => path,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ar");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Language;
    if (stored === "ar" || stored === "fr") {
      setLangState(stored);
      document.documentElement.dir = stored === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = stored;
    } else {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const t = (path: string): string => {
    const keys = path.split(".");
    let current: any = dictionaries[lang];
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to Arabic if missing
        let fallback: any = dictionaries.ar;
        for (const k of keys) {
          if (fallback && fallback[k] !== undefined) fallback = fallback[k];
          else return path;
        }
        return typeof fallback === "string" ? fallback : path;
      }
    }
    return typeof current === "string" ? current : path;
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      <div dir={dir}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
