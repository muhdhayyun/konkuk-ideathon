import type { InternalMatch } from '../../../lib/internal-matcher'
import { isInternalAgreed } from '../../../lib/agreementMatch'
import { useLanguage } from '../../../i18n/LanguageContext'

interface InternalMatchesPanelProps {
  matches: InternalMatch[]
  agreement: Set<string>
}

// Panel A — deterministic, local, zero network. Renders synchronously the moment a
// brief is submitted; has no dependency on Panel B (the external Gemini trend module)
// and must never be affected by its loading/failure state.
export default function InternalMatchesPanel({ matches, agreement }: InternalMatchesPanelProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-2">{t('panelA.title')}</p>

      {matches.length === 0 && <p className="text-sm text-slate-500">{t('panelA.empty')}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {matches.map((m) => {
          const agreed = isInternalAgreed(m, agreement)
          return (
            <div key={m.product_name} className="relative rounded-lg border border-slate-200 p-4 flex flex-col gap-2">
              {agreed && (
                <span className="absolute top-2 right-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  {t('agreement.badge')}
                </span>
              )}
              <div className="flex items-start justify-between gap-2 pr-2">
                <p className="font-medium text-slate-900">{m.product_name}</p>
                <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
                  {m.matchScore}
                </span>
              </div>
              <p className="text-sm text-slate-600">{m.reasonWhy}</p>
              <p className="text-xs text-slate-400">
                {t('panelA.metaLine', { timesOrdered: m.timesOrdered, acceptanceRatePct: Math.round(m.acceptanceRate * 100) })}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
