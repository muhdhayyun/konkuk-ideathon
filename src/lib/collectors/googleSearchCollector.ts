import type { NormalizedTrend } from '../../types/trend.js'
import type { CollectorInput } from './types.js'
import { getGeminiClient, GEMINI_MODEL } from '../geminiClient.js'
import { resolveAll } from '../urlResolve.js'
import { TAG_VOCABULARY } from './tagVocabulary.js'

function buildQuery(input: CollectorInput): string {
  const tagPart = input.tags.length > 0 ? input.tags.join(', ') : input.occasion
  return `current corporate gifting and merch trends: ${input.industry} ${tagPart}`
}

const SYSTEM_PROMPT = `You are researching current (last 1-3 months) corporate gifting and merch trends via general web search. Only report findings you can attribute to an actual page from your search results.

Respond with ONLY JSON, no markdown fences:
{
  "trends": [
    { "topic": "short topic phrase", "tags": ["tag from this list: ${TAG_VOCABULARY.join(', ')}"] }
  ]
}
If you found nothing relevant, respond with {"trends": []}.`

interface ParsedSearchResponse {
  trends: { topic: string; tags: string[] }[]
}

// This is Gemini summarizing general Google Search results (via grounding), not real
// Google Trends interest-over-time data — no API key exists for the latter, and the
// unofficial endpoint that used to back this collector was unreliably rate-limited.
// Source id/label reflect what this actually is: a search summary, not a Trends metric.
export async function googleSearchCollector(input: CollectorInput): Promise<NormalizedTrend[]> {
  try {
    const ai = getGeminiClient()
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildQuery(input),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
      },
    })

    const text = response.text
    if (!text) return []

    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
    const parsed = JSON.parse(cleaned) as ParsedSearchResponse

    if (parsed.trends.length === 0) return []

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
    const rawUrls = [
      ...new Set(groundingChunks.map((c) => c.web?.uri).filter((uri): uri is string => Boolean(uri))),
    ]
    if (rawUrls.length === 0) return []

    // Grounding chunks come back as opaque vertexaisearch.cloud.google.com redirect
    // links — resolve to real destinations before showing/counting them.
    const resolved = await resolveAll(rawUrls)
    const resolvedUrls = [...resolved.values()]
    const primaryUrl = resolvedUrls[0]
    // Real (not fabricated) signal: how many distinct pages grounding actually
    // returned, not a model-guessed popularity number.
    const volumeScore = Math.min(100, resolvedUrls.length * 15)

    return parsed.trends.slice(0, 5).map((t) => ({
      source: 'google_search' as const,
      topic: t.topic,
      volumeScore,
      growthRatePct: null, // no historical series available from a single search call — never estimate
      timeframe: '1m' as const,
      tags: t.tags.filter((tag) => (TAG_VOCABULARY as readonly string[]).includes(tag)),
      sourceUrl: primaryUrl,
      // Always unverified: this came from an LLM summarizing search results, not a
      // deterministic API — no ground truth to check the claim itself against, only
      // whether the cited pages are real (which we did check above).
      confidence: 'unverified' as const,
    }))
  } catch {
    return []
  }
}
