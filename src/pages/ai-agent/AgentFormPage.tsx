import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ClientBrief, Recommendation } from '../client-form/types'
import { SAMPLE_BRIEF } from '../client-form/constants'
import { products } from '../client-form/data/products'
import { getNotQuiteRecommendations } from '../client-form/lib/matcher'
import IntakeWizard from '../client-form/components/IntakeWizard'
import SummaryReview from '../client-form/components/SummaryReview'
import RecommendationResults from '../client-form/components/RecommendationResults'
import InternalMatchesPanel from '../client-form/components/InternalMatchesPanel'
import AgentInsights from './components/AgentInsights'
import ClarifySuggestions from './components/ClarifySuggestions'
import LanguageToggle from '../../components/LanguageToggle'
import { useLanguage } from '../../i18n/LanguageContext'
import { getInternalMatches, type InternalMatch } from '../../lib/internal-matcher'
import { computeAgreement } from '../../lib/agreementMatch'
import { isBriefVague } from '../../lib/clarifyHeuristic'

const EMPTY_BRIEF: ClientBrief = {
  industry: '',
  brandTone: '',
  companySize: '',
  occasion: '',
  recipient: '',
  budgetTier: '',
  quantity: 25,
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

type View = 'wizard' | 'summary' | 'clarify' | 'results'

export default function AgentFormPage() {
  const { t, language } = useLanguage()
  const loadingStages = [t('agent.loading1'), t('agent.loading2'), t('agent.loading3')]
  const [view, setView] = useState<View>('wizard')
  const [step, setStep] = useState(1)
  const [brief, setBrief] = useState<ClientBrief>(EMPTY_BRIEF)

  // Panel A — internal historical matcher. Local, synchronous, zero network. Computed
  // the instant the brief is submitted and never depends on Panel B's state.
  const [internalMatches, setInternalMatches] = useState<InternalMatch[]>([])

  // Panel B — external Gemini trend module. Loads independently; Panel A is already on
  // screen by the time this resolves.
  const [externalLoading, setExternalLoading] = useState(false)
  const [loadingSeconds, setLoadingSeconds] = useState(0)
  const [agentResult, setAgentResult] = useState<AgentRecommendResponse | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [excludedIds, setExcludedIds] = useState<string[]>([])
  const [requestedIds, setRequestedIds] = useState<string[]>([])

  // Feature 2 — AI-assisted brief clarification. Only fires when the local heuristic
  // flags the brief as vague; never blocks submission.
  const [clarifyLoading, setClarifyLoading] = useState(false)
  const [clarifySuggestions, setClarifySuggestions] = useState<string[]>([])

  useEffect(() => {
    if (view !== 'results' || !externalLoading) return
    setLoadingSeconds(0)
    const interval = setInterval(() => setLoadingSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [view, externalLoading])

  const loadingStage = loadingSeconds < 2 ? 0 : loadingSeconds < 8 ? 1 : 2

  const handleNext = () => {
    if (step < 5) setStep(step + 1)
    else setView('summary')
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleEditStep = (targetStep: number) => {
    setStep(targetStep)
    setView('wizard')
  }

  // Fires Panel A instantly (no await — local JSON read) and Panel B in parallel.
  // Panel A is never affected by whatever happens to the Panel B fetch below.
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

  const handleFindProducts = async () => {
    if (!isBriefVague(brief)) {
      await submitForRecommendations(brief)
      return
    }

    setView('clarify')
    setClarifyLoading(true)
    setClarifySuggestions([])

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)
      const res = await fetch('/api/clarify-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, language }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data = (await res.json()) as ClarifyResponse
      setClarifySuggestions(data.suggestions.flatMap((s) => s.examples).slice(0, 3))
    } catch {
      // Silent-fail contract: never surface an error, just proceed with no suggestions.
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

  const handleInstantFill = () => {
    setBrief(SAMPLE_BRIEF)
    setView('summary')
  }

  const handleStartOver = () => {
    setBrief(EMPTY_BRIEF)
    setStep(1)
    setExcludedIds([])
    setRequestedIds([])
    setAgentResult(null)
    setRecommendations([])
    setInternalMatches([])
    setClarifySuggestions([])
    setView('wizard')
  }

  const agreement =
    agentResult && !externalLoading ? computeAgreement(internalMatches, recommendations) : new Set<string>()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{t('header.live')}</p>
        <div className="flex items-center gap-3">
          <Link to="/client-form" className="text-xs text-slate-500 hover:text-blue-600">
            {t('nav.switchToLocal')}
          </Link>
          <LanguageToggle />
        </div>
      </header>

      {view === 'wizard' && (
        <IntakeWizard
          step={step}
          brief={brief}
          setBrief={setBrief}
          onNext={handleNext}
          onBack={handleBack}
          onInstantFill={handleInstantFill}
        />
      )}

      {view === 'summary' && (
        <SummaryReview brief={brief} onEditStep={handleEditStep} onFindProducts={handleFindProducts} />
      )}

      {view === 'clarify' && (
        <ClarifySuggestions
          loading={clarifyLoading}
          suggestions={clarifySuggestions}
          notes={brief.notes ?? ''}
          onNotesChange={(notes) => setBrief((prev) => ({ ...prev, notes }))}
          onContinue={handleContinueFromClarify}
        />
      )}

      {view === 'results' && (
        <>
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
        </>
      )}
    </div>
  )
}
