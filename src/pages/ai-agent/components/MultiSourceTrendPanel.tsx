import { useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { MatchedTrend } from '../../../lib/trendMatcher'
import type { TrendSource } from '../../../types/trend'

interface MultiSourceTrendPanelProps {
  trendSummary: string
  matchedTrends: MatchedTrend[]
  usedFallback: boolean
}

const SOURCE_LABEL: Record<TrendSource, string> = {
  google_trends: 'Google Trends',
  youtube: 'YouTube',
  naver: 'Naver',
  ruliweb: 'Ruliweb',
}

const SOURCE_ICON: Record<TrendSource, string> = {
  google_trends: '📈',
  youtube: '▶️',
  naver: 'N',
  ruliweb: 'R',
}

function TrendCard({ trend, rank }: { trend: MatchedTrend; rank: number }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const sources = [...new Set(trend.matchedFrom.map((m) => m.source))]

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50"
      >
        <span className="text-xs font-mono text-slate-400 w-5 shrink-0">{String(rank).padStart(2, '0')}</span>
        <span className="text-sm font-medium text-slate-900 flex-1 min-w-0 truncate">{trend.canonicalTopic}</span>
        <span className="shrink-0 flex items-center gap-1">
          {sources.map((s) => (
            <span
              key={s}
              title={SOURCE_LABEL[s]}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600"
            >
              {SOURCE_ICON[s]}
            </span>
          ))}
        </span>
        <span className="shrink-0 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full px-2 py-0.5">
          {trend.compositeScore}
        </span>
        <span className="shrink-0 text-xs text-slate-400">
          {t('trendPanel.sourceCount', { count: sources.length })}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-3 py-2 space-y-1.5 bg-slate-50">
          {trend.matchedFrom.map((m, i) => (
            <div key={`${m.source}-${i}`} className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-1.5 py-0.5 shrink-0">
                {SOURCE_ICON[m.source]} {SOURCE_LABEL[m.source]}
              </span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  m.confidence === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {m.confidence === 'verified' ? t('trendPanel.verified') : t('trendPanel.unverified')}
              </span>
              <a
                href={m.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline truncate min-w-0"
                title={m.sourceUrl}
              >
                {m.topic}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MultiSourceTrendPanel({
  trendSummary,
  matchedTrends,
  usedFallback,
}: MultiSourceTrendPanelProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <div className="rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <h2 className="text-xl font-bold text-slate-900">
            {t('agent.radarTitle')}
            <span className="text-red-500">.</span>
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${
              usedFallback ? 'bg-amber-100 text-amber-800' : 'bg-slate-900 text-white'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${usedFallback ? 'bg-amber-600' : 'bg-emerald-400'}`}
              aria-hidden="true"
            />
            {usedFallback ? t('agent.cachedBadge') : t('agent.liveBadge')}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-4">{trendSummary}</p>

        {matchedTrends.length > 0 ? (
          <div className="space-y-2">
            {matchedTrends.slice(0, 8).map((trend, i) => (
              <TrendCard key={trend.canonicalTopic} trend={trend} rank={i + 1} />
            ))}
          </div>
        ) : (
          !usedFallback && <p className="text-xs text-slate-400">{t('trendPanel.noSignal')}</p>
        )}
      </div>
    </div>
  )
}
