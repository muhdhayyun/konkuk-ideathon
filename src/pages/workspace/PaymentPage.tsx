import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { translateWorkspaceValue } from '../../i18n/translations'

const TABS = ['주문연동 결제', '추가 결제'] as const

export default function PaymentPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('주문연동 결제')
  const { t, language } = useLanguage()

  return (
    <div className="px-10 pt-2 pb-24">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-neutral-900">{t('workspace.payment.title')}</h2>
        <button
          type="button"
          className="rounded-md bg-indigo-50 px-2.5 py-1 text-[13px] font-semibold text-indigo-500 hover:bg-indigo-100"
        >
          {t('workspace.payment.downloadBankbook')}
        </button>

        <div className="ml-auto flex items-center gap-3">
          <select
            aria-label={t('workspace.estimateRequests.statusFilterLabel')}
            className="w-32 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500 outline-none focus:border-indigo-400"
          >
            <option>{t('workspace.payment.statusAll')}</option>
            <option>{t('workspace.payment.statusPending')}</option>
            <option>{t('workspace.payment.statusCompleted')}</option>
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

      {/* 탭 */}
      <div className="mt-6 flex gap-6 border-b border-neutral-100">
        {TABS.map((tabValue) => (
          <button
            key={tabValue}
            type="button"
            onClick={() => setTab(tabValue)}
            className={`-mb-px border-b-2 pb-2.5 text-[15px] font-semibold transition-colors ${
              tab === tabValue
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-300 hover:text-neutral-500'
            }`}
          >
            {translateWorkspaceValue(tabValue, language)}
          </button>
        ))}
      </div>

      {/* 빈 상태 */}
      <div className="flex flex-col items-center justify-center py-32">
        <span className="text-4xl text-indigo-200">💳</span>
        <p className="mt-4 text-lg font-bold text-neutral-800">{t('workspace.payment.emptyTitle')}</p>
        <p className="mt-2 text-sm text-neutral-400">{t('workspace.payment.emptyBody')}</p>
      </div>
    </div>
  )
}
