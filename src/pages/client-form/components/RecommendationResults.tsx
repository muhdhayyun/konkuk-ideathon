import { useState } from 'react'
import type { Recommendation } from '../types'
import { useLanguage } from '../../../i18n/LanguageContext'

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
  // Only the live /ai-agent passes this — the local matcher never has trend evidence
  // to disclose, so the local /client-form wizard renders neither section below.
  showTrendEvidence?: boolean
}

function TrendEvidence({ rec }: { rec: Recommendation }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const trends = rec.contributingTrends ?? []

  if (trends.length === 0) {
    return <p className="text-xs text-slate-400 -mt-1">{t('results.noTrendSignal')}</p>
  }

  return (
    <div className="-mt-1">
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs text-slate-500 hover:text-blue-600">
        {open ? t('results.hideTrending') : t('results.whyTrending')}
      </button>
      {open && (
        <div className="mt-1.5 space-y-1">
          {trends.map((trend) => (
            <div key={trend.canonicalTopic} className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">{trend.canonicalTopic}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">{t('trendPanel.sourceCount', { count: trend.sourceCount })}</span>
              <a
                href={trend.matchedFrom[0]?.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline truncate"
              >
                {hostnameOf(trend.matchedFrom[0]?.sourceUrl ?? '')}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RecommendationResults({
  recommendations,
  requestedIds,
  onRequestSample,
  onNotQuite,
  onReject,
  onStartOver,
  showTrendEvidence = false,
}: RecommendationResultsProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">{t('results.title')}</h2>
        <button type="button" onClick={onStartOver} className="text-sm text-slate-500 hover:text-blue-600">
          {t('results.startOver')}
        </button>
      </div>

      {recommendations.length === 0 && <p className="text-sm text-slate-500">{t('results.empty')}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {recommendations.map((rec) => (
          <div key={rec.product.id} className="rounded-lg border border-slate-200 p-4 flex flex-col gap-3">
            <div className="w-full h-28 rounded-md bg-slate-100 flex items-center justify-center text-slate-300 text-xs">
              image placeholder
            </div>

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

            {showTrendEvidence && <TrendEvidence rec={rec} />}

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
