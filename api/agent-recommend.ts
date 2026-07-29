import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { ClientBrief, Product, Recommendation } from '../src/pages/client-form/types/index.js'
import { products } from '../src/pages/client-form/data/products.js'
import { getRecommendations, EMOTIONAL_OUTCOME_TAG_BOOSTS } from '../src/pages/client-form/lib/matcher.js'
import { getGeminiClient, GEMINI_MODEL, extractJson } from '../src/lib/geminiClient.js'
import { withTimeout } from '../src/lib/withTimeout.js'
import type { CollectorInput } from '../src/lib/collectors/types.js'
import type { NormalizedTrend } from '../src/types/trend.js'
import { googleSearchCollector } from '../src/lib/collectors/googleSearchCollector.js'
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

// Collectors that call Gemini *with* the googleSearch grounding tool are genuinely
// slower than plain generation (grounded calls have been observed taking well over
// 15s in this same project) — give them more room. Collectors that only do raw HTTP
// + plain (non-grounded) Gemini calls finish fast, so a tight cap doesn't cost
// anything there. Either way, a timed-out collector is just treated as empty — never
// blocks the others or blows the whole request past Vercel's function time limit.
const SEARCH_COLLECTOR_TIMEOUT_MS = 25000
const FAST_COLLECTOR_TIMEOUT_MS = 12000

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
    withTimeout(googleSearchCollector(input), SEARCH_COLLECTOR_TIMEOUT_MS, [] as NormalizedTrend[]),
    withTimeout(youtubeCollector(input), FAST_COLLECTOR_TIMEOUT_MS, [] as NormalizedTrend[]),
    withTimeout(naverCollector(input), FAST_COLLECTOR_TIMEOUT_MS, [] as NormalizedTrend[]),
    withTimeout(ruliwebCollector(input), SEARCH_COLLECTOR_TIMEOUT_MS, [] as NormalizedTrend[]),
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
      ? `Here is a pre-verified list of what's currently trending, aggregated and scored from real data sources (Google Search, YouTube, Naver, Ruliweb) — sourceCount is how many independent sources confirmed it, compositeScore is its overall strength (0-100+):\n${JSON.stringify(
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

// This step has no search tool attached (plain generation), but it does serialize the
// full product catalog into the prompt — this project already measured that shape of
// call taking anywhere from a few seconds up to 100+ seconds in production. 15s was
// too tight and was cutting it off constantly. Worst-case total budget: 25s
// (collectors, parallel) + 10s (grouping) + 30s (this) = 65s, leaving ~25s headroom
// under vercel.json's 90s maxDuration.
const RECOMMEND_TIMEOUT_MS = 30000

interface GeneratedRecommendations {
  recommendations: Recommendation[]
  trendSummary: string
}

async function generateRecommendations(
  brief: ClientBrief,
  matchedTrends: MatchedTrend[],
  language: Language,
): Promise<GeneratedRecommendations> {
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

  return { recommendations, trendSummary: parsed.trendSummary }
}

async function callAgent(brief: ClientBrief, language: Language): Promise<AgentRecommendResponse> {
  const collectorInput = deriveCollectorInput(brief)
  const allTrends = await collectAllTrends(collectorInput)
  const matchedTrends = await crossMatchTrends(allTrends)

  const generated = await withTimeout(generateRecommendations(brief, matchedTrends, language), RECOMMEND_TIMEOUT_MS, null)

  if (generated) {
    return { ...generated, matchedTrends, usedFallback: false }
  }

  // The final matching step itself timed out — degrade to local matching rather than
  // failing outright, but keep whatever real trend evidence collection did succeed
  // rather than throwing it away just because the last step ran out of time.
  return {
    recommendations: getRecommendations(brief, products, { language }),
    trendSummary:
      language === 'ko'
        ? '실시간 트렌드 데이터는 수집했지만, 최종 매칭 단계가 시간 초과되어 로컬 매칭 결과를 대신 보여드립니다.'
        : 'Live trend data was collected, but the final matching step timed out — showing locally matched picks instead.',
    matchedTrends,
    usedFallback: true,
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
