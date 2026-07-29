import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenAI } from '@google/genai'
import type { ClientBrief, Product, Recommendation } from '../src/pages/client-form/types/index.js'
import { products } from '../src/pages/client-form/data/products.js'
import { getRecommendations } from '../src/pages/client-form/lib/matcher.js'
import productCatalogData from '../data/product-catalog.json' with { type: 'json' }
import type { ProductCatalogRow } from '../src/types/orderHistory.js'
import { USD_TO_KRW_RATE } from '../src/lib/internal-matcher.js'

// The REAL BrandBoost catalog (parsed from data/BrandBoost_Order_History_2022-2026.xlsx
// — same source Panel A / internal-matcher.ts reads). Gemini is given ONLY this list to
// recommend from, and every recommendation is cross-checked against it after parsing —
// never trust a search-grounded model to only suggest real inventory on its own word.
const catalog = productCatalogData as ProductCatalogRow[]

type Language = 'en' | 'ko'

interface AgentRecommendRequestBody {
  brief: ClientBrief
  language?: Language
}

interface AgentRecommendResponse {
  recommendations: Recommendation[]
  trendSummary: string
  searchQueriesUsed: string[]
  sourcesUsed: string[]
  usedFallback: boolean
}

const MODEL = 'gemini-2.5-flash'

let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (client) return client

  client = new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_VERTEX_PROJECT,
    location: process.env.GOOGLE_VERTEX_LOCATION || 'global',
    googleAuthOptions: {
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Vercel's env var UI can flatten real newlines to literal "\n" — restore them.
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    },
  })
  return client
}

function buildPrompt(brief: ClientBrief, language: Language): string {
  const base = `I'm sourcing corporate merch for a ${brief.industry} client. Occasion: ${brief.occasion}. Recipient: ${brief.recipient}. Desired feeling: ${brief.emotionalOutcomes.join(', ')}. Budget per unit: ${brief.budgetTier}. Quantity: ${brief.quantity}.${brief.notes ? ` Additional notes: ${brief.notes}` : ''}

Search for current (last 1-3 months) corporate gifting and merch trends relevant to this brief.

Here is our REAL product catalog — the only products we actually carry. Do not suggest anything outside this list, even if you find something more trend-relevant in your search:
${JSON.stringify(catalog, null, 2)}

Recommend the top 3-5 products from this catalog that best match both the client's stated needs AND the trends you found. For each, give the exact "product_name" as it appears in the catalog above, a matchScore (0-100), a one-line reasonWhy that references the trend you found, and the specific web page URL(s) from your search results that support that product's trend claim.`

  if (language === 'ko') {
    return `${base}\n\nRespond in Korean (한국어): write "reasonWhy" and "trendSummary" entirely in natural, fluent Korean. Keep JSON keys and the "productName" value in English exactly as given in the catalog. Prefer Korean-language sources when relevant, but include any useful source regardless of language.`
  }
  return base
}

function systemPrompt(language: Language): string {
  const languageInstruction =
    language === 'ko'
      ? '\n\nRespond in Korean: "reasonWhy" and "trendSummary" must be written in natural Korean. JSON keys and productName values stay in English exactly as given.'
      : ''

  return `You are a corporate merch trend-matching agent. Use Google Search to research current gifting/merch trends, then recommend products from the given catalog — never invent or suggest a product that isn't in it.${languageInstruction}

Respond with ONLY a single JSON object matching this exact shape, no markdown fences, no commentary before or after:
{
  "recommendations": [
    { "productName": "string (must exactly match a \"product_name\" from the given catalog)", "matchScore": 0-100, "reasonWhy": "string, must mention the trend it found", "sourceUrls": ["string — URL(s) you actually found via search that support this specific product's trend claim; omit if none apply"] }
  ],
  "trendSummary": "2-3 sentence summary of what's currently trending for this brief"
}`
}

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  return JSON.parse(cleaned)
}

// Vertex AI's grounding chunks point at a vertexaisearch.cloud.google.com redirector,
// not the actual source page. Resolve each to its real destination so users see (and can
// click) the genuine URL rather than an opaque Google redirect link.
async function resolveRedirect(url: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal })
    clearTimeout(timeout)
    return res.url || url
  } catch {
    return url
  }
}

async function resolveAll(urls: string[]): Promise<Map<string, string>> {
  const resolved = new Map<string, string>()
  await Promise.all(
    urls.map(async (url) => {
      resolved.set(url, await resolveRedirect(url))
    }),
  )
  return resolved
}

async function callAgent(brief: ClientBrief, language: Language): Promise<AgentRecommendResponse> {
  const ai = getClient()

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(brief, language),
    config: {
      systemInstruction: systemPrompt(language),
      tools: [{ googleSearch: {} }],
    },
  })

  const text = response.text
  if (!text) throw new Error('No text in Gemini response')

  const parsed = extractJson(text) as {
    recommendations: { productName: string; matchScore: number; reasonWhy: string; sourceUrls?: string[] }[]
    trendSummary: string
  }

  const groundingMetadata = response.candidates?.[0]?.groundingMetadata
  const groundingChunks = groundingMetadata?.groundingChunks ?? []
  // Raw redirect URIs, exactly as Google Search returned them — this is also what the
  // model sees and echoes back in sourceUrls, so matching/validation must use these.
  const rawSourceUrls = [
    ...new Set(groundingChunks.map((chunk) => chunk.web?.uri).filter((uri): uri is string => Boolean(uri))),
  ]
  const searchQueriesUsed = groundingMetadata?.webSearchQueries ?? []
  const groundedUrls = new Set(rawSourceUrls)

  const resolvedUrls = await resolveAll(rawSourceUrls)
  const displayUrl = (url: string) => resolvedUrls.get(url) ?? url

  // Normalized (trim + lowercase) lookup against the REAL catalog we actually gave
  // Gemini — tolerates minor case/whitespace echo differences, but a name that isn't a
  // genuine match gets silently dropped rather than shown as a real product. Search
  // grounding only vouches for the *trend claim*, never for whether we carry the item.
  const normalize = (s: string) => s.trim().toLowerCase()
  const catalogByName = new Map(catalog.map((p) => [normalize(p.product_name), p]))

  const recommendations: Recommendation[] = parsed.recommendations
    .map((r) => {
      const catalogEntry = catalogByName.get(normalize(r.productName))
      if (!catalogEntry) return null

      const product: Product = {
        id: catalogEntry.product_name,
        name: catalogEntry.product_name,
        category: catalogEntry.category,
        basePrice: Math.round(catalogEntry.unit_price_krw / USD_TO_KRW_RATE),
        tags: catalogEntry.trend_tags,
        trendScore: catalogEntry.trend_tags.length > 0 ? 80 : 55,
        industryFit: [],
        toneFit: [],
        minQuantity: 1,
      }

      // Validate against the raw grounded URIs (what the model actually saw), then map to
      // the resolved real URL for display — anything the model claims that Google Search
      // never returned gets silently dropped rather than shown as unverified "proof".
      const sourceUrls = (r.sourceUrls ?? []).filter((url) => groundedUrls.has(url)).map(displayUrl)
      return {
        product,
        matchScore: r.matchScore,
        reasonWhy: r.reasonWhy,
        ...(sourceUrls.length > 0 ? { sourceUrls } : {}),
      } satisfies Recommendation
    })
    .filter((r): r is Recommendation => r !== null)

  const droppedCount = parsed.recommendations.length - recommendations.length
  if (droppedCount > 0) {
    console.info(
      `agent-recommend: dropped ${droppedCount} recommendation(s) not found in the real catalog — ` +
        `model suggested: ${parsed.recommendations.map((r) => r.productName).join(', ')}`,
    )
  }

  return {
    recommendations,
    trendSummary: parsed.trendSummary,
    searchQueriesUsed,
    sourcesUsed: rawSourceUrls.map(displayUrl),
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
    searchQueriesUsed: [],
    sourcesUsed: [],
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
