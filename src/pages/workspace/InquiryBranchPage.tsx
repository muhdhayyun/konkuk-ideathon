import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import LanguageToggle from '../../components/LanguageToggle'

export default function InquiryBranchPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between px-8 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-lg font-bold text-neutral-900"
        >
          <span className="text-neutral-300">‹</span> {t('workspace.inquiryBranch.headerTitle')}
        </button>
        <LanguageToggle />
      </header>

      <main className="flex flex-col items-center pt-16 pb-24">
        <h1 className="text-xl font-bold text-neutral-900">{t('workspace.inquiryBranch.title')}</h1>
        <p className="mt-2 text-sm text-neutral-500">{t('workspace.inquiryBranch.subtitle')}</p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/estimate-requests/create')}
            className="flex w-64 flex-col items-center rounded-2xl bg-white px-8 py-12 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-7xl">📂</span>
            <p className="mt-8 text-[15px] font-bold text-neutral-900">{t('workspace.inquiryBranch.decidedTitle')}</p>
            <p className="mt-1.5 text-[13px] text-neutral-400">{t('workspace.inquiryBranch.decidedBody')}</p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/inquiry/recommend')}
            className="flex w-64 flex-col items-center rounded-2xl bg-white px-8 py-12 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-7xl">🗂️</span>
            <p className="mt-8 text-[15px] font-bold text-neutral-900">{t('workspace.inquiryBranch.undecidedTitle')}</p>
            <p className="mt-1.5 text-[13px] text-neutral-400">{t('workspace.inquiryBranch.undecidedBody')}</p>
          </button>
        </div>
      </main>
    </div>
  )
}
