import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenAI } from '@google/genai'
import type { ClientBrief, Product, Recommendation } from '../src/pages/client-form/types/index.js'
import { products } from '../src/pages/client-form/data/products.js'
import { getRecommendations } from '../src/pages/client-form/lib/matcher.js'

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

function buildPrompt(brief: ClientBrief): string {
  return `I'm sourcing corporate merch for a ${brief.industry} client. Occasion: ${brief.occasion}. Recipient: ${brief.recipient}. Desired feeling: ${brief.emotionalOutcomes.join(', ')}. Budget per unit: ${brief.budgetTier}. Quantity: ${brief.quantity}.${brief.notes ? ` Additional notes: ${brief.notes}` : ''}

Search for current (last 1-3 months) corporate gifting and merch trends relevant to this brief.

Here is our product catalog:
${JSON.stringify(products, null, 2)}

Recommend the top 3-5 products from this catalog that best match both the client's stated needs AND the trends you found. For each, give a matchScore (0-100) and a one-line reasonWhy that references the trend you found.`
}

const SYSTEM_PROMPT = `You are a corporate merch trend-matching agent. Use Google Search to research current gifting/merch trends, then recommend products from the given catalog.

Respond with ONLY a single JSON object matching this exact shape, no markdown fences, no commentary before or after:
{
  "recommendations": [
    { "productId": "string (must be an id from the given catalog)", "matchScore": 0-100, "reasonWhy": "string, must mention the trend it found" }
  ],
  "trendSummary": "2-3 sentence summary of what's currently trending for this brief"
}`

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  return JSON.parse(cleaned)
}

async function callAgent(brief: ClientBrief): Promise<AgentRecommendResponse> {
  const ai = getClient()

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(brief),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }],
    },
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
      return { product, matchScore: r.matchScore, reasonWhy: r.reasonWhy } satisfies Recommendation
    })
    .filter((r): r is Recommendation => r !== null)

  const groundingMetadata = response.candidates?.[0]?.groundingMetadata
  const groundingChunks = groundingMetadata?.groundingChunks ?? []
  const sourcesUsed = [
    ...new Set(groundingChunks.map((chunk) => chunk.web?.uri).filter((uri): uri is string => Boolean(uri))),
  ]
  const searchQueriesUsed = groundingMetadata?.webSearchQueries ?? []

  return {
    recommendations,
    trendSummary: parsed.trendSummary,
    searchQueriesUsed,
    sourcesUsed,
    usedFallback: false,
  }
}

function fallbackResponse(brief: ClientBrief): AgentRecommendResponse {
  return {
    recommendations: getRecommendations(brief, products),
    trendSummary: 'Live trend search is unavailable right now — showing locally matched picks instead.',
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

  const brief = req.body as ClientBrief

  try {
    const result = await callAgent(brief)
    res.status(200).json(result)
  } catch (err) {
    console.error('agent-recommend failed, falling back to local matcher:', err)
    res.status(200).json(fallbackResponse(brief))
  }
}

export type { AgentRecommendResponse }
export type { Product }
