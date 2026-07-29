export interface ClientBrief {
  industry: string
  brandTone: string
  companySize: string
  occasion: string
  recipient: string
  budgetTier: string // e.g. "$50-100"
  quantity: number
  emotionalOutcomes: string[] // multi-select
  notes?: string
}

export interface Product {
  id: string
  name: string
  category: string
  basePrice: number
  tags: string[] // e.g. ["customizable", "sustainable", "tech-forward", "minimalist", "experiential"]
  trendScore: number // 0-100, mock as if pulled from recent order volume
  industryFit: string[]
  toneFit: string[]
  minQuantity: number
}

export interface Recommendation {
  product: Product
  matchScore: number
  reasonWhy: string
  // Multi-source trend evidence for this specific product, only set by the live agent —
  // deterministic tag-overlap against MatchedTrend[], never a model self-report.
  contributingTrends?: import('../../../lib/trendMatcher.js').MatchedTrend[]
}

export interface FeedbackEvent {
  productId: string
  action: 'accept' | 'reject' | 'not_quite'
  timestamp: number
}
