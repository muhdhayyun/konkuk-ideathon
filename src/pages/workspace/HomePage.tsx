import { useNavigate } from 'react-router-dom'
import { USER_NAME } from './data/portfolio'
import PeerPicksSection from './components/PeerPicksSection'
import { useLanguage } from '../../i18n/LanguageContext'
import type { TranslationKey } from '../../i18n/translations'

const STAT_KEYS: TranslationKey[] = [
  'workspace.home.stat.quotes',
  'workspace.home.stat.replies',
  'workspace.home.stat.workPlans',
  'workspace.home.stat.paymentNeeded',
]

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="px-10 pt-6 pb-24">
      <h2 className="text-lg font-bold text-neutral-900">{t('workspace.home.greeting', { name: USER_NAME })}</h2>

      <div className="mt-6 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate('/estimate-requests')}
            className="rounded-xl border border-neutral-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="flex items-center gap-1 text-[13px] font-medium text-neutral-500">
              {t(key)} <span className="text-neutral-300">›</span>
            </p>
            <p className="mt-4 text-3xl font-bold text-neutral-900">0</p>
          </button>
        ))}
      </div>

      <PeerPicksSection />

      {/* 티셔츠 간편주문 배너 */}
      <div className="mt-10 flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-100 bg-gradient-to-r from-white via-slate-50 to-indigo-50 p-8">
        <div>
          <p className="text-lg font-bold text-neutral-900">{t('workspace.home.bannerTitle')}</p>
          <p className="mt-1.5 text-sm text-neutral-500">{t('workspace.home.bannerBody')}</p>
        </div>
        <div className="hidden items-center gap-3 text-4xl sm:flex">
          <span>👕</span>
          <span className="rotate-12">👕</span>
          <span className="-rotate-6">👕</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/portfolio/1208')}
          className="rounded-lg border border-indigo-300 bg-white px-5 py-2.5 text-sm font-bold text-indigo-500 transition-colors hover:bg-indigo-50"
        >
          {t('workspace.home.bannerCta')}
        </button>
      </div>
    </div>
  )
}
