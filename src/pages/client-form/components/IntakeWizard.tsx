import type { ClientBrief } from '../types'
import {
  INDUSTRIES,
  BRAND_TONES,
  COMPANY_SIZES,
  OCCASIONS,
  RECIPIENTS,
  BUDGET_TIER_LABELS,
  EMOTIONAL_OUTCOMES,
} from '../constants'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { TranslationKey } from '../../../i18n/translations'
import StepCard from './StepCard'

interface IntakeWizardProps {
  step: number
  brief: ClientBrief
  setBrief: (updater: (prev: ClientBrief) => ClientBrief) => void
  onNext: () => void
  onBack: () => void
  onInstantFill?: () => void
}

const TOTAL_STEPS = 5

function canProceed(step: number, brief: ClientBrief): boolean {
  switch (step) {
    case 1:
      return Boolean(brief.industry && brief.brandTone && brief.companySize)
    case 2:
      return Boolean(brief.occasion)
    case 3:
      return Boolean(brief.recipient)
    case 4:
      return Boolean(brief.budgetTier && brief.quantity > 0)
    case 5:
      return brief.emotionalOutcomes.length > 0
    default:
      return false
  }
}

export default function IntakeWizard({ step, brief, setBrief, onNext, onBack, onInstantFill }: IntakeWizardProps) {
  const { t } = useLanguage()
  const optionLabel = (value: string) => t(`option.${value}` as TranslationKey)

  const toggleEmotionalOutcome = (outcome: string) => {
    setBrief((prev) => ({
      ...prev,
      emotionalOutcomes: prev.emotionalOutcomes.includes(outcome)
        ? prev.emotionalOutcomes.filter((o) => o !== outcome)
        : [...prev.emotionalOutcomes, outcome],
    }))
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-400">
          {t('wizard.stepOf', { current: step, total: TOTAL_STEPS })}
        </p>
        {onInstantFill && (
          <button
            type="button"
            onClick={onInstantFill}
            className="text-xs text-slate-400 hover:text-blue-600 underline"
          >
            {t('wizard.instantFill')}
          </button>
        )}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">{t('wizard.step1.title')}</h2>

          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">{t('wizard.step1.industry')}</p>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((industry) => (
                <StepCard
                  key={industry}
                  label={optionLabel(industry)}
                  selected={brief.industry === industry}
                  onClick={() => setBrief((prev) => ({ ...prev, industry }))}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">{t('wizard.step1.brandTone')}</p>
            <div className="flex flex-wrap gap-2">
              {BRAND_TONES.map((tone) => (
                <StepCard
                  key={tone}
                  label={optionLabel(tone)}
                  selected={brief.brandTone === tone}
                  onClick={() => setBrief((prev) => ({ ...prev, brandTone: tone }))}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">{t('wizard.step1.companySize')}</p>
            <div className="flex flex-wrap gap-2">
              {COMPANY_SIZES.map((size) => (
                <StepCard
                  key={size}
                  label={optionLabel(size)}
                  selected={brief.companySize === size}
                  onClick={() => setBrief((prev) => ({ ...prev, companySize: size }))}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">{t('wizard.step2.title')}</h2>
          <div className="grid grid-cols-2 gap-2">
            {OCCASIONS.map((occasion) => (
              <StepCard
                key={occasion.label}
                label={optionLabel(occasion.label)}
                icon={occasion.icon}
                selected={brief.occasion === occasion.label}
                onClick={() => setBrief((prev) => ({ ...prev, occasion: occasion.label }))}
              />
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">{t('wizard.step3.title')}</h2>
          <div className="flex flex-wrap gap-2">
            {RECIPIENTS.map((recipient) => (
              <StepCard
                key={recipient}
                label={optionLabel(recipient)}
                selected={brief.recipient === recipient}
                onClick={() => setBrief((prev) => ({ ...prev, recipient }))}
              />
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">{t('wizard.step4.title')}</h2>

          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">{t('wizard.step4.perUnit')}</p>
            <div className="flex flex-wrap gap-2">
              {BUDGET_TIER_LABELS.map((tier) => (
                <StepCard
                  key={tier}
                  label={optionLabel(tier)}
                  selected={brief.budgetTier === tier}
                  onClick={() => setBrief((prev) => ({ ...prev, budgetTier: tier }))}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">{t('wizard.step4.quantity')}</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-9 h-9 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                onClick={() =>
                  setBrief((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 5) }))
                }
              >
                −
              </button>
              <span className="w-16 text-center font-medium text-slate-900">{brief.quantity}</span>
              <button
                type="button"
                className="w-9 h-9 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                onClick={() => setBrief((prev) => ({ ...prev, quantity: prev.quantity + 5 }))}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t('wizard.step5.title')}</h2>
            <p className="text-sm text-slate-500">{t('wizard.step5.subtitle')}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {EMOTIONAL_OUTCOMES.map((outcome) => (
              <StepCard
                key={outcome}
                label={optionLabel(outcome)}
                selected={brief.emotionalOutcomes.includes(outcome)}
                onClick={() => toggleEmotionalOutcome(outcome)}
              />
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t('wizard.step5.notes')}</label>
            <textarea
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
              rows={2}
              value={brief.notes ?? ''}
              onChange={(e) => setBrief((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={step === 1}
          className="px-4 py-2 text-sm font-medium text-slate-500 disabled:opacity-0"
        >
          {t('wizard.back')}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed(step, brief)}
          className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-40"
        >
          {step === TOTAL_STEPS ? t('wizard.review') : t('wizard.next')}
        </button>
      </div>
    </div>
  )
}
