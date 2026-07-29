import { useState } from 'react'
import type { ClientBrief, FeedbackEvent, Recommendation } from './types'
import { products } from './data/products'
import { getRecommendations, getNotQuiteRecommendations } from './lib/matcher'
import IntakeWizard from './components/IntakeWizard'
import SummaryReview from './components/SummaryReview'
import RecommendationResults from './components/RecommendationResults'
import InsightsPanel from './components/InsightsPanel'

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

type View = 'wizard' | 'summary' | 'results'

export default function ClientFormPage() {
  const [view, setView] = useState<View>('wizard')
  const [step, setStep] = useState(1)
  const [brief, setBrief] = useState<ClientBrief>(EMPTY_BRIEF)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [excludedIds, setExcludedIds] = useState<string[]>([])
  const [requestedIds, setRequestedIds] = useState<string[]>([])
  const [feedbackLog, setFeedbackLog] = useState<FeedbackEvent[]>([])

  const logFeedback = (productId: string, action: FeedbackEvent['action']) => {
    setFeedbackLog((prev) => [...prev, { productId, action, timestamp: Date.now() }])
  }

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

  const handleFindProducts = () => {
    setExcludedIds([])
    setRequestedIds([])
    setRecommendations(getRecommendations(brief, products))
    setView('results')
  }

  const handleRequestSample = (rec: Recommendation) => {
    setRequestedIds((prev) => [...prev, rec.product.id])
    logFeedback(rec.product.id, 'accept')
  }

  const handleReject = (rec: Recommendation) => {
    logFeedback(rec.product.id, 'reject')
    setRecommendations((prev) => prev.filter((r) => r.product.id !== rec.product.id))
  }

  const handleNotQuite = (rec: Recommendation) => {
    logFeedback(rec.product.id, 'not_quite')
    const nextExcluded = [...excludedIds, rec.product.id]
    const next = getNotQuiteRecommendations(brief, products, rec.product, excludedIds)
    setExcludedIds(nextExcluded)
    setRecommendations(next)
  }

  const handleStartOver = () => {
    setBrief(EMPTY_BRIEF)
    setStep(1)
    setExcludedIds([])
    setRequestedIds([])
    setView('wizard')
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">BrandBoost Product Matcher</p>
      </header>

      {view === 'wizard' && (
        <IntakeWizard step={step} brief={brief} setBrief={setBrief} onNext={handleNext} onBack={handleBack} />
      )}

      {view === 'summary' && (
        <SummaryReview brief={brief} onEditStep={handleEditStep} onFindProducts={handleFindProducts} />
      )}

      {view === 'results' && (
        <>
          <RecommendationResults
            recommendations={recommendations}
            requestedIds={requestedIds}
            onRequestSample={handleRequestSample}
            onNotQuite={handleNotQuite}
            onReject={handleReject}
            onStartOver={handleStartOver}
          />
          <InsightsPanel feedbackLog={feedbackLog} catalog={products} />
        </>
      )}
    </div>
  )
}
