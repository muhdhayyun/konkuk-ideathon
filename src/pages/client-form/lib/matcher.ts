import type { ClientBrief, Product, Recommendation } from '../types/index.js'
import { translateOption, translateCategory, type Language } from '../../../i18n/translations.js'

// Weighted scoring rubric — tune these to change recommendation behavior.
export const WEIGHTS = {
  industryFit: 30,
  toneFit: 20,
  trendScoreMultiplier: 0.3,
}

export const BUDGET_TIERS: { label: string; min: number; max: number }[] = [
  { label: 'Under $20', min: 0, max: 20 },
  { label: '$20-50', min: 20, max: 50 },
  { label: '$50-100', min: 50, max: 100 },
  { label: '$100-250', min: 100, max: 250 },
  { label: '$250+', min: 250, max: Infinity },
]

// Maps an emotional outcome chip to the product tags it rewards, and how much.
export const EMOTIONAL_OUTCOME_TAG_BOOSTS: Record<string, { tags: string[]; boost: number }> = {
  'Feels personalized': { tags: ['customizable', 'engravable', 'personalized'], boost: 25 },
  'Feels premium/prestigious': { tags: ['premium', 'luxury'], boost: 25 },
  'Feels fun/energetic': { tags: ['playful', 'experiential'], boost: 20 },
  'Feels sustainable/thoughtful': { tags: ['sustainable', 'eco-friendly'], boost: 20 },
  'Feels professional/polished': { tags: ['professional', 'minimalist', 'formal'], boost: 20 },
}

function matchesBudgetTier(product: Product, budgetTier: string): boolean {
  const tier = BUDGET_TIERS.find((t) => t.label === budgetTier)
  if (!tier) return true
  return product.basePrice >= tier.min && product.basePrice < tier.max
}

interface MatchedFactors {
  industryMatch: boolean
  toneMatch: boolean
  trending: boolean
  matchedOutcomes: string[]
}

function scoreProduct(brief: ClientBrief, product: Product): { score: number; factors: MatchedFactors } {
  let score = 0
  const factors: MatchedFactors = {
    industryMatch: false,
    toneMatch: false,
    trending: false,
    matchedOutcomes: [],
  }

  if (product.industryFit.includes(brief.industry)) {
    score += WEIGHTS.industryFit
    factors.industryMatch = true
  }

  if (product.toneFit.includes(brief.brandTone)) {
    score += WEIGHTS.toneFit
    factors.toneMatch = true
  }

  score += product.trendScore * WEIGHTS.trendScoreMultiplier
  if (product.trendScore >= 75) factors.trending = true

  for (const outcome of brief.emotionalOutcomes) {
    const mapping = EMOTIONAL_OUTCOME_TAG_BOOSTS[outcome]
    if (!mapping) continue
    const matches = mapping.tags.some((tag) => product.tags.includes(tag))
    if (matches) {
      score += mapping.boost
      factors.matchedOutcomes.push(outcome)
    }
  }

  return { score, factors }
}

function generateReasonWhy(
  brief: ClientBrief,
  product: Product,
  factors: MatchedFactors,
  language: Language,
): string {
  const clauses: string[] = []

  if (language === 'ko') {
    const industry = translateOption(brief.industry, 'ko')
    const tone = translateOption(brief.brandTone, 'ko')
    const category = translateCategory(product.category, 'ko')

    if (factors.trending) {
      clauses.push(factors.industryMatch ? `${industry}에서 현재 인기 상승 중` : '최근 주문 데이터에서 인기 상승 중')
    } else if (factors.industryMatch) {
      clauses.push(`${industry} 고객에게 적합한 제품`)
    }

    if (factors.matchedOutcomes.length > 0) {
      const outcomeText = factors.matchedOutcomes.map((o) => translateOption(o, 'ko')).join(', ')
      clauses.push(outcomeText)
    }

    if (factors.toneMatch) {
      clauses.push(`${tone} 브랜드 톤에 부합`)
    }

    if (clauses.length === 0) {
      clauses.push(`${category} 카테고리의 무난한 선택`)
    }

    return clauses.join(', ') + '.'
  }

  if (factors.trending) {
    clauses.push(
      factors.industryMatch
        ? `Trending right now in ${brief.industry}`
        : 'Trending right now across recent orders',
    )
  } else if (factors.industryMatch) {
    clauses.push(`A strong fit for ${brief.industry} clients`)
  }

  if (factors.matchedOutcomes.length > 0) {
    const outcomeText = factors.matchedOutcomes
      .map((o) => o.replace('Feels ', '').toLowerCase())
      .join(' and ')
    clauses.push(`delivers on feeling ${outcomeText}`)
  }

  if (factors.toneMatch) {
    clauses.push(`matches your ${brief.brandTone.toLowerCase()} brand tone`)
  }

  if (clauses.length === 0) {
    clauses.push(`A solid general option in ${product.category.toLowerCase()}`)
  }

  return clauses.join(', ') + '.'
}

function tagOverlapCount(a: Product, b: Product): number {
  return a.tags.filter((tag) => b.tags.includes(tag)).length
}

/** Products most tag-similar to `product`, used to broaden results after a "not quite" rejection. */
export function getClosestTagNeighbors(product: Product, catalog: Product[], count = 2): Product[] {
  return catalog
    .filter((p) => p.id !== product.id)
    .map((p) => ({ product: p, overlap: tagOverlapCount(product, p) }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, count)
    .map((entry) => entry.product)
}

export function getRecommendations(
  brief: ClientBrief,
  catalog: Product[],
  options: { excludeIds?: string[]; language?: Language } = {},
): Recommendation[] {
  const excludeIds = new Set(options.excludeIds ?? [])
  const language = options.language ?? 'en'

  const eligible = catalog.filter(
    (product) =>
      !excludeIds.has(product.id) &&
      matchesBudgetTier(product, brief.budgetTier) &&
      brief.quantity >= product.minQuantity,
  )

  const scored = eligible.map((product) => {
    const { score, factors } = scoreProduct(brief, product)
    return {
      product,
      matchScore: Math.round(score),
      reasonWhy: generateReasonWhy(brief, product, factors, language),
    }
  })

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5)
}

/** Re-runs recommendations excluding a rejected product and its closest tag-neighbors, so the next result set is genuinely different. */
export function getNotQuiteRecommendations(
  brief: ClientBrief,
  catalog: Product[],
  rejectedProduct: Product,
  previouslyExcludedIds: string[] = [],
  language: Language = 'en',
): Recommendation[] {
  const neighbors = getClosestTagNeighbors(rejectedProduct, catalog, 2)
  const excludeIds = [
    ...previouslyExcludedIds,
    rejectedProduct.id,
    ...neighbors.map((n) => n.id),
  ]
  return getRecommendations(brief, catalog, { excludeIds, language })
}
