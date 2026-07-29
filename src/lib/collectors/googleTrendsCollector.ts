import googleTrends from 'google-trends-api'
import type { NormalizedTrend } from '../../types/trend.js'
import type { CollectorInput } from './types.js'

// Deterministic keyword per tag — no LLM guessing which query represents which tag.
const TAG_QUERY_TEMPLATES: Record<string, string> = {
  sustainable: 'sustainable corporate gifts',
  'eco-friendly': 'eco-friendly promotional products',
  'tech-forward': 'tech gadget corporate gifts',
  premium: 'premium corporate gift ideas',
  luxury: 'luxury corporate gifts',
  customizable: 'custom branded merchandise',
  wellness: 'corporate wellness gifts',
  playful: 'fun corporate swag',
  professional: 'professional business gifts',
  minimalist: 'minimalist corporate gifts',
  experiential: 'experiential corporate gifts',
  engravable: 'engraved corporate gifts',
  apparel: 'branded apparel corporate gifts',
  everyday: 'everyday corporate gifts',
  giftset: 'corporate gift sets',
}

const MAX_QUERIES = 4

interface TimelinePoint {
  time: string
  value: number[]
}

interface InterestOverTimeResponse {
  default?: { timelineData?: TimelinePoint[] }
}

function pickQueries(input: CollectorInput): { keyword: string; tag: string }[] {
  const tagQueries = input.tags
    .filter((tag) => tag in TAG_QUERY_TEMPLATES)
    .slice(0, MAX_QUERIES)
    .map((tag) => ({ keyword: TAG_QUERY_TEMPLATES[tag], tag }))

  if (tagQueries.length > 0) return tagQueries

  // No known tags to probe — fall back to one generic industry+occasion query.
  return [{ keyword: `${input.industry} ${input.occasion} corporate gifts`, tag: 'general' }]
}

async function fetchOne(keyword: string, tag: string): Promise<NormalizedTrend | null> {
  try {
    const raw = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // last 3 months
    })
    const parsed = JSON.parse(raw) as InterestOverTimeResponse
    const points = parsed.default?.timelineData ?? []
    if (points.length === 0) return null

    // Google Trends values are already 0-100 relative to the series' own peak —
    // use the recent window directly rather than inventing our own normalization.
    const recentWindow = points.slice(-4)
    const priorWindow = points.slice(-8, -4)
    const avg = (pts: TimelinePoint[]) =>
      pts.length === 0 ? null : pts.reduce((sum, p) => sum + (p.value[0] ?? 0), 0) / pts.length

    const recentAvg = avg(recentWindow) ?? 0
    const priorAvg = avg(priorWindow)
    // Arithmetic only — never ask a model to estimate this.
    const growthRatePct = priorAvg && priorAvg > 0 ? ((recentAvg - priorAvg) / priorAvg) * 100 : null

    return {
      source: 'google_trends',
      topic: keyword,
      volumeScore: Math.round(recentAvg),
      growthRatePct: growthRatePct === null ? null : Math.round(growthRatePct * 10) / 10,
      timeframe: '3m',
      tags: tag === 'general' ? [] : [tag],
      sourceUrl: `https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword)}&date=today+3-m`,
      confidence: 'verified',
    }
  } catch {
    // Google Trends' unofficial endpoint frequently rate-limits/blocks automated
    // requests (a 429 or an HTML challenge page instead of JSON) — that's an expected
    // failure mode here, not a bug. This query simply contributes nothing.
    return null
  }
}

export async function googleTrendsCollector(input: CollectorInput): Promise<NormalizedTrend[]> {
  try {
    const queries = pickQueries(input)
    const results = await Promise.all(queries.map((q) => fetchOne(q.keyword, q.tag)))
    return results.filter((r): r is NormalizedTrend => r !== null)
  } catch {
    return []
  }
}
