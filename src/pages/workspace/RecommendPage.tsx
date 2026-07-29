import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import { translateWorkspaceValue, type TranslationKey } from '../../i18n/translations'
import LanguageToggle from '../../components/LanguageToggle'
import type { ClientBrief, Recommendation } from '../client-form/types'
import {
  INDUSTRIES,
  OCCASIONS,
  RECIPIENTS,
  BUDGET_TIER_LABELS,
  EMOTIONAL_OUTCOMES,
  SAMPLE_BRIEF,
} from '../client-form/constants'
import { products } from '../client-form/data/products'
import { getNotQuiteRecommendations, BUDGET_TIERS } from '../client-form/lib/matcher'
import InternalMatchesPanel from '../client-form/components/InternalMatchesPanel'
import RecommendationResults from '../client-form/components/RecommendationResults'
import ClarifySuggestions from '../ai-agent/components/ClarifySuggestions'
import AgentInsights from '../ai-agent/components/AgentInsights'
import { getInternalMatches, type InternalMatch } from '../../lib/internal-matcher'
import { computeAgreement } from '../../lib/agreementMatch'
import { isBriefVague } from '../../lib/clarifyHeuristic'

const MODES = ['하나의 제품 추천', '키트 구성 추천', '행사 준비 추천'] as const

const PRIORITY_CHIPS = [
  '합리적인 가격',
  '좋은 품질',
  '빠른 제작',
  '소량제작 가능',
  '다양한 선택지',
  '디자인 감도',
  '친환경 제품',
  '완성도 있는 패키징',
]

const HINTS = [
  '입력한 배송 일정에 맞는 제품을 우선 추천해드려요 🗓️',
  '우선순위를 두 가지 모두 선택하면 더 정확한 추천이 가능해요',
  '사용 목적과 컨셉이 자세할수록 추천이 정확해져요',
]

// Preset buckets mapped to a representative quantity — internal-matcher.ts doesn't
// bucket by exact quantity today, so any reasonable representative value is safe.
const QUANTITY_PRESETS: { label: string; value: number }[] = [
  { label: 'qty.under50', value: 25 },
  { label: 'qty.50-99', value: 75 },
  { label: 'qty.100-249', value: 150 },
  { label: 'qty.250-499', value: 375 },
  { label: 'qty.500+', value: 750 },
]

const NOTE_SUGGESTION_KEYS = [
  'practical',
  'memorable',
  'ecoFriendly',
  'premiumValue',
  'brandFit',
  'repeatOrder',
] as const

// Fields the AI agent + internal DB don't actually read (agent-recommend.ts's prompt
// never references brandTone/companySize) — defaulted silently rather than asked, per
// explicit decision, to keep this form's scope close to /recommend's original length.
const DEFAULT_BRAND_TONE = 'Modern/Minimal'
const DEFAULT_COMPANY_SIZE = 'Mid-size (50-500)'

const EMPTY_BRIEF: ClientBrief = {
  industry: '',
  brandTone: DEFAULT_BRAND_TONE,
  companySize: DEFAULT_COMPANY_SIZE,
  occasion: '',
  recipient: '',
  budgetTier: '',
  quantity: 100,
  emotionalOutcomes: [],
  notes: '',
}

interface AgentRecommendResponse {
  recommendations: Recommendation[]
  trendSummary: string
  searchQueriesUsed: string[]
  sourcesUsed: string[]
  usedFallback: boolean
}

interface ClarifyResponse {
  isVague: boolean
  suggestions: { field: string; examples: string[] }[]
}

type View = 'form' | 'clarify' | 'results'

function selectableClass(active: boolean): string {
  return `rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
    active
      ? 'border-indigo-400 bg-indigo-50 text-indigo-500'
      : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'
  }`
}

export default function RecommendPage() {
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const [mode, setMode] = useState<(typeof MODES)[number] | null>(null)
  const [brief, setBrief] = useState<ClientBrief>(EMPTY_BRIEF)
  const [flexibleQuantity, setFlexibleQuantity] = useState(false)
  const [quantityOther, setQuantityOther] = useState(false)
  const [budgetOther, setBudgetOther] = useState(false)
  const [customBudgetValue, setCustomBudgetValue] = useState('')
  const [desiredDate, setDesiredDate] = useState('')
  const [fixedDeadline, setFixedDeadline] = useState(false)
  const [priorities, setPriorities] = useState<string[]>([])
  const [hintIndex] = useState(() => Math.floor(Date.now() / 10000) % HINTS.length)

  // What kind of product would you like recommended? — button-first suggestions that
  // compose into the free-text "wish", same pattern as ClarifySuggestions: pick one or
  // more, or use "Other" to write something the presets don't cover.
  const [wish, setWish] = useState('')
  const [noteSelected, setNoteSelected] = useState<Set<string>>(new Set())
  const [noteOtherEnabled, setNoteOtherEnabled] = useState(false)
  const [noteOtherText, setNoteOtherText] = useState('')

  const [view, setView] = useState<View>('form')

  const [internalMatches, setInternalMatches] = useState<InternalMatch[]>([])
  const [externalLoading, setExternalLoading] = useState(false)
  const [loadingSeconds, setLoadingSeconds] = useState(0)
  const [agentResult, setAgentResult] = useState<AgentRecommendResponse | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [excludedIds, setExcludedIds] = useState<string[]>([])
  const [requestedIds, setRequestedIds] = useState<string[]>([])

  const [clarifyLoading, setClarifyLoading] = useState(false)
  const [clarifySuggestions, setClarifySuggestions] = useState<string[]>([])

  useEffect(() => {
    if (view !== 'results' || !externalLoading) return
    setLoadingSeconds(0)
    const interval = setInterval(() => setLoadingSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [view, externalLoading])

  const valid =
    brief.industry !== '' &&
    brief.occasion !== '' &&
    brief.recipient !== '' &&
    brief.budgetTier !== '' &&
    brief.quantity > 0 &&
    brief.emotionalOutcomes.length > 0 &&
    wish.trim() !== ''

  const togglePriority = (chip: string) =>
    setPriorities((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : prev.length < 2 ? [...prev, chip] : prev,
    )

  const toggleEmotionalOutcome = (outcome: string) =>
    setBrief((prev) => ({
      ...prev,
      emotionalOutcomes: prev.emotionalOutcomes.includes(outcome)
        ? prev.emotionalOutcomes.filter((o) => o !== outcome)
        : [...prev.emotionalOutcomes, outcome],
    }))

  const selectQuantityPreset = (value: number) => {
    setQuantityOther(false)
    setBrief((prev) => ({ ...prev, quantity: value }))
  }

  const toggleQuantityOther = () => {
    setQuantityOther(true)
    setBrief((prev) => ({ ...prev, quantity: 0 }))
  }

  // Custom budget still has to resolve to one of BUDGET_TIER_LABELS so the internal
  // matcher's exact-label lookup (matchesBudgetTier / budgetRangeKrw) keeps working —
  // the precise number the user typed is preserved separately in notes for Gemini.
  const handleCustomBudgetChange = (raw: string) => {
    setCustomBudgetValue(raw)
    const amount = Number(raw)
    if (!raw || Number.isNaN(amount)) {
      setBrief((prev) => ({ ...prev, budgetTier: '' }))
      return
    }
    const tier = BUDGET_TIERS.find((t) => amount >= t.min && amount < t.max) ?? BUDGET_TIERS[BUDGET_TIERS.length - 1]
    setBrief((prev) => ({ ...prev, budgetTier: tier.label }))
  }

  const toggleBudgetOther = () => {
    const next = !budgetOther
    setBudgetOther(next)
    if (next) {
      handleCustomBudgetChange(customBudgetValue)
    } else {
      setBrief((prev) => ({ ...prev, budgetTier: '' }))
    }
  }

  const rebuildWish = (nextSelected: Set<string>, nextOtherEnabled: boolean, nextOtherText: string) => {
    const parts = [...nextSelected].map((key) => t(`workspace.recommend.noteSuggestion.${key}` as TranslationKey))
    if (nextOtherEnabled && nextOtherText.trim()) parts.push(nextOtherText.trim())
    setWish(parts.join('. '))
  }

  const toggleNoteSuggestion = (key: string) => {
    const next = new Set(noteSelected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setNoteSelected(next)
    rebuildWish(next, noteOtherEnabled, noteOtherText)
  }

  const toggleNoteOther = () => {
    const next = !noteOtherEnabled
    setNoteOtherEnabled(next)
    rebuildWish(noteSelected, next, noteOtherText)
  }

  const handleNoteOtherTextChange = (text: string) => {
    setNoteOtherText(text)
    rebuildWish(noteSelected, noteOtherEnabled, text)
  }

  // Folds the /recommend-style optional extras (priorities, delivery date, request
  // mode) into the free-text notes the AI actually reads — combining both question
  // sets meaningfully rather than collecting answers the backend then throws away.
  const buildComposedBrief = (): ClientBrief => {
    const extras = [
      priorities.length > 0
        ? `Priorities: ${priorities.map((p) => translateWorkspaceValue(p, language)).join(', ')}.`
        : '',
      flexibleQuantity ? 'Quantity is flexible depending on budget.' : '',
      desiredDate
        ? `Preferred delivery date: ${desiredDate}${fixedDeadline ? ' (fixed, cannot be adjusted)' : ''}.`
        : '',
      mode ? `Request type: ${translateWorkspaceValue(mode, language)}.` : '',
    ]
      .filter(Boolean)
      .join(' ')

    return { ...brief, notes: [wish.trim(), extras].filter(Boolean).join(' ') }
  }

  const submitForRecommendations = async (currentBrief: ClientBrief) => {
    setExcludedIds([])
    setRequestedIds([])
    setInternalMatches(getInternalMatches(currentBrief))
    setAgentResult(null)
    setRecommendations([])
    setView('results')
    setExternalLoading(true)

    try {
      const res = await fetch('/api/agent-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: currentBrief, language }),
      })
      const data = (await res.json()) as AgentRecommendResponse
      setAgentResult(data)
      setRecommendations(data.recommendations)
    } catch {
      setAgentResult({
        recommendations: [],
        trendSummary: t('agent.somethingWentWrong'),
        searchQueriesUsed: [],
        sourcesUsed: [],
        usedFallback: true,
      })
      setRecommendations([])
    } finally {
      setExternalLoading(false)
    }
  }

  const handleSubmit = async () => {
    const composedBrief = buildComposedBrief()

    if (!isBriefVague(composedBrief)) {
      await submitForRecommendations(composedBrief)
      return
    }

    setBrief(composedBrief)
    setView('clarify')
    setClarifyLoading(true)
    setClarifySuggestions([])

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)
      const res = await fetch('/api/clarify-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: composedBrief, language }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data = (await res.json()) as ClarifyResponse
      setClarifySuggestions(data.suggestions.flatMap((s) => s.examples).slice(0, 3))
    } catch {
      setClarifySuggestions([])
    } finally {
      setClarifyLoading(false)
    }
  }

  const handleContinueFromClarify = () => {
    void submitForRecommendations(brief)
  }

  const handleRequestSample = (rec: Recommendation) => {
    setRequestedIds((prev) => [...prev, rec.product.id])
  }

  const handleReject = (rec: Recommendation) => {
    setRecommendations((prev) => prev.filter((r) => r.product.id !== rec.product.id))
  }

  const handleNotQuite = (rec: Recommendation) => {
    const nextExcluded = [...excludedIds, rec.product.id]
    const next = getNotQuiteRecommendations(brief, products, rec.product, excludedIds, language)
    setExcludedIds(nextExcluded)
    setRecommendations(next)
  }

  const handleStartOver = () => {
    setMode(null)
    setBrief(EMPTY_BRIEF)
    setWish('')
    setNoteSelected(new Set())
    setNoteOtherEnabled(false)
    setNoteOtherText('')
    setFlexibleQuantity(false)
    setQuantityOther(false)
    setBudgetOther(false)
    setCustomBudgetValue('')
    setDesiredDate('')
    setFixedDeadline(false)
    setPriorities([])
    setExcludedIds([])
    setRequestedIds([])
    setAgentResult(null)
    setRecommendations([])
    setInternalMatches([])
    setClarifySuggestions([])
    setView('form')
  }

  // Same ClientBrief values as /ai-agent's "Instant fill (testing)" — this page just
  // has extra fields SAMPLE_BRIEF doesn't cover (mode, wish text), filled with
  // reasonable defaults so the form is immediately submittable.
  const handleInstantFill = () => {
    if (mode === null) setMode(MODES[0])
    setBrief({ ...SAMPLE_BRIEF, brandTone: DEFAULT_BRAND_TONE, companySize: DEFAULT_COMPANY_SIZE })
    setQuantityOther(true)
    setBudgetOther(false)
    setCustomBudgetValue('')
    setNoteSelected(new Set())
    setNoteOtherEnabled(true)
    const sampleWish = 'Need something modern and reusable for a tech conference booth.'
    setNoteOtherText(sampleWish)
    setWish(sampleWish)
  }

  const loadingStages = [t('agent.loading1'), t('agent.loading2'), t('agent.loading3')]
  const loadingStage = loadingSeconds < 2 ? 0 : loadingSeconds < 8 ? 1 : 2
  const agreement =
    agentResult && !externalLoading ? computeAgreement(internalMatches, recommendations) : new Set<string>()

  if (view === 'clarify') {
    return (
      <div className="min-h-screen bg-neutral-50">
        <ClarifySuggestions
          loading={clarifyLoading}
          suggestions={clarifySuggestions}
          notes={brief.notes ?? ''}
          onNotesChange={(notes) => setBrief((prev) => ({ ...prev, notes }))}
          onContinue={handleContinueFromClarify}
        />
      </div>
    )
  }

  if (view === 'results') {
    return (
      <div className="min-h-screen bg-neutral-50">
        <InternalMatchesPanel matches={internalMatches} agreement={agreement} />

        {externalLoading && (
          <div className="max-w-2xl mx-auto py-10 px-4 text-center">
            <div className="animate-pulse text-slate-500">{loadingStages[loadingStage]}</div>
            <p className="mt-2 text-xs text-slate-400">{t('agent.elapsed', { seconds: loadingSeconds })}</p>
          </div>
        )}

        {!externalLoading && agentResult && (
          <>
            <AgentInsights
              trendSummary={agentResult.trendSummary}
              searchQueriesUsed={agentResult.searchQueriesUsed}
              sourcesUsed={agentResult.sourcesUsed}
              usedFallback={agentResult.usedFallback}
            />
            <RecommendationResults
              recommendations={recommendations}
              requestedIds={requestedIds}
              onRequestSample={handleRequestSample}
              onNotQuite={handleNotQuite}
              onReject={handleReject}
              onStartOver={handleStartOver}
              panelLabel={t('panelB.title')}
              agreement={agreement}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between px-8 py-6">
        <button
          type="button"
          onClick={() => navigate('/inquiry')}
          className="flex items-center gap-2 text-lg font-bold text-neutral-400"
        >
          <span className="text-neutral-300">‹</span> {t('workspace.recommend.backBtn')}
        </button>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label={t('workspace.recommend.closeAriaLabel')}
            className="text-2xl text-neutral-400"
          >
            ✕
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl pb-32">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleInstantFill}
            className="text-xs text-neutral-400 underline hover:text-indigo-500"
          >
            {t('wizard.instantFill')}
          </button>
        </div>

        <h1 className="text-center text-xl font-bold text-neutral-900">
          {mode === null ? t('workspace.recommend.titleModeSelect') : t('workspace.recommend.titleQuestions')}
        </h1>

        <div className="mt-8 flex justify-center gap-3">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg border px-5 py-3 text-sm font-semibold transition-colors ${
                mode === m
                  ? 'border-indigo-400 bg-white text-indigo-500'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {translateWorkspaceValue(m, language)}
            </button>
          ))}
        </div>

        {mode !== null && (
          <>
            <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900">{t('workspace.recommend.requiredSectionTitle')}</h3>

              <p className="mt-6 text-sm font-semibold text-neutral-800">
                {t('summary.clientProfile')}<span className="text-rose-500">*</span>
              </p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {INDUSTRIES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBrief((prev) => ({ ...prev, industry: v }))}
                    className={selectableClass(brief.industry === v)}
                  >
                    {t(`option.${v}` as TranslationKey)}
                  </button>
                ))}
              </div>

              <p className="mt-8 text-sm font-semibold text-neutral-800">
                {t('summary.occasion')}<span className="text-rose-500">*</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {OCCASIONS.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setBrief((prev) => ({ ...prev, occasion: o.label }))}
                    className={selectableClass(brief.occasion === o.label)}
                  >
                    {o.icon} {t(`option.${o.label}` as TranslationKey)}
                  </button>
                ))}
              </div>

              <p className="mt-8 text-sm font-semibold text-neutral-800">
                {t('summary.recipient')}<span className="text-rose-500">*</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {RECIPIENTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBrief((prev) => ({ ...prev, recipient: v }))}
                    className={selectableClass(brief.recipient === v)}
                  >
                    {t(`option.${v}` as TranslationKey)}
                  </button>
                ))}
              </div>

              <p className="mt-8 text-sm font-semibold text-neutral-800">
                {t('workspace.recommend.quantityQuestion')}<span className="text-rose-500">*</span>
              </p>
              <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.recommend.quantityHint')}</p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {QUANTITY_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => selectQuantityPreset(preset.value)}
                    className={selectableClass(!quantityOther && brief.quantity === preset.value)}
                  >
                    {t(`option.${preset.label}` as TranslationKey)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={toggleQuantityOther}
                  className={selectableClass(quantityOther)}
                >
                  {t('workspace.recommend.customAmountLabel')}
                </button>
              </div>
              {quantityOther && (
                <input
                  value={brief.quantity || ''}
                  onChange={(e) => setBrief((prev) => ({ ...prev, quantity: Number(e.target.value) || 0 }))}
                  placeholder={t('workspace.recommend.customAmountPlaceholder')}
                  inputMode="numeric"
                  autoFocus
                  className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
                />
              )}
              <label className="mt-3 flex items-center justify-end gap-2 text-[13px] text-neutral-500">
                <input
                  type="checkbox"
                  checked={flexibleQuantity}
                  onChange={(e) => setFlexibleQuantity(e.target.checked)}
                  className="h-4 w-4 accent-indigo-500"
                />
                {t('workspace.recommend.flexibleQuantityLabel')}
              </label>

              <p className="mt-8 text-sm font-semibold text-neutral-800">
                {t('summary.budget')}<span className="text-rose-500">*</span>
              </p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {BUDGET_TIER_LABELS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setBudgetOther(false)
                      setBrief((prev) => ({ ...prev, budgetTier: v }))
                    }}
                    className={selectableClass(!budgetOther && brief.budgetTier === v)}
                  >
                    {t(`option.${v}` as TranslationKey)}
                  </button>
                ))}
                <button type="button" onClick={toggleBudgetOther} className={selectableClass(budgetOther)}>
                  {t('workspace.recommend.customAmountLabel')}
                </button>
              </div>
              {budgetOther && (
                <input
                  value={customBudgetValue}
                  onChange={(e) => handleCustomBudgetChange(e.target.value)}
                  placeholder={t('workspace.recommend.customAmountPlaceholder')}
                  inputMode="numeric"
                  autoFocus
                  className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
                />
              )}

              <p className="mt-8 text-sm font-semibold text-neutral-800">
                {t('summary.emotionalOutcome')}<span className="text-rose-500">*</span>
              </p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {EMOTIONAL_OUTCOMES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleEmotionalOutcome(v)}
                    className={selectableClass(brief.emotionalOutcomes.includes(v))}
                  >
                    {t(`option.${v}` as TranslationKey)}
                  </button>
                ))}
              </div>

              <p className="mt-8 text-sm font-semibold text-neutral-800">
                {t('workspace.recommend.wishQuestion')}<span className="text-rose-500">*</span>
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {NOTE_SUGGESTION_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleNoteSuggestion(key)}
                    className={selectableClass(noteSelected.has(key))}
                  >
                    {t(`workspace.recommend.noteSuggestion.${key}` as TranslationKey)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={toggleNoteOther}
                  className={`col-span-full ${selectableClass(noteOtherEnabled)}`}
                >
                  {t('clarify.otherOption')}
                </button>
              </div>
              {noteOtherEnabled && (
                <textarea
                  value={noteOtherText}
                  onChange={(e) => handleNoteOtherTextChange(e.target.value)}
                  rows={3}
                  autoFocus
                  placeholder={t('clarify.otherPlaceholder')}
                  className="mt-3 w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
                />
              )}
              {wish && <p className="mt-2 text-[13px] text-neutral-400">{wish}</p>}
            </section>

            <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900">{t('workspace.recommend.optionalSectionTitle')}</h3>

              <p className="mt-6 text-sm font-semibold text-neutral-800">
                {t('workspace.recommend.desiredDateQuestion')}{' '}
                <span className="font-normal text-neutral-400">{t('workspace.recommend.optionalTag')}</span>
              </p>
              <input
                type="date"
                value={desiredDate}
                onChange={(e) => setDesiredDate(e.target.value)}
                className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
              />
              <label className="mt-3 flex items-center justify-end gap-2 text-[13px] text-neutral-500">
                <input
                  type="checkbox"
                  checked={fixedDeadline}
                  onChange={(e) => setFixedDeadline(e.target.checked)}
                  className="h-4 w-4 accent-indigo-500"
                />
                {t('workspace.recommend.fixedDeadlineLabel')}
              </label>

              <p className="mt-8 text-sm font-semibold text-neutral-800">{t('workspace.recommend.priorityQuestion')}</p>
              <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.recommend.priorityHint')}</p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRIORITY_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => togglePriority(chip)}
                    className={selectableClass(priorities.includes(chip))}
                  >
                    {translateWorkspaceValue(chip, language)}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {mode !== null && (
        <>
          <aside className="fixed bottom-24 left-8 hidden w-56 rounded-xl bg-white p-5 shadow-md lg:block">
            <p className="text-[13px] font-medium text-neutral-300">{t('workspace.recommend.hintLabel')}</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {translateWorkspaceValue(HINTS[hintIndex], language)}
            </p>
          </aside>

          <div className="fixed right-8 bottom-8">
            <button
              type="button"
              disabled={!valid}
              onClick={handleSubmit}
              className="rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-indigo-600 disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {t('workspace.recommend.submitCta')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
