import { useState } from 'react'
import {
  INDUSTRIES,
  BRAND_TONES,
  COMPANY_SIZES,
  OCCASIONS,
  RECIPIENTS,
  BUDGET_TIER_LABELS,
  EMOTIONAL_OUTCOMES,
  SAMPLE_BRIEF,
} from '../client-form/constants'
import type { ClientBrief } from '../client-form/types'
import { getInternalMatchesDebug } from '../../lib/internal-matcher'

const selectClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500'
const labelClass = 'block text-xs font-medium text-slate-500 mb-1'
const fieldClass = 'flex flex-col'

// Deliberately no design polish — this route exists only so the internal-matcher module
// can be exercised directly against every field combination before it gets wired into
// the real /client-form and /ai-agent result views. Not linked from anywhere in the app nav.
export default function InternalMatcherTestPage() {
  const [brief, setBrief] = useState<ClientBrief>(SAMPLE_BRIEF)
  const [result, setResult] = useState<ReturnType<typeof getInternalMatchesDebug> | null>(null)

  const update = <K extends keyof ClientBrief>(key: K, value: ClientBrief[K]) =>
    setBrief((prev) => ({ ...prev, [key]: value }))

  const toggleOutcome = (outcome: string) => {
    setBrief((prev) => ({
      ...prev,
      emotionalOutcomes: prev.emotionalOutcomes.includes(outcome)
        ? prev.emotionalOutcomes.filter((o) => o !== outcome)
        : [...prev.emotionalOutcomes, outcome],
    }))
  }

  const run = () => setResult(getInternalMatchesDebug(brief))

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-bold text-slate-900">internal-matcher test page</h1>
        <p className="mt-1 text-sm text-slate-500">
          No LLM calls, no network calls — pure computation over <code className="text-xs">data/*.json</code>. Not
          part of the real UI, not linked from any nav.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">ClientBrief</h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className={fieldClass}>
              <label className={labelClass}>industry</label>
              <select className={selectClass} value={brief.industry} onChange={(e) => update('industry', e.target.value)}>
                {INDUSTRIES.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className={fieldClass}>
              <label className={labelClass}>occasion</label>
              <select className={selectClass} value={brief.occasion} onChange={(e) => update('occasion', e.target.value)}>
                {OCCASIONS.map((o) => (
                  <option key={o.label}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className={fieldClass}>
              <label className={labelClass}>budgetTier</label>
              <select className={selectClass} value={brief.budgetTier} onChange={(e) => update('budgetTier', e.target.value)}>
                <option value="">(no filter)</option>
                {BUDGET_TIER_LABELS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className={fieldClass}>
              <label className={labelClass}>brandTone</label>
              <select className={selectClass} value={brief.brandTone} onChange={(e) => update('brandTone', e.target.value)}>
                {BRAND_TONES.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className={fieldClass}>
              <label className={labelClass}>companySize</label>
              <select
                className={selectClass}
                value={brief.companySize}
                onChange={(e) => update('companySize', e.target.value)}
              >
                {COMPANY_SIZES.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className={fieldClass}>
              <label className={labelClass}>recipient</label>
              <select className={selectClass} value={brief.recipient} onChange={(e) => update('recipient', e.target.value)}>
                {RECIPIENTS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className={fieldClass}>
              <label className={labelClass}>quantity</label>
              <input
                type="number"
                className={selectClass}
                value={brief.quantity}
                onChange={(e) => update('quantity', Number(e.target.value))}
              />
            </div>

            <div className={`${fieldClass} col-span-2`}>
              <label className={labelClass}>notes</label>
              <input className={selectClass} value={brief.notes ?? ''} onChange={(e) => update('notes', e.target.value)} />
            </div>
          </div>

          <div className="mt-4">
            <p className={labelClass}>emotionalOutcomes</p>
            <div className="flex flex-wrap gap-2">
              {EMOTIONAL_OUTCOMES.map((outcome) => {
                const active = brief.emotionalOutcomes.includes(outcome)
                return (
                  <button
                    key={outcome}
                    type="button"
                    onClick={() => toggleOutcome(outcome)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {outcome}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={run}
          className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          Run getInternalMatchesDebug(brief)
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">Debug info</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-4">
                <dt className="text-slate-400">usedIndustryFallback</dt>
                <dd className="font-medium text-slate-800">{String(result.usedIndustryFallback)}</dd>
                <dt className="text-slate-400">directIndustryRowCount</dt>
                <dd className="font-medium text-slate-800">{result.directIndustryRowCount}</dd>
                <dt className="text-slate-400">totalRowsConsidered</dt>
                <dd className="font-medium text-slate-800">{result.totalRowsConsidered}</dd>
                <dt className="text-slate-400">candidateIndustries</dt>
                <dd className="col-span-3 font-medium text-slate-800 sm:col-span-1">
                  {result.candidateIndustries.join(', ') || '(none)'}
                </dd>
              </dl>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Matches ({result.matches.length})
              </h2>

              {result.matches.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  No matches — see debug info above for why (likely: budget filter excluded everything, or this
                  industry/occasion combo has no historical rows).
                </p>
              )}

              <div className="space-y-3">
                {result.matches.map((m, i) => (
                  <div key={m.product_name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          <span className="mr-1.5 text-slate-300">#{i + 1}</span>
                          {m.product_name}
                        </p>
                        <p className="text-xs text-slate-400">{m.category}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                        {m.matchScore}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">{m.reasonWhy}</p>

                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                      <dt className="text-slate-400">timesOrdered</dt>
                      <dd className="font-medium text-slate-700">{m.timesOrdered}</dd>
                      <dt className="text-slate-400">acceptanceRate</dt>
                      <dd className="font-medium text-slate-700">{m.acceptanceRate}</dd>
                      <dt className="text-slate-400">avgUnitPrice</dt>
                      <dd className="font-medium text-slate-700">₩{m.avgUnitPrice.toLocaleString()}</dd>
                      <dt className="text-slate-400">mostRecentOrderDate</dt>
                      <dd className="font-medium text-slate-700">{m.mostRecentOrderDate}</dd>
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
