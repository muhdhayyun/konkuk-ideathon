export type TrendSource = 'google_trends' | 'youtube' | 'naver' | 'ruliweb'

export interface NormalizedTrend {
  source: TrendSource
  topic: string
  volumeScore: number // normalized 0-100 within its own source, not cross-comparable yet
  growthRatePct: number | null // null if the source can't support this field — never estimate
  timeframe: '1w' | '1m' | '3m'
  tags: string[] // maps to the same tag vocabulary as Product.tags
  sourceUrl: string // real, resolved URL — never a redirect link
  confidence: 'verified' | 'unverified'
}
