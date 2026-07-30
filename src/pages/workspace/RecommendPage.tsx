import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import LanguageToggle from '../../components/LanguageToggle'
import type { ClientBrief, Recommendation } from '../client-form/types'
import { products } from '../client-form/data/products'
import { getNotQuiteRecommendations } from '../client-form/lib/matcher'
import InternalMatchesPanel from '../client-form/components/InternalMatchesPanel'
import RecommendationResults from '../client-form/components/RecommendationResults'
import ClarifySuggestions from '../ai-agent/components/ClarifySuggestions'
import AgentInsights from '../ai-agent/components/AgentInsights'
import CombinedIntakeForm from '../../components/CombinedIntakeForm'
import { getInternalMatches, type InternalMatch } from '../../lib/internal-matcher'
import { computeAgreement } from '../../lib/agreementMatch'
import { isBriefVague } from '../../lib/clarifyHeuristic'
import { DEMO_AGENT_RESPONSE, type DemoAgentResponse } from './demoAgentResponse'

const EMPTY_BRIEF: ClientBrief = {
  industry: '',
  brandTone: '',
  companySize: '',
  occasion: '',
  recipient: '',
  budgetTier: '',
  quantity: 0,
  emotionalOutcomes: [],
  notes: '',
}

interface ClarifyResponse {
  isVague: boolean
  suggestions: { field: string; examples: string[] }[]
}

type View = 'form' | 'clarify' | 'results'

// Presentation safety: never depend on live Gemini latency in front of an audience —
// show a fixed, short "searching" pause instead of the real (up to ~60s) round trip.
const DEMO_SEARCH_DELAY_MS = 5000

export default function RecommendPage() {
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const [brief, setBrief] = useState<ClientBrief>(EMPTY_BRIEF)
  const [view, setView] = useState<View>('form')

  const [internalMatches, setInternalMatches] = useState<InternalMatch[]>([])
  const [externalLoading, setExternalLoading] = useState(false)
  const [loadingSeconds, setLoadingSeconds] = useState(0)
  const [agentResult, setAgentResult] = useState<DemoAgentResponse | null>(null)
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

  // Panel A (getInternalMatches) stays fully live — local, instant, zero network risk,
  // and genuinely reflects whatever was entered. Panel B shows a captured real response
  // (see demoAgentResponse.ts) after a fixed pause instead of a live Gemini call.
  const submitForRecommendations = (currentBrief: ClientBrief) => {
    setExcludedIds([])
    setRequestedIds([])
    setInternalMatches(getInternalMatches(currentBrief))
    setAgentResult(null)
    setRecommendations([])
    setView('results')
    setExternalLoading(true)

    setTimeout(() => {
      const demo = DEMO_AGENT_RESPONSE[language]
      setAgentResult(demo)
      setRecommendations(demo.recommendations)
      setExternalLoading(false)
    }, DEMO_SEARCH_DELAY_MS)
  }

  const handleSubmit = async (composedBrief: ClientBrief) => {
    if (!isBriefVague(composedBrief)) {
      submitForRecommendations(composedBrief)
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
    submitForRecommendations(brief)
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
    setBrief(EMPTY_BRIEF)
    setExcludedIds([])
    setRequestedIds([])
    setAgentResult(null)
    setRecommendations([])
    setInternalMatches([])
    setClarifySuggestions([])
    setView('form')
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

      <CombinedIntakeForm onSubmit={handleSubmit} />
    </div>
  )
}
