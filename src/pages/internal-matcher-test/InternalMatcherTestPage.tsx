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

// Deliberately unstyled — this route exists only so the internal-matcher module can be
// exercised directly against every field combination before it gets wired into the
// real /client-form and /ai-agent result views. Not linked from anywhere in the app nav.
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
    <div style={{ fontFamily: 'monospace', padding: 16, maxWidth: 900 }}>
      <h1>internal-matcher test page</h1>
      <p>No LLM calls, no network calls — pure computation over data/*.json. Not part of the real UI.</p>

      <fieldset style={{ marginBottom: 12 }}>
        <legend>ClientBrief</legend>

        <label>
          industry:{' '}
          <select value={brief.industry} onChange={(e) => update('industry', e.target.value)}>
            {INDUSTRIES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <br />

        <label>
          occasion:{' '}
          <select value={brief.occasion} onChange={(e) => update('occasion', e.target.value)}>
            {OCCASIONS.map((o) => (
              <option key={o.label}>{o.label}</option>
            ))}
          </select>
        </label>
        <br />

        <label>
          budgetTier:{' '}
          <select value={brief.budgetTier} onChange={(e) => update('budgetTier', e.target.value)}>
            <option value="">(no filter)</option>
            {BUDGET_TIER_LABELS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <br />

        <label>
          brandTone:{' '}
          <select value={brief.brandTone} onChange={(e) => update('brandTone', e.target.value)}>
            {BRAND_TONES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <br />

        <label>
          companySize:{' '}
          <select value={brief.companySize} onChange={(e) => update('companySize', e.target.value)}>
            {COMPANY_SIZES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <br />

        <label>
          recipient:{' '}
          <select value={brief.recipient} onChange={(e) => update('recipient', e.target.value)}>
            {RECIPIENTS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <br />

        <label>
          quantity: <input type="number" value={brief.quantity} onChange={(e) => update('quantity', Number(e.target.value))} />
        </label>
        <br />

        <label>notes: </label>
        <input value={brief.notes ?? ''} onChange={(e) => update('notes', e.target.value)} style={{ width: 300 }} />
        <br />

        <p style={{ marginBottom: 4 }}>emotionalOutcomes:</p>
        {EMOTIONAL_OUTCOMES.map((outcome) => (
          <label key={outcome} style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={brief.emotionalOutcomes.includes(outcome)}
              onChange={() => toggleOutcome(outcome)}
            />
            {outcome}
          </label>
        ))}
      </fieldset>

      <button type="button" onClick={run} style={{ padding: '8px 16px', fontWeight: 'bold' }}>
        Run getInternalMatchesDebug(brief)
      </button>

      {result && (
        <div style={{ marginTop: 16 }}>
          <h2>Debug info</h2>
          <pre style={{ background: '#eee', padding: 8 }}>
            {JSON.stringify(
              {
                candidateIndustries: result.candidateIndustries,
                usedIndustryFallback: result.usedIndustryFallback,
                directIndustryRowCount: result.directIndustryRowCount,
                totalRowsConsidered: result.totalRowsConsidered,
              },
              null,
              2,
            )}
          </pre>

          <h2>Matches ({result.matches.length})</h2>
          {result.matches.length === 0 && <p>No matches — see debug info above for why.</p>}
          {result.matches.map((m) => (
            <pre key={m.product_name} style={{ background: '#f5f5f5', padding: 8, marginBottom: 8 }}>
              {JSON.stringify(m, null, 2)}
            </pre>
          ))}
        </div>
      )}
    </div>
  )
}
