import { useLanguage } from '../i18n/LanguageContext'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="text-xs font-medium text-slate-500 hover:text-blue-600 border border-slate-200 rounded-full px-2.5 py-1"
    >
      {language === 'en' ? '한국어' : 'English'}
    </button>
  )
}
