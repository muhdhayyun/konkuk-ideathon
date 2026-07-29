import type { VercelRequest, VercelResponse } from '@vercel/node'
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk'
import { GoogleAuth } from 'google-auth-library'
import type Anthropic from '@anthropic-ai/sdk'
import type { ClientBrief, Product, Recommendation } from '../src/pages/client-form/types'
import { products } from '../src/pages/client-form/data/products'
import { getRecommendations } from '../src/pages/client-form/lib/matcher'

interface AgentRecommendResponse {
  recommendations: Recommendation[]
  trendSummary: string
  sourcesUsed: string[]
  usedFallback: boolean
}

const MODEL = 'claude-opus-4-8'

// Vertex only exposes the basic web_search tool variant (no dynamic-filtering _20260209 variant there).
const WEB_SEARCH_TOOL = { type: 'web_search_20250305', name: 'web_search' } as const

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          matchScore: { type: 'integer' },
          reasonWhy: { type: 'string' },
        },
        required: ['productId', 'matchScore', 'reasonWhy'],
        additionalProperties: false,
      },
    },
    trendSummary: { type: 'string' },
    sourcesUsed: { type: 'array', items: { type: 'string' } },
  },
  required: ['recommendations', 'trendSummary', 'sourcesUsed'],
  additionalProperties: false,
}

let vertexClient: AnthropicVertex | null = null

// AnthropicVertex's constructor kicks off Google auth resolution as an
// internal, unawaited promise (`this._authClientPromise = auth.getClient()`).
// If that promise rejects before anything attaches a handler to it, Node
// treats it as an unhandled rejection and kills the whole process — which
// bypasses any try/catch around code that merely constructs the client.
// Resolving the auth client ourselves, awaited inside our own try block,
// keeps a credential failure inside our normal error handling instead.
async function getVertexClient(): Promise<AnthropicVertex> {
  if (vertexClient) return vertexClient

  const googleAuth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      // Vercel's env var UI can flatten real newlines to literal "\n" — restore them.
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })
  const authClient = await googleAuth.getClient()

  vertexClient = new AnthropicVertex({
    projectId: process.env.GOOGLE_VERTEX_PROJECT,
    region: process.env.GOOGLE_VERTEX_LOCATION || 'global',
    authClient,
  })
  return vertexClient
}

function buildPrompt(brief: ClientBrief): string {
  return `I'm sourcing corporate merch for a ${brief.industry} client. Occasion: ${brief.occasion}. Recipient: ${brief.recipient}. Desired feeling: ${brief.emotionalOutcomes.join(', ')}. Budget per unit: ${brief.budgetTier}. Quantity: ${brief.quantity}.${brief.notes ? ` Additional notes: ${brief.notes}` : ''}

Search for current (last 1-3 months) corporate gifting and merch trends relevant to this brief.

Here is our product catalog:
${JSON.stringify(products, null, 2)}

Recommend the top 3-5 products from this catalog that best match both the client's stated needs AND the trends you found. For each, give a matchScore (0-100) and a one-line reasonWhy that references the trend you found.`
}

const SYSTEM_PROMPT = `You are a corporate merch trend-matching agent. Use the web_search tool to research current gifting/merch trends, then recommend products from the given catalog.

Respond with ONLY a single JSON object matching this exact shape, no markdown fences, no commentary before or after:
{
  "recommendations": [
    { "productId": "string (must be an id from the given catalog)", "matchScore": 0-100, "reasonWhy": "string, must mention the trend it found" }
  ],
  "trendSummary": "2-3 sentence summary of what's currently trending for this brief",
  "sourcesUsed": ["url1", "url2"]
}`

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  return JSON.parse(cleaned)
}

function findTextBlock(content: Anthropic.ContentBlock[]): string {
  const block = content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  if (!block) throw new Error('No text block in agent response')
  return block.text
}

async function callAgent(brief: ClientBrief): Promise<AgentRecommendResponse> {
  const client = await getVertexClient()

  let messages: Anthropic.MessageParam[] = [{ role: 'user', content: buildPrompt(brief) }]

  let response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [WEB_SEARCH_TOOL],
    output_config: { format: { type: 'json_schema', schema: RESPONSE_SCHEMA } },
    messages,
  })

  // Server-side web_search loop caps at 10 iterations; resume once if paused.
  if (response.stop_reason === 'pause_turn') {
    messages = [...messages, { role: 'assistant', content: response.content }]
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [WEB_SEARCH_TOOL],
      output_config: { format: { type: 'json_schema', schema: RESPONSE_SCHEMA } },
      messages,
    })
  }

  const content = response.content
  const text = findTextBlock(content)
  const parsed = extractJson(text) as {
    recommendations: { productId: string; matchScore: number; reasonWhy: string }[]
    trendSummary: string
    sourcesUsed: string[]
  }

  const productsById = new Map(products.map((p) => [p.id, p]))
  const recommendations: Recommendation[] = parsed.recommendations
    .map((r) => {
      const product = productsById.get(r.productId)
      if (!product) return null
      return { product, matchScore: r.matchScore, reasonWhy: r.reasonWhy } satisfies Recommendation
    })
    .filter((r): r is Recommendation => r !== null)

  return {
    recommendations,
    trendSummary: parsed.trendSummary,
    sourcesUsed: parsed.sourcesUsed,
    usedFallback: false,
  }
}

function fallbackResponse(brief: ClientBrief): AgentRecommendResponse {
  return {
    recommendations: getRecommendations(brief, products),
    trendSummary: 'Live trend search is unavailable right now — showing locally matched picks instead.',
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
