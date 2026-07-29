// Static JSON, not a DB: dataset is ~350 rows, read-only during runtime, and stateless serverless
// functions gain nothing from a hosted DB at this scale. In production this would be a query
// against BrandBoost's operational database (e.g. Postgres) — the matching logic itself would
// not change, only the data access layer.
//
// This whole module is the deterministic counterpart to the external trend module
// (api/agent-recommend.ts, which calls Gemini + googleSearch). No LLM calls, no network
// calls, pure computation over data/*.json — it must work even if the external call is
// slow, loading, or has failed outright.

import orderHistoryData from '../../data/order-history.json'
import productCatalogData from '../../data/product-catalog.json'
import type { OrderHistoryRow, ProductCatalogRow } from '../types/orderHistory'
import type { ClientBrief } from '../pages/client-form/types'
import { BUDGET_TIERS } from '../pages/client-form/lib/matcher'

const orderHistory = orderHistoryData as OrderHistoryRow[]
const productCatalog = productCatalogData as ProductCatalogRow[]

export interface InternalMatch {
  product_name: string
  category: string
  matchScore: number // 0-100
  timesOrdered: number
  acceptanceRate: number // 0-1
  avgUnitPrice: number
  mostRecentOrderDate: string
  reasonWhy: string
}

// ─── Tunable constants — every number that shapes the result lives here, not buried
// inline, so the scoring can be explained/tuned in one place for a pitch demo. ───

// Below this many directly-matched rows, widen the industry filter to the whole
// adjacent-industry cluster (see INDUSTRY_CLUSTERS) rather than starving the stats.
const MIN_ROWS_FOR_DIRECT_MATCH = 5

// Simple step decay, not anything fancier: an order from the last 12 months counts at
// full weight toward the score; anything older counts at half weight. Real recency
// modeling would use exponential decay, but for a ~350-row demo dataset a step function
// is easy to explain out loud and behaves sensibly.
const RECENT_MONTHS_WINDOW = 12
const RECENCY_FULL_WEIGHT = 1
const RECENCY_DECAYED_WEIGHT = 0.5

// `accepted_after_revision` is a real acceptance, just not a clean first-pass one — it
// gets partial credit rather than counting as a full accept or a reject. Tune this
// between 0 (treat like a reject) and 1 (treat like a clean accept).
const ACCEPTED_AFTER_REVISION_CREDIT = 0.5

// An order whose occasion matches the brief's (mapped) occasion counts extra toward
// this product's volume score — a soft weight, not a hard filter, because with only
// ~13 orders per industry on average, hard-filtering by industry AND occasion together
// would starve almost every product down to 0-1 rows.
const OCCASION_MATCH_BOOST = 1.5

// Final matchScore = volumeScore (0-100, relative to the top product in this filtered
// set) * VOLUME_WEIGHT + acceptanceRate*100 * ACCEPTANCE_WEIGHT. Must sum to 1.
const MATCH_SCORE_WEIGHTS = { volume: 0.5, acceptance: 0.5 }

const TOP_N_RESULTS = 5

// Fixed approximate rate for comparing the brief's USD budget tier against the
// dataset's KRW prices. In production this would use a live FX rate or the catalog
// would already be priced in the client's local currency; this is a demo simplification.
const USD_TO_KRW_RATE = 1350

// ─── Vocabulary mapping ───────────────────────────────────────────────────────────
// The app's own wizard options (ClientBrief.industry/occasion, from
// src/pages/client-form/constants.ts) were designed independently of this historical
// dataset's industry/occasion labels, so they don't match as strings. This is the
// explicit, hand-maintained correspondence between the two vocabularies — some app
// options map to zero, one, or several dataset categories.

const INDUSTRY_MAP: Record<string, string[]> = {
  'Finance/Asset Management': ['Asset Management'],
  Tech: ['IT / Startup', 'Consumer Electronics', 'Gaming / Entertainment'],
  Healthcare: ['Pharmaceutical'],
  Retail: ['F&B / Retail', 'Fashion / Beauty'],
  'Professional Services': ['Consulting'],
  Manufacturing: [], // no direct equivalent in the historical dataset
  Other: [], // no direct equivalent
}

// Adjacent-industry clusters for the fallback path, grounded in the real
// Clients.brand_tone groupings in the dataset (checked directly: every dataset
// industry maps to exactly one brand_tone, e.g. Pharmaceutical/Public-Government/
// University are all "Formal / Conservative") rather than a guessed grouping.
const INDUSTRY_CLUSTERS: string[][] = [
  ['Pharmaceutical', 'Public / Government Agency', 'University / Education'], // Formal / Conservative
  ['Asset Management', 'Consulting'], // Formal / Prestige
  ['IT / Startup', 'F&B / Retail'], // Playful / Casual
  ['Consumer Electronics'], // Modern / Tech
  ['Fashion / Beauty', 'Gaming / Entertainment'], // Trendy / Bold
]

// Which cluster each app-side industry falls back to when its direct match (above) is
// empty or too sparse. "Manufacturing" and "Other" have no direct dataset equivalent at
// all, so they default to the Formal/Conservative cluster — traditional B2B gifting
// culture is the safest generic assumption for an unlisted industry.
const INDUSTRY_FALLBACK_CLUSTER: Record<string, number> = {
  'Finance/Asset Management': 1,
  Tech: 2,
  Healthcare: 0,
  Retail: 2,
  'Professional Services': 1,
  Manufacturing: 0,
  Other: 0,
}

const OCCASION_MAP: Record<string, string[]> = {
  'Welcome/Onboarding kit': ['New Hire Kit'],
  'VIP/Client gift': ['VIP Gift'],
  'Conference/Event swag': ['Conference Swag', 'Event Goods'],
  'Uniform/Apparel program': [], // no direct equivalent
  'Holiday gift': ['Year-End Gift'],
  'Employee recognition': ['Anniversary Gift'],
}

// ─── Matching logic ───────────────────────────────────────────────────────────────

interface IndustryResolution {
  candidateIndustries: string[]
  usedFallback: boolean
  directRowCount: number
}

function resolveCandidateIndustries(industry: string): IndustryResolution {
  const direct = INDUSTRY_MAP[industry] ?? []
  const directRowCount = orderHistory.filter((o) => direct.includes(o.industry)).length
  if (directRowCount >= MIN_ROWS_FOR_DIRECT_MATCH) {
    return { candidateIndustries: direct, usedFallback: false, directRowCount }
  }

  const clusterIndex = INDUSTRY_FALLBACK_CLUSTER[industry] ?? 0
  const cluster = INDUSTRY_CLUSTERS[clusterIndex] ?? []
  return {
    candidateIndustries: [...new Set([...direct, ...cluster])],
    usedFallback: true,
    directRowCount,
  }
}

function isRecent(orderDate: string): boolean {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - RECENT_MONTHS_WINDOW)
  return new Date(orderDate) >= cutoff
}

function budgetRangeKrw(budgetTier: string): { min: number; max: number } | null {
  const tier = BUDGET_TIERS.find((t) => t.label === budgetTier)
  if (!tier) return null
  return { min: tier.min * USD_TO_KRW_RATE, max: tier.max * USD_TO_KRW_RATE }
}

interface ProductStats {
  rows: OrderHistoryRow[]
  weightedVolume: number
}

export interface InternalMatchDebugInfo {
  matches: InternalMatch[]
  candidateIndustries: string[]
  usedIndustryFallback: boolean
  directIndustryRowCount: number
  totalRowsConsidered: number
}

function computeMatches(brief: ClientBrief): InternalMatchDebugInfo {
  const resolution = resolveCandidateIndustries(brief.industry)
  const { candidateIndustries } = resolution
  const industryRows = orderHistory.filter((o) => candidateIndustries.includes(o.industry))
  if (industryRows.length === 0) {
    return {
      matches: [],
      candidateIndustries,
      usedIndustryFallback: resolution.usedFallback,
      directIndustryRowCount: resolution.directRowCount,
      totalRowsConsidered: 0,
    }
  }

  const matchedOccasions = new Set(OCCASION_MAP[brief.occasion] ?? [])

  const byProduct = new Map<string, ProductStats>()
  for (const row of industryRows) {
    const recencyWeight = isRecent(row.order_date) ? RECENCY_FULL_WEIGHT : RECENCY_DECAYED_WEIGHT
    const occasionBoost = matchedOccasions.has(row.occasion) ? OCCASION_MATCH_BOOST : 1
    const stats = byProduct.get(row.product_name) ?? { rows: [], weightedVolume: 0 }
    stats.rows.push(row)
    stats.weightedVolume += recencyWeight * occasionBoost
    byProduct.set(row.product_name, stats)
  }

  const catalogByName = new Map(productCatalog.map((p) => [p.product_name, p]))
  const budgetKrw = budgetRangeKrw(brief.budgetTier)
  const maxWeightedVolume = Math.max(...[...byProduct.values()].map((s) => s.weightedVolume), 1)

  const candidates: InternalMatch[] = []

  for (const [productName, stats] of byProduct) {
    // Cross-check against Product_Catalog — guards against discontinued items
    // lingering in old order history.
    const catalogEntry = catalogByName.get(productName)
    if (!catalogEntry) continue

    if (budgetKrw && (catalogEntry.unit_price_krw < budgetKrw.min || catalogEntry.unit_price_krw > budgetKrw.max)) {
      continue
    }

    const acceptedCount = stats.rows.filter((r) => r.outcome === 'accepted').length
    const revisedCount = stats.rows.filter((r) => r.outcome === 'accepted_after_revision').length
    const rejectedCount = stats.rows.filter((r) => r.outcome === 'rejected_first_round').length
    const totalOutcomes = acceptedCount + revisedCount + rejectedCount
    const acceptanceRate =
      totalOutcomes === 0 ? 0 : (acceptedCount + ACCEPTED_AFTER_REVISION_CREDIT * revisedCount) / totalOutcomes

    const avgUnitPrice = stats.rows.reduce((sum, r) => sum + r.unit_price_krw, 0) / stats.rows.length
    const mostRecentOrderDate = stats.rows.reduce((latest, r) => (r.order_date > latest ? r.order_date : latest), '')

    // matchScore: half from how this product's (recency + occasion weighted) order
    // volume compares to the best-performing product in this filtered set, half from
    // its acceptance rate. Weights are MATCH_SCORE_WEIGHTS above — tune there, not here.
    const volumeScore = (stats.weightedVolume / maxWeightedVolume) * 100
    const matchScore = Math.round(
      volumeScore * MATCH_SCORE_WEIGHTS.volume + acceptanceRate * 100 * MATCH_SCORE_WEIGHTS.acceptance,
    )

    // "accepted without revision" in the sentence is deliberately the plain, unweighted
    // first-pass rate (acceptedCount / totalOutcomes) — a different, more literal number
    // than the `acceptanceRate` field above, which gives partial credit for revisions.
    // timesOrdered is the raw historical count, not recency-weighted: a decayed count
    // like "3.5 clients" would read oddly in a human-facing sentence, so recency only
    // affects the score, never the displayed numbers.
    const acceptedWithoutRevisionPct = totalOutcomes === 0 ? 0 : Math.round((acceptedCount / totalOutcomes) * 100)
    const reasonWhy = `Ordered by ${stats.rows.length} similar ${brief.industry} clients for ${brief.occasion}, ${acceptedWithoutRevisionPct}% accepted without revision.`

    candidates.push({
      product_name: productName,
      category: catalogEntry.category,
      matchScore: Math.max(0, Math.min(100, matchScore)),
      timesOrdered: stats.rows.length,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
      avgUnitPrice: Math.round(avgUnitPrice),
      mostRecentOrderDate,
      reasonWhy,
    })
  }

  return {
    matches: candidates.sort((a, b) => b.matchScore - a.matchScore).slice(0, TOP_N_RESULTS),
    candidateIndustries,
    usedIndustryFallback: resolution.usedFallback,
    directIndustryRowCount: resolution.directRowCount,
    totalRowsConsidered: industryRows.length,
  }
}

export function getInternalMatches(brief: ClientBrief): InternalMatch[] {
  return computeMatches(brief).matches
}

// For the standalone test page only — surfaces *why* the matcher returned what it did
// (which industries got pulled in, whether the fallback cluster fired) without
// duplicating the matching logic above.
export function getInternalMatchesDebug(brief: ClientBrief): InternalMatchDebugInfo {
  return computeMatches(brief)
}
