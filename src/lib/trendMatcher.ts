import type { NormalizedTrend } from '../types/trend.js'
import { getGeminiClient, GEMINI_MODEL } from './geminiClient.js'

export interface MatchedTrend {
  canonicalTopic: string
  matchedFrom: NormalizedTrend[]
  sourceCount: number
  compositeScore: number
}

interface GroupingResult {
  groups: { canonicalTopic: string; indices: number[] }[]
}

// The ONLY LLM call in this module — pure grouping. Input is just the list of topic
// strings; no client brief, no product catalog, no scoring. Indices (not topic text)
// are used for reconstruction so duplicate/near-duplicate phrasing can't cause
// ambiguous mapping back to the original entries.
async function groupTopicsByLLM(topics: string[]): Promise<GroupingResult> {
  const indexed = topics.map((t, i) => `${i}: ${t}`).join('\n')

  const ai = getGeminiClient()
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Topics:\n${indexed}`,
    config: {
      systemInstruction: `You are given a numbered list of trend topic phrases collected from different platforms (possibly in different languages — English and Korean). Some phrases refer to the same real-world trend using different wording. Group indices that refer to the same real-world trend together, and give each group a short canonical name in English.

Respond with ONLY JSON, no markdown fences: {"groups": [{"canonicalTopic": "string", "indices": [0, 2, 5]}]}
Every index from 0 to ${topics.length - 1} must appear in exactly one group. A topic with no match to any other should still be its own group of one.`,
    },
  })

  const text = response.text
  if (!text) throw new Error('No text in grouping response')
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  return JSON.parse(cleaned) as GroupingResult
}

// Weights: verified (deterministic API) data counts for more than unverified
// (LLM-summarized) data in the average.
const CONFIDENCE_WEIGHT: Record<NormalizedTrend['confidence'], number> = {
  verified: 1.0,
  unverified: 0.5,
}

// How much a growthRatePct point contributes to the composite score — tune here.
const GROWTH_RATE_FACTOR = 0.2
// How much each additional source appearing in the same group multiplies the score —
// e.g. a trend in 3 sources scores 1 + (3-1)*0.25 = 1.5x a single-source trend.
const SOURCE_COUNT_STEP = 0.25

function computeCompositeScore(matchedFrom: NormalizedTrend[], sourceCount: number): number {
  const weightSum = matchedFrom.reduce((sum, t) => sum + CONFIDENCE_WEIGHT[t.confidence], 0)
  const weightedVolumeSum = matchedFrom.reduce(
    (sum, t) => sum + t.volumeScore * CONFIDENCE_WEIGHT[t.confidence],
    0,
  )
  const baseScore = weightSum > 0 ? weightedVolumeSum / weightSum : 0

  const sourceCountMultiplier = 1 + (sourceCount - 1) * SOURCE_COUNT_STEP

  const growthEntries = matchedFrom.filter((t) => t.growthRatePct !== null)
  const growthContribution =
    growthEntries.length > 0
      ? (growthEntries.reduce((sum, t) => sum + (t.growthRatePct ?? 0), 0) / growthEntries.length) *
        GROWTH_RATE_FACTOR
      : 0

  return Math.round((baseScore * sourceCountMultiplier + growthContribution) * 10) / 10
}

function buildMatchedTrend(canonicalTopic: string, matchedFrom: NormalizedTrend[]): MatchedTrend {
  const sourceCount = new Set(matchedFrom.map((t) => t.source)).size
  return {
    canonicalTopic,
    matchedFrom,
    sourceCount,
    compositeScore: computeCompositeScore(matchedFrom, sourceCount),
  }
}

export async function crossMatchTrends(allTrends: NormalizedTrend[]): Promise<MatchedTrend[]> {
  if (allTrends.length === 0) return []
  if (allTrends.length === 1) return [buildMatchedTrend(allTrends[0].topic, allTrends)]

  try {
    const { groups } = await groupTopicsByLLM(allTrends.map((t) => t.topic))
    return groups
      .map((g) => buildMatchedTrend(g.canonicalTopic, g.indices.map((i) => allTrends[i]).filter(Boolean)))
      .filter((m) => m.matchedFrom.length > 0)
      .sort((a, b) => b.compositeScore - a.compositeScore)
  } catch {
    // Grouping failed — degrade to "no cross-source merging" rather than losing the
    // data entirely. Each trend just becomes its own single-source group.
    return allTrends
      .map((t) => buildMatchedTrend(t.topic, [t]))
      .sort((a, b) => b.compositeScore - a.compositeScore)
  }
}
