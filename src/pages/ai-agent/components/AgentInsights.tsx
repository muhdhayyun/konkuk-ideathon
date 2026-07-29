import { useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'

interface AgentInsightsProps {
  trendSummary: string
  searchQueriesUsed: string[]
  sourcesUsed: string[]
  usedFallback: boolean
}

export default function AgentInsights({
  trendSummary,
  searchQueriesUsed,
  sourcesUsed,
  usedFallback,
}: AgentInsightsProps) {
  const { t } = useLanguage()
  const [sourcesOpen, setSourcesOpen] = useState(false)

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

        {searchQueriesUsed.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {t('agent.searchedFor')}
            </p>
            {searchQueriesUsed.map((query, i) => (
              <div
                key={query}
                className="flex items-center justify-between gap-3 rounded-lg border-l-4 border-blue-400 bg-slate-50 pl-3 pr-3 py-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-slate-400 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium text-slate-800 truncate">{query}</span>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 whitespace-nowrap">
                  🔍 {t('agent.searchedLive')}
                </span>
              </div>
            ))}
          </div>
        )}

        {sourcesUsed.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setSourcesOpen((v) => !v)}
              className="text-xs text-slate-500 hover:text-blue-600"
            >
              {sourcesOpen ? t('agent.hideSources') : t('agent.sourcesCited', { count: sourcesUsed.length })}
            </button>
            {sourcesOpen && (
              <ul className="mt-2 space-y-1">
                {sourcesUsed.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 underline break-all"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
