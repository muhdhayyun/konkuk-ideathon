import type { ClientBrief } from '../types'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { TranslationKey } from '../../../i18n/translations'

interface SummaryReviewProps {
  brief: ClientBrief
  onEditStep: (step: number) => void
  onFindProducts: () => void
}

export default function SummaryReview({ brief, onEditStep, onFindProducts }: SummaryReviewProps) {
  const { t } = useLanguage()
  const optionLabel = (value: string) => t(`option.${value}` as TranslationKey)

  const fields: { label: string; step: number; render: () => string }[] = [
    {
      label: t('summary.clientProfile'),
      step: 1,
      render: () => `${optionLabel(brief.industry)} · ${optionLabel(brief.brandTone)} · ${optionLabel(brief.companySize)}`,
    },
    { label: t('summary.occasion'), step: 2, render: () => optionLabel(brief.occasion) },
    { label: t('summary.recipient'), step: 3, render: () => optionLabel(brief.recipient) },
    {
      label: t('summary.budget'),
      step: 4,
      render: () => `${optionLabel(brief.budgetTier)} ${t('summary.perUnit')} · ${t('summary.qty')} ${brief.quantity}`,
    },
    {
      label: t('summary.emotionalOutcome'),
      step: 5,
      render: () =>
        brief.emotionalOutcomes.map(optionLabel).join(', ') +
        (brief.notes ? ` (${t('summary.notes')}: ${brief.notes})` : ''),
    },
  ]

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('summary.title')}</h2>

      <div className="rounded-lg border border-slate-200 divide-y divide-slate-200">
        {fields.map((field) => (
          <div key={field.step} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs font-medium text-slate-400">{field.label}</p>
              <p className="text-sm text-slate-800">{field.render()}</p>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(field.step)}
              aria-label={`Edit ${field.label}`}
              className="text-slate-400 hover:text-blue-600 px-2"
            >
              ✎
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onFindProducts}
        className="mt-6 w-full px-5 py-3 rounded-md bg-blue-600 text-white text-sm font-medium"
      >
        {t('summary.findProducts')}
      </button>
    </div>
  )
}
