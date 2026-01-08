"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { isLanguage, languageOptions, translate, type Language } from "@/lib/translations"

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const STORAGE_KEY = "antique-app-language"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
    if (stored && isLanguage(stored)) {
      setLanguageState(stored)
      return
    }

    if (typeof navigator !== "undefined") {
      const browserLang = navigator.language.split("-")[0]
      if (isLanguage(browserLang)) {
        setLanguageState(browserLang)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language)
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = language
    }
  }, [language])

  const value = useMemo(() => {
    return {
      language,
      setLanguage: setLanguageState,
      t: (key: string, params?: Record<string, string | number>) =>
        translate(language, key, params),
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export function useLanguageOptions() {
  return languageOptions
}
