import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Language, type TranslationKey } from './translations'

const STORAGE_KEY = 'kokuk-language'

interface LanguageContextValue {
  language: Language
  toggleLanguage: () => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'ko' ? 'ko' : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readInitialLanguage)

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'ko' : 'en'
      window.localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    let text: string = translations[language][key] ?? key
    if (params) {
      for (const [paramKey, value] of Object.entries(params)) {
        text = text.replace(`{${paramKey}}`, String(value))
      }
    }
    return text
  }

  return <LanguageContext.Provider value={{ language, toggleLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
