import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ClientBrief, FeedbackEvent, Recommendation } from './types'
import { SAMPLE_BRIEF } from './constants'
import { products } from './data/products'
import { getRecommendations, getNotQuiteRecommendations } from './lib/matcher'
import IntakeWizard from './components/IntakeWizard'
import SummaryReview from './components/SummaryReview'
import RecommendationResults from './components/RecommendationResults'
import InternalMatchesPanel from './components/InternalMatchesPanel'
import InsightsPanel from './components/InsightsPanel'
import LanguageToggle from '../../components/LanguageToggle'
import { useLanguage } from '../../i18n/LanguageContext'
import { getInternalMatches, type InternalMatch } from '../../lib/internal-matcher'
import { computeAgreement } from '../../lib/agreementMatch'

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
  const { t, language } = useLanguage()
  const [view, setView] = useState<View>('wizard')
  const [step, setStep] = useState(1)
  const [brief, setBrief] = useState<ClientBrief>(EMPTY_BRIEF)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [internalMatches, setInternalMatches] = useState<InternalMatch[]>([])
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
    setInternalMatches(getInternalMatches(brief))
    setRecommendations(getRecommendations(brief, products, { language }))
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
    setView('wizard')
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{t('header.local')}</p>
        <div className="flex items-center gap-3">
          <Link to="/ai-agent" className="text-xs text-slate-500 hover:text-blue-600">
            {t('nav.switchToLive')}
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

      {view === 'results' && (
        <>
          <InternalMatchesPanel
            matches={internalMatches}
            agreement={computeAgreement(internalMatches, recommendations)}
          />
          <RecommendationResults
            recommendations={recommendations}
            requestedIds={requestedIds}
            onRequestSample={handleRequestSample}
            onNotQuite={handleNotQuite}
            onReject={handleReject}
            onStartOver={handleStartOver}
            agreement={computeAgreement(internalMatches, recommendations)}
          />
          <InsightsPanel feedbackLog={feedbackLog} catalog={products} />
        </>
      )}
    </div>
  )
}
