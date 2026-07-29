import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ClientBrief, Recommendation } from '../client-form/types'
import { SAMPLE_BRIEF } from '../client-form/constants'
import { products } from '../client-form/data/products'
import { getNotQuiteRecommendations } from '../client-form/lib/matcher'
import IntakeWizard from '../client-form/components/IntakeWizard'
import SummaryReview from '../client-form/components/SummaryReview'
import RecommendationResults from '../client-form/components/RecommendationResults'
import AgentInsights from './components/AgentInsights'

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

type View = 'wizard' | 'summary' | 'loading' | 'results' | 'error'

const LOADING_STAGES = ['Searching for current trends...', 'Matching against catalog...']

export default function AgentFormPage() {
  const [view, setView] = useState<View>('wizard')
  const [step, setStep] = useState(1)
  const [brief, setBrief] = useState<ClientBrief>(EMPTY_BRIEF)
  const [loadingStage, setLoadingStage] = useState(0)
  const [agentResult, setAgentResult] = useState<AgentRecommendResponse | null>(null)
  const [excludedIds, setExcludedIds] = useState<string[]>([])
  const [requestedIds, setRequestedIds] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    if (view !== 'loading') return
    setLoadingStage(0)
    const timer = setTimeout(() => setLoadingStage(1), 1800)
    return () => clearTimeout(timer)
  }, [view])

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

  const handleFindProducts = async () => {
    setView('loading')
    setExcludedIds([])
    setRequestedIds([])
    try {
      const res = await fetch('/api/agent-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief),
      })
      const data = (await res.json()) as AgentRecommendResponse
      setAgentResult(data)
      setRecommendations(data.recommendations)
      setView('results')
    } catch {
      setAgentResult({
        recommendations: [],
        trendSummary: 'Something went wrong reaching the agent.',
        searchQueriesUsed: [],
        sourcesUsed: [],
        usedFallback: true,
      })
      setRecommendations([])
      setView('results')
    }
  }

  const handleRequestSample = (rec: Recommendation) => {
    setRequestedIds((prev) => [...prev, rec.product.id])
  }

  const handleReject = (rec: Recommendation) => {
    setRecommendations((prev) => prev.filter((r) => r.product.id !== rec.product.id))
  }

  const handleNotQuite = (rec: Recommendation) => {
    const nextExcluded = [...excludedIds, rec.product.id]
    const next = getNotQuiteRecommendations(brief, products, rec.product, excludedIds)
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
    setView('wizard')
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">BrandBoost Product Matcher — Live Agent</p>
        <Link to="/client-form" className="text-xs text-slate-500 hover:text-blue-600">
          Switch to fast local version
        </Link>
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

      {view === 'loading' && (
        <div className="max-w-2xl mx-auto py-24 px-4 text-center">
          <div className="animate-pulse text-slate-500">{LOADING_STAGES[loadingStage]}</div>
        </div>
      )}

      {view === 'results' && agentResult && (
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
          />
        </>
      )}
    </div>
  )
}
