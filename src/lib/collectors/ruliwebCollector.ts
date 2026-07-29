import type { NormalizedTrend } from '../../types/trend.js'
import type { CollectorInput } from './types.js'
import { getGeminiClient, GEMINI_MODEL } from '../geminiClient.js'
import { resolveAll } from '../urlResolve.js'
import { TAG_VOCABULARY } from './tagVocabulary.js'

function buildQuery(input: CollectorInput): string {
  const tagPart = input.tags.length > 0 ? input.tags.join(', ') : input.occasion
  return `site:ruliweb.com ${input.industry} ${tagPart} 기업 선물 트렌드`
}

const SYSTEM_PROMPT = `You are researching what's trending on ruliweb.com (a Korean gaming/tech community forum) related to corporate gifting and merch. Use Google Search scoped to ruliweb.com only — include "site:ruliweb.com" in your search queries. Only report findings you can attribute to an actual ruliweb.com page from your search results.

Respond with ONLY JSON, no markdown fences:
{
  "trends": [
    { "topic": "short topic phrase", "tags": ["tag from this list: ${TAG_VOCABULARY.join(', ')}"] }
  ]
}
If you found nothing relevant on ruliweb.com, respond with {"trends": []}.`

interface ParsedRuliwebResponse {
  trends: { topic: string; tags: string[] }[]
}

export async function ruliwebCollector(input: CollectorInput): Promise<NormalizedTrend[]> {
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
    const parsed = JSON.parse(cleaned) as ParsedRuliwebResponse

    if (parsed.trends.length === 0) return []

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
    const rawUrls = [
      ...new Set(groundingChunks.map((c) => c.web?.uri).filter((uri): uri is string => Boolean(uri))),
    ]
    if (rawUrls.length === 0) return []

    // Grounding chunks come back as opaque vertexaisearch.cloud.google.com redirect
    // links, never the real domain — so the "is this actually ruliweb.com" check has to
    // happen AFTER resolving, not on the raw redirect URI. This is a hard, code-enforced
    // site restriction: don't just trust the model's obedience to "site:ruliweb.com" in
    // the prompt — if grounding didn't actually resolve to a ruliweb.com page, we have no
    // real evidence at all, regardless of what the model claims.
    const resolved = await resolveAll(rawUrls)
    const ruliwebUrls = [...resolved.values()].filter((url) => url.includes('ruliweb'))
    if (ruliwebUrls.length === 0) return []

    const primaryUrl = ruliwebUrls[0]
    // Real (not fabricated) signal: how many distinct ruliweb.com pages grounding
    // actually returned, not a model-guessed popularity number.
    const volumeScore = Math.min(100, ruliwebUrls.length * 20)

    return parsed.trends.slice(0, 5).map((t) => ({
      source: 'ruliweb' as const,
      topic: t.topic,
      volumeScore,
      growthRatePct: null, // no historical series available from a single search call — never estimate
      timeframe: '1m' as const,
      tags: t.tags.filter((tag) => (TAG_VOCABULARY as readonly string[]).includes(tag)),
      sourceUrl: primaryUrl,
      // Always unverified: this came from an LLM summarizing search results, not a
      // deterministic API — no ground truth to check the claim itself against, only
      // whether the cited page is real (which we did check above).
      confidence: 'unverified' as const,
    }))
  } catch {
    return []
  }
}
