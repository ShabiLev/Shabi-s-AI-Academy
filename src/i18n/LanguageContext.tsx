/* eslint-disable react-refresh/only-export-components -- Provider and its typed hook form one cohesive module. */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { translations } from './translations'
import type { Language, TranslationKey } from './types'

const STORAGE_KEY = 'shabis-ai-academy-language'

interface LanguageContextValue {
  language: Language
  direction: 'rtl' | 'ltr'
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'en' || stored === 'he' ? stored : 'he'
  } catch {
    return 'he'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage)
  const direction: 'rtl' | 'ltr' = language === 'he' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = direction
  }, [direction, language])

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    try { window.localStorage.setItem(STORAGE_KEY, nextLanguage) } catch { /* Persistence is optional. */ }
  }

  const value = useMemo(() => ({
    language, direction, setLanguage, t: (key: TranslationKey) => translations[language][key] ?? translations.he[key],
  }), [direction, language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
