import type { Recommendation } from '../types'
import { useLanguage } from '../../../i18n/LanguageContext'
import { isExternalAgreed } from '../../../lib/agreementMatch'

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

interface RecommendationResultsProps {
  recommendations: Recommendation[]
  requestedIds: string[]
  onRequestSample: (rec: Recommendation) => void
  onNotQuite: (rec: Recommendation) => void
  onReject: (rec: Recommendation) => void
  onStartOver: () => void
  // Only passed by AgentFormPage — labels this panel as "Panel B" alongside the
  // internal-matcher's "Panel A". client-form's own usage leaves this unset since its
  // single panel isn't trend-based content.
  panelLabel?: string
  // Cross-reference against Panel A, computed by computeAgreement() — optional so this
  // component works unchanged wherever Feature 1 hasn't been wired in.
  agreement?: Set<string>
}

export default function RecommendationResults({
  recommendations,
  requestedIds,
  onRequestSample,
  onNotQuite,
  onReject,
  onStartOver,
  panelLabel,
  agreement,
}: RecommendationResultsProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {panelLabel && <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-2">{panelLabel}</p>}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">{t('results.title')}</h2>
        <button type="button" onClick={onStartOver} className="text-sm text-slate-500 hover:text-blue-600">
          {t('results.startOver')}
        </button>
      </div>

      {recommendations.length === 0 && <p className="text-sm text-slate-500">{t('results.empty')}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {recommendations.map((rec) => (
          <div key={rec.product.id} className="relative rounded-lg border border-slate-200 p-4 flex flex-col gap-3">
            {agreement && isExternalAgreed(rec, agreement) && (
              <span className="absolute top-2 right-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                {t('agreement.badge')}
              </span>
            )}
            {rec.product.imageUrl ? (
              <img
                src={rec.product.imageUrl}
                alt={rec.product.name}
                className="w-full h-28 rounded-md object-cover bg-slate-100"
              />
            ) : (
              <div className="w-full h-28 rounded-md bg-slate-100 flex items-center justify-center text-slate-300 text-xs">
                image placeholder
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-slate-900">{rec.product.name}</p>
                <p className="text-sm text-slate-500">${rec.product.basePrice} / unit</p>
              </div>
              {rec.product.trendScore >= 75 && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
                  {t('results.trending')} ↑
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600">{rec.reasonWhy}</p>
            <p className="text-xs text-slate-400">
              {t('results.matchScore')}: {rec.matchScore}
            </p>

            {rec.sourceUrls && rec.sourceUrls.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 -mt-1">
                <span className="text-xs text-slate-400">{t('results.sourcedFrom')}</span>
                {rec.sourceUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 underline"
                    title={url}
                  >
                    {hostnameOf(url)}
                  </a>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              <button
                type="button"
                onClick={() => onRequestSample(rec)}
                disabled={requestedIds.includes(rec.product.id)}
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium disabled:opacity-40"
              >
                {requestedIds.includes(rec.product.id) ? t('results.sampleRequested') : t('results.requestSample')}
              </button>
              <button
                type="button"
                onClick={() => onNotQuite(rec)}
                className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-600 text-xs font-medium hover:bg-slate-50"
              >
                {t('results.notQuite')}
              </button>
              <button
                type="button"
                onClick={() => onReject(rec)}
                className="px-3 py-1.5 rounded-md border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50"
              >
                {t('results.reject')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
