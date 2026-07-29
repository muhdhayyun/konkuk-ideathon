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
      {usedFallback && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1">
          {t('agent.usingCached')}
        </div>
      )}

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">{t('agent.trendSummary')}</p>
        <p className="text-sm text-blue-900">{trendSummary}</p>
      </div>

      {searchQueriesUsed.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            {t('agent.searchedFor')}
          </p>
          <div className="flex flex-wrap gap-2">
            {searchQueriesUsed.map((query) => (
              <span
                key={query}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
              >
                <span aria-hidden="true">🔍</span>
                {query}
              </span>
            ))}
          </div>
        </div>
      )}

      {sourcesUsed.length > 0 && (
        <div className="mt-3">
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
  )
}
