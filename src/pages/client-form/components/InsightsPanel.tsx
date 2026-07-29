import type { FeedbackEvent, Product } from '../types'
import { useLanguage } from '../../../i18n/LanguageContext'

interface InsightsPanelProps {
  feedbackLog: FeedbackEvent[]
  catalog: Product[]
}

export default function InsightsPanel({ feedbackLog, catalog }: InsightsPanelProps) {
  const { t } = useLanguage()
  if (feedbackLog.length === 0) return null

  const productsById = new Map(catalog.map((p) => [p.id, p]))
  const tagCounts = new Map<string, { accepted: number; rejected: number }>()

  for (const event of feedbackLog) {
    const product = productsById.get(event.productId)
    if (!product) continue
    const isAccept = event.action === 'accept'
    const isReject = event.action === 'reject' || event.action === 'not_quite'

    for (const tag of product.tags) {
      const counts = tagCounts.get(tag) ?? { accepted: 0, rejected: 0 }
      if (isAccept) counts.accepted += 1
      if (isReject) counts.rejected += 1
      tagCounts.set(tag, counts)
    }
  }

  const rows = Array.from(tagCounts.entries()).sort(
    (a, b) => b[1].accepted + b[1].rejected - (a[1].accepted + a[1].rejected),
  )

  return (
    <div className="max-w-4xl mx-auto px-4 pb-10">
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-900 mb-3">{t('insights.title')}</p>
        <div className="space-y-1.5">
          {rows.map(([tag, counts]) => (
            <div key={tag} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{tag}</span>
              <span className="text-xs text-slate-500">
                <span className="text-emerald-600 font-medium">
                  {counts.accepted} {t('insights.accepted')}
                </span>
                {' · '}
                <span className="text-red-500 font-medium">
                  {counts.rejected} {t('insights.rejected')}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
