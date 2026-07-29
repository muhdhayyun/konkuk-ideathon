import { useNavigate } from 'react-router-dom'
import { INTERNAL_TRENDS, resolveTrendItems } from '../data/trends'
import { useLanguage } from '../../../i18n/LanguageContext'

// 내부 주문 데이터 기반 소셜 프루프 섹션.
// "비슷한 규모·업종 회사들의 최근 주문"과 "전체 인기 품목"을 보여준다.
export default function PeerPicksSection() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { periodLabel, viewer, peerPicks, popularNow } = INTERNAL_TRENDS

  const picks = resolveTrendItems(peerPicks)
  const popular = resolveTrendItems(popularNow)

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">{t('workspace.peerPicks.title')}</h3>
          <p className="mt-1 text-[13px] text-neutral-400">
            {t('workspace.peerPicks.subtitle', { industry: viewer.industry, sizeBand: viewer.sizeBand, periodLabel })}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {picks.map(({ item, orderCount, deltaPct, orderedBy }) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(`/portfolio/${item.id}`)}
            className="rounded-xl border border-neutral-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={`flex h-24 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient} text-4xl`}
            >
              {item.emoji}
            </div>
            <p className="mt-3 text-[15px] font-bold text-neutral-900">{item.name}</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              {t('workspace.peerPicks.orderedBySuffix', { orderedBy })}
            </p>
            <p className="mt-2 text-[13px] font-semibold text-indigo-500">
              {t('workspace.peerPicks.orderCountLine', { periodLabel, count: orderCount })}
              <span className="ml-1.5 rounded bg-rose-50 px-1.5 py-0.5 text-xs font-bold text-rose-500">
                ▲ {deltaPct}%
              </span>
            </p>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-neutral-50 px-5 py-4">
        <p className="text-[13px] font-semibold text-neutral-500">{t('workspace.peerPicks.topPopular')}</p>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5">
          {popular.map(({ item, orderCount }, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/portfolio/${item.id}`)}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-indigo-500"
            >
              <span className="font-bold text-indigo-400">{i + 1}</span>
              {item.emoji} {item.name}
              <span className="text-xs text-neutral-400">{t('workspace.peerPicks.countSuffix', { count: orderCount })}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
