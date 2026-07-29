import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'

export default function EstimateRequestsPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="px-10 pt-2 pb-24">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-neutral-900">{t('workspace.estimateRequests.title')}</h2>
        <button
          type="button"
          onClick={() => navigate('/inquiry')}
          className="rounded-md bg-indigo-50 px-2.5 py-1 text-[13px] font-semibold text-indigo-500 hover:bg-indigo-100"
        >
          {t('workspace.estimateRequests.inquireBtn')}
        </button>

        <div className="ml-auto flex items-center gap-3">
          <select
            aria-label={t('workspace.estimateRequests.statusFilterLabel')}
            className="w-32 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500 outline-none focus:border-indigo-400"
          >
            <option>{t('workspace.estimateRequests.statusAll')}</option>
            <option>{t('workspace.estimateRequests.statusQuoteWaiting')}</option>
            <option>{t('workspace.estimateRequests.statusReplyArrived')}</option>
            <option>{t('workspace.estimateRequests.statusWorkPlanConfirmed')}</option>
            <option>{t('workspace.estimateRequests.statusInProduction')}</option>
          </select>
          <div className="flex min-w-[220px] items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2">
            <input
              placeholder={t('workspace.estimateRequests.searchPlaceholder')}
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-300"
            />
            <span className="text-neutral-300">🔍</span>
          </div>
        </div>
      </div>

      {/* 빈 상태 */}
      <div className="flex flex-col items-center justify-center py-36">
        <span className="text-4xl text-indigo-200">📄</span>
        <p className="mt-4 text-lg font-bold text-neutral-800">{t('workspace.estimateRequests.emptyTitle')}</p>
        <p className="mt-2 text-sm text-neutral-400">{t('workspace.estimateRequests.emptyBody')}</p>
        <button
          type="button"
          onClick={() => navigate('/inquiry')}
          className="mt-8 rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-indigo-600"
        >
          {t('workspace.nav.easyInquiry')}
        </button>
      </div>
    </div>
  )
}
