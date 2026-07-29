import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { INTERNAL_TRENDS, buildTrendReport, type EvidenceSource } from './data/trends'
import { USER_NAME } from './data/portfolio'
import { useLanguage } from '../../i18n/LanguageContext'
import { translateWorkspaceValue } from '../../i18n/translations'
import LanguageToggle from '../../components/LanguageToggle'

// 문의 완료 후 제공되는 발주 근거 리포트.
// 담당자가 내부 보고에 그대로 쓸 수 있도록 문서 형태로 구성한다.

const SOURCE_STYLE: Record<EvidenceSource, string> = {
  '내부 주문 데이터': 'bg-indigo-50 text-indigo-500',
  유튜브: 'bg-rose-50 text-rose-500',
  '네이버 데이터랩': 'bg-emerald-50 text-emerald-600',
}

interface ReportState {
  title?: string
  company?: string
  products?: string[]
}

export default function TrendReportPage() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: ReportState }
  const [copied, setCopied] = useState(false)
  const { t, language } = useLanguage()

  const title = location.state?.title || t('workspace.trendReport.defaultTitle')
  const company = location.state?.company || ''
  const productNames = location.state?.products?.length
    ? location.state.products
    : ['반팔 티셔츠']

  const reports = useMemo(() => productNames.map(buildTrendReport), [productNames])
  const { viewer, periodLabel } = INTERNAL_TRENDS
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const copyReport = async () => {
    const lines = [
      t('workspace.trendReport.clipboardHeader', { title }),
      `${company ? `${company} · ` : ''}${today} · 브랜드부스트 트렌드 데이터 기반`,
      '',
      ...reports.flatMap((r) => [
        `■ ${r.productName}`,
        ...r.evidence.map(
          (e) =>
            `- (${e.source}) ${e.headline}: ${e.detail}${
              e.deltaPct != null ? ` (▲${e.deltaPct}%)` : ''
            }`,
        ),
        `→ ${r.verdict}`,
        '',
      ]),
    ]
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between px-8 py-6 print:hidden">
        <button
          type="button"
          onClick={() => navigate('/estimate-requests')}
          className="flex items-center gap-2 text-lg font-bold text-neutral-400"
        >
          <span className="text-neutral-300">‹</span> {t('workspace.trendReport.backToOrders')}
        </button>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button
            type="button"
            onClick={copyReport}
            className="rounded-lg border border-indigo-300 bg-white px-4 py-2.5 text-sm font-bold text-indigo-500 hover:bg-indigo-50"
          >
            {copied ? t('workspace.trendReport.copiedBtn') : t('workspace.trendReport.copyBtn')}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-600"
          >
            {t('workspace.trendReport.printBtn')}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl pb-24">
        <div className="rounded-2xl bg-white p-10 shadow-sm">
          <p className="text-[13px] font-semibold text-indigo-500">BRANDBOOST TREND REPORT</p>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">{t('workspace.trendReport.h1Fixed')}</h1>
          <p className="mt-1.5 text-[15px] font-semibold text-neutral-700">{title}</p>
          <p className="mt-3 text-[13px] leading-relaxed text-neutral-400">
            {company && (
              <>
                {t('workspace.trendReport.metaCompanyUser', { company, name: USER_NAME })}
                <br />
              </>
            )}
            {t('workspace.trendReport.metaGenerated', {
              date: today,
              industry: viewer.industry,
              sizeBand: viewer.sizeBand,
              period: periodLabel,
            })}
          </p>

          {reports.map((r) => (
            <section key={r.productName} className="mt-8 border-t border-neutral-100 pt-8">
              <div className="flex items-center gap-3">
                {r.item && (
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${r.item.gradient} text-2xl`}
                  >
                    {r.item.emoji}
                  </span>
                )}
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">{r.productName}</h2>
                  {r.item && (
                    <p className="text-xs text-neutral-400">
                      {t('workspace.trendReport.itemMetaLine', {
                        category: translateWorkspaceValue(r.item.category, language),
                        price: r.item.unitPrice.toLocaleString(),
                        basis: r.item.priceBasis,
                        leadTime: r.item.leadTime,
                      })}
                    </p>
                  )}
                </div>
              </div>

              <ul className="mt-5 space-y-3">
                {r.evidence.map((e) => (
                  <li
                    key={`${e.source}-${e.headline}`}
                    className="flex items-start gap-3 rounded-xl border border-neutral-100 p-4"
                  >
                    <span
                      className={`mt-0.5 shrink-0 rounded px-2 py-1 text-xs font-bold whitespace-nowrap ${SOURCE_STYLE[e.source]}`}
                    >
                      {e.source}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-800">
                        {e.headline}
                        {e.deltaPct != null && (
                          <span className="ml-2 rounded bg-rose-50 px-1.5 py-0.5 text-xs font-bold text-rose-500">
                            ▲ {e.deltaPct}%
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[13px] text-neutral-500">{e.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-4 rounded-xl bg-indigo-50/60 p-4 text-[13px] leading-relaxed font-medium text-indigo-900">
                💡 {r.verdict}
              </p>
            </section>
          ))}

          <p className="mt-10 border-t border-neutral-100 pt-5 text-xs leading-relaxed text-neutral-300">
            {t('workspace.trendReport.footerDisclaimer')}
          </p>
        </div>
      </main>
    </div>
  )
}
