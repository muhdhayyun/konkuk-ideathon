import type { NormalizedTrend } from '../../types/trend.js'
import type { CollectorInput } from './types.js'
import { getGeminiClient, GEMINI_MODEL, extractJsonFromMixedText } from '../geminiClient.js'
import { resolveAll } from '../urlResolve.js'
import { TAG_VOCABULARY } from './tagVocabulary.js'

function buildQuery(input: CollectorInput): string {
  const tagPart = input.tags.length > 0 ? input.tags.join(', ') : input.occasion
  return `site:ruliweb.com ${input.industry} ${tagPart} 기업 선물 트렌드`
}

// Confirmed via real production logs (googleSearchCollector, same googleSearch-tool +
// JSON-only-output shape): a GroundingSupport ties a citation to a *segment of the
// model's own output text*, so asking for terse JSON only gives grounding nothing to
// attach a source to — groundingChunks comes back empty even when a real search
// happened. Ask for natural prose first, then a fenced JSON block after it for parsing.
const SYSTEM_PROMPT = `You are researching what's trending on ruliweb.com (a Korean gaming/tech community forum) related to corporate gifting and merch. Use Google Search scoped to ruliweb.com only — include "site:ruliweb.com" in your search queries. Only report findings you can attribute to an actual ruliweb.com page from your search results.

First, write 2-4 sentences of natural prose summarizing what you found on ruliweb.com, mentioning specific posts/topics by name.

Then, on a new line, output a fenced JSON code block extracting structured data from what you just wrote:
\`\`\`json
{
  "trends": [
    { "topic": "short topic phrase", "tags": ["tag from this list: ${TAG_VOCABULARY.join(', ')}"] }
  ]
}
\`\`\`
If you found nothing relevant on ruliweb.com, write one sentence saying so and use {"trends": []}.`

interface ParsedRuliwebResponse {
  trends: { topic: string; tags: string[] }[]
}

export async function ruliwebCollector(input: CollectorInput): Promise<NormalizedTrend[]> {
  const start = Date.now()
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
    console.info(`ruliwebCollector: generateContent returned after ${Date.now() - start}ms`)

    const text = response.text
    if (!text) {
      console.info('ruliwebCollector: response had no text — returning []')
      return []
    }

    let parsed: ParsedRuliwebResponse
    try {
      parsed = extractJsonFromMixedText(text) as ParsedRuliwebResponse
    } catch (parseErr) {
      console.error('ruliwebCollector: JSON.parse failed, raw text was:', text, parseErr)
      return []
    }

    if (parsed.trends.length === 0) {
      console.info('ruliwebCollector: model reported 0 trends — returning []')
      return []
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
    const rawUrls = [
      ...new Set(groundingChunks.map((c) => c.web?.uri).filter((uri): uri is string => Boolean(uri))),
    ]
    if (rawUrls.length === 0) {
      console.info(
        `ruliwebCollector: parsed ${parsed.trends.length} trends but groundingChunks had 0 usable URLs — returning [] (grounding may not have triggered)`,
      )
      return []
    }

    // Grounding chunks come back as opaque vertexaisearch.cloud.google.com redirect
    // links, never the real domain — so the "is this actually ruliweb.com" check has to
    // happen AFTER resolving, not on the raw redirect URI. This is a hard, code-enforced
    // site restriction: don't just trust the model's obedience to "site:ruliweb.com" in
    // the prompt — if grounding didn't actually resolve to a ruliweb.com page, we have no
    // real evidence at all, regardless of what the model claims.
    const resolved = await resolveAll(rawUrls)
    const ruliwebUrls = [...resolved.values()].filter((url) => url.includes('ruliweb'))
    if (ruliwebUrls.length === 0) {
      console.info(
        `ruliwebCollector: resolved ${rawUrls.length} grounding URLs but none were ruliweb.com — returning []`,
      )
      return []
    }

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
  } catch (err) {
    console.error(`ruliwebCollector: threw after ${Date.now() - start}ms —`, err)
    return []
  }
}
