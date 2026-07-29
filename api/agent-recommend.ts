import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { ClientBrief, Product, Recommendation } from '../src/pages/client-form/types/index.js'
import { products } from '../src/pages/client-form/data/products.js'
import { getRecommendations, EMOTIONAL_OUTCOME_TAG_BOOSTS } from '../src/pages/client-form/lib/matcher.js'
import { getGeminiClient, GEMINI_MODEL, extractJson } from '../src/lib/geminiClient.js'
import { withTimeout } from '../src/lib/withTimeout.js'
import type { CollectorInput } from '../src/lib/collectors/types.js'
import type { NormalizedTrend } from '../src/types/trend.js'
import { googleTrendsCollector } from '../src/lib/collectors/googleTrendsCollector.js'
import { youtubeCollector } from '../src/lib/collectors/youtubeCollector.js'
import { naverCollector } from '../src/lib/collectors/naverCollector.js'
import { ruliwebCollector } from '../src/lib/collectors/ruliwebCollector.js'
import { crossMatchTrends, type MatchedTrend } from '../src/lib/trendMatcher.js'

type Language = 'en' | 'ko'

interface AgentRecommendRequestBody {
  brief: ClientBrief
  language?: Language
}

interface AgentRecommendResponse {
  recommendations: Recommendation[]
  trendSummary: string
  matchedTrends: MatchedTrend[]
  usedFallback: boolean
}

// Each collector gets this long to answer before it's treated as empty — one slow
// source (Google Trends' unofficial endpoint, most often) can never block the others
// or blow the whole request past Vercel's function time limit.
const COLLECTOR_TIMEOUT_MS = 15000

// Turns the client's emotional-outcome chips into the tag vocabulary the collectors
// probe for — the same mapping the local matcher already uses to score products, so
// "what we search for" and "what we score against" stay in sync.
function deriveCollectorInput(brief: ClientBrief): CollectorInput {
  const tags = new Set<string>()
  for (const outcome of brief.emotionalOutcomes) {
    const mapping = EMOTIONAL_OUTCOME_TAG_BOOSTS[outcome]
    mapping?.tags.forEach((tag) => tags.add(tag))
  }
  return { industry: brief.industry, occasion: brief.occasion, tags: [...tags] }
}

async function collectAllTrends(input: CollectorInput): Promise<NormalizedTrend[]> {
  const results = await Promise.allSettled([
    withTimeout(googleTrendsCollector(input), COLLECTOR_TIMEOUT_MS, [] as NormalizedTrend[]),
    withTimeout(youtubeCollector(input), COLLECTOR_TIMEOUT_MS, [] as NormalizedTrend[]),
    withTimeout(naverCollector(input), COLLECTOR_TIMEOUT_MS, [] as NormalizedTrend[]),
    withTimeout(ruliwebCollector(input), COLLECTOR_TIMEOUT_MS, [] as NormalizedTrend[]),
  ])

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}

// Deterministic evidence link between a product and the trends that support it — a tag
// overlap, never a model self-report. Top 3 by composite score keeps cards readable.
function contributingTrendsFor(product: Product, matchedTrends: MatchedTrend[]): MatchedTrend[] {
  return matchedTrends
    .filter((trend) => {
      const trendTags = new Set(trend.matchedFrom.flatMap((t) => t.tags))
      return product.tags.some((tag) => trendTags.has(tag))
    })
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 3)
}

function buildPrompt(brief: ClientBrief, matchedTrends: MatchedTrend[], language: Language): string {
  const trendContext =
    matchedTrends.length > 0
      ? `Here is a pre-verified list of what's currently trending, aggregated and scored from real data sources (Google Trends, YouTube, Naver, Ruliweb) — sourceCount is how many independent sources confirmed it, compositeScore is its overall strength (0-100+):\n${JSON.stringify(
          matchedTrends.map((m) => ({
            topic: m.canonicalTopic,
            sourceCount: m.sourceCount,
            compositeScore: m.compositeScore,
            tags: [...new Set(m.matchedFrom.flatMap((t) => t.tags))],
          })),
          null,
          2,
        )}`
      : 'No live trend data could be collected for this request (all sources returned nothing or timed out). Do not invent or imply trend support — reason from catalog fit alone.'

  const base = `I'm sourcing corporate merch for a ${brief.industry} client. Occasion: ${brief.occasion}. Recipient: ${brief.recipient}. Desired feeling: ${brief.emotionalOutcomes.join(', ')}. Budget per unit: ${brief.budgetTier}. Quantity: ${brief.quantity}.${brief.notes ? ` Additional notes: ${brief.notes}` : ''}

${trendContext}

Here is our product catalog:
${JSON.stringify(products, null, 2)}

Recommend the top 3-5 products from this catalog that best match both the client's stated needs and, where genuinely relevant, the trend data above. For each, give a matchScore (0-100) and a one-line reasonWhy. Only mention a trend in reasonWhy if it's actually in the trend list above and actually relevant to that product — never fabricate a trend or imply data you weren't given.`

  if (language === 'ko') {
    return `${base}\n\nRespond in Korean (한국어): write "reasonWhy" and "trendSummary" entirely in natural, fluent Korean. Keep JSON keys and product IDs in English exactly as given.`
  }
  return base
}

function systemPrompt(language: Language): string {
  const languageInstruction =
    language === 'ko'
      ? '\n\nRespond in Korean: "reasonWhy" and "trendSummary" must be written in natural Korean. JSON keys and productId values stay in English.'
      : ''

  return `You are a corporate merch matching agent. You are given pre-verified trend data (already collected and scored from real sources) plus a product catalog — you do not search for anything yourself. Recommend products from the given catalog.${languageInstruction}

Respond with ONLY a single JSON object matching this exact shape, no markdown fences, no commentary before or after:
{
  "recommendations": [
    { "productId": "string (must be an id from the given catalog)", "matchScore": 0-100, "reasonWhy": "string" }
  ],
  "trendSummary": "2-3 sentence summary of what's currently trending for this brief, based only on the trend data you were given — if none was given, say so plainly instead of inventing trends"
}`
}

async function callAgent(brief: ClientBrief, language: Language): Promise<AgentRecommendResponse> {
  const collectorInput = deriveCollectorInput(brief)
  const allTrends = await collectAllTrends(collectorInput)
  const matchedTrends = await crossMatchTrends(allTrends)

  const ai = getGeminiClient()
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(brief, matchedTrends, language),
    config: { systemInstruction: systemPrompt(language) },
  })

  const text = response.text
  if (!text) throw new Error('No text in Gemini response')

  const parsed = extractJson(text) as {
    recommendations: { productId: string; matchScore: number; reasonWhy: string }[]
    trendSummary: string
  }

  const productsById = new Map(products.map((p) => [p.id, p]))
  const recommendations: Recommendation[] = parsed.recommendations
    .map((r) => {
      const product = productsById.get(r.productId)
      if (!product) return null
      const contributingTrends = contributingTrendsFor(product, matchedTrends)
      return {
        product,
        matchScore: r.matchScore,
        reasonWhy: r.reasonWhy,
        ...(contributingTrends.length > 0 ? { contributingTrends } : {}),
      } satisfies Recommendation
    })
    .filter((r): r is Recommendation => r !== null)

  return {
    recommendations,
    trendSummary: parsed.trendSummary,
    matchedTrends,
    usedFallback: false,
  }
}

function fallbackResponse(brief: ClientBrief, language: Language): AgentRecommendResponse {
  return {
    recommendations: getRecommendations(brief, products, { language }),
    trendSummary:
      language === 'ko'
        ? '실시간 트렌드 검색을 사용할 수 없어 로컬 매칭 결과를 대신 보여드립니다.'
        : 'Live trend search is unavailable right now — showing locally matched picks instead.',
    matchedTrends: [],
    usedFallback: true,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = req.body as AgentRecommendRequestBody
  const brief = body.brief
  const language: Language = body.language === 'ko' ? 'ko' : 'en'

  try {
    const result = await callAgent(brief, language)
    res.status(200).json(result)
  } catch (err) {
    console.error('agent-recommend failed, falling back to local matcher:', err)
    res.status(200).json(fallbackResponse(brief, language))
  }
}

export type { AgentRecommendResponse }
export type { Product }
