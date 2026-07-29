import type { ClientBrief } from '../types'

interface SummaryReviewProps {
  brief: ClientBrief
  onEditStep: (step: number) => void
  onFindProducts: () => void
}

const FIELDS: { label: string; step: number; render: (brief: ClientBrief) => string }[] = [
  {
    label: 'Client profile',
    step: 1,
    render: (b) => `${b.industry} · ${b.brandTone} · ${b.companySize}`,
  },
  { label: 'Occasion', step: 2, render: (b) => b.occasion },
  { label: 'Recipient', step: 3, render: (b) => b.recipient },
  { label: 'Budget', step: 4, render: (b) => `${b.budgetTier} per unit · Qty ${b.quantity}` },
  {
    label: 'Emotional outcome',
    step: 5,
    render: (b) => b.emotionalOutcomes.join(', ') + (b.notes ? ` (Notes: ${b.notes})` : ''),
  },
]

export default function SummaryReview({ brief, onEditStep, onFindProducts }: SummaryReviewProps) {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Review your answers</h2>

      <div className="rounded-lg border border-slate-200 divide-y divide-slate-200">
        {FIELDS.map((field) => (
          <div key={field.step} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs font-medium text-slate-400">{field.label}</p>
              <p className="text-sm text-slate-800">{field.render(brief)}</p>
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
        Find my products
      </button>
    </div>
  )
}
