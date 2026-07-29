import type { NormalizedTrend } from '../../types/trend.js'
import type { CollectorInput } from './types.js'
import { getGeminiClient, GEMINI_MODEL } from '../geminiClient.js'
import { TAG_VOCABULARY } from './tagVocabulary.js'

const TAG_QUERY_TEMPLATES_KO: Record<string, string> = {
  sustainable: '친환경 기업 선물',
  'eco-friendly': '친환경 판촉물',
  'tech-forward': '테크 기업 선물',
  premium: '프리미엄 기업 선물',
  luxury: '럭셔리 기업 선물',
  customizable: '맞춤 제작 굿즈',
  wellness: '웰니스 기업 선물',
  playful: '재미있는 회사 굿즈',
  professional: '전문적인 비즈니스 선물',
  minimalist: '미니멀 기업 선물',
  experiential: '체험형 기업 선물',
  engravable: '각인 선물',
  apparel: '브랜드 의류 굿즈',
  everyday: '실용적인 기업 선물',
  giftset: '기업 선물 세트',
}

const MAX_QUERIES = 2
const RESULTS_PER_QUERY = 10

interface NaverSearchItem {
  title: string
  link: string
  description: string
}
interface NaverSearchResponse {
  total?: number
  items?: NaverSearchItem[]
}

function stripHtml(s: string): string {
  return s.replace(/<\/?b>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
}

function pickQueries(input: CollectorInput): { keyword: string; tag: string }[] {
  const tagQueries = input.tags
    .filter((tag) => tag in TAG_QUERY_TEMPLATES_KO)
    .slice(0, MAX_QUERIES)
    .map((tag) => ({ keyword: TAG_QUERY_TEMPLATES_KO[tag], tag }))

  if (tagQueries.length > 0) return tagQueries
  return [{ keyword: `${input.industry} ${input.occasion} 기업 선물`, tag: 'general' }]
}

async function searchNaver(
  keyword: string,
  clientId: string,
  clientSecret: string,
): Promise<NaverSearchResponse> {
  const url = new URL('https://openapi.naver.com/v1/search/blog.json')
  url.searchParams.set('query', keyword)
  url.searchParams.set('display', String(RESULTS_PER_QUERY))
  url.searchParams.set('sort', 'sim')

  const res = await fetch(url.toString(), {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  })
  if (!res.ok) throw new Error(`Naver search failed: ${res.status}`)
  return (await res.json()) as NaverSearchResponse
}

// The ONLY LLM call in this collector — Korean-aware extraction, no search, no scoring.
async function extractTopicAndTags(
  items: NaverSearchItem[],
): Promise<{ topic: string; tags: string[] } | null> {
  if (items.length === 0) return null
  try {
    const ai = getGeminiClient()
    const snippets = items
      .slice(0, 5)
      .map((item, i) => `${i + 1}. ${stripHtml(item.title)} — ${stripHtml(item.description)}`)
      .join('\n')

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Naver blog/news snippets (Korean):\n${snippets}`,
      config: {
        systemInstruction: `These are Korean-language blog/news snippets about corporate gifting. Extract: (1) a short canonical topic phrase in Korean summarizing what these snippets are collectively about, (2) which of these tags apply: ${TAG_VOCABULARY.join(', ')}. Respond with ONLY JSON: {"topic": "string in Korean", "tags": ["tag1", "tag2"]}`,
      },
    })
    const text = response.text
    if (!text) return null
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
    const parsed = JSON.parse(cleaned) as { topic: string; tags: string[] }
    return {
      topic: parsed.topic,
      tags: parsed.tags.filter((tag) => (TAG_VOCABULARY as readonly string[]).includes(tag)),
    }
  } catch {
    return null
  }
}

function computeVolumeScore(total: number): number {
  // Log-scaled: a handful of matching posts vs. tens of thousands isn't linear.
  return Math.min(100, Math.max(0, Math.round((Math.log10(total + 1) / Math.log10(50000)) * 100)))
}

export async function naverCollector(input: CollectorInput): Promise<NormalizedTrend[]> {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    // Intentionally deactivated pending credentials — not broken, not removed.
    console.info('naverCollector: NAVER_CLIENT_ID/SECRET not set — skipping (deactivated pending credentials)')
    return []
  }

  try {
    const queries = pickQueries(input)

    const results = await Promise.all(
      queries.map(async ({ keyword, tag }): Promise<NormalizedTrend | null> => {
        const data = await searchNaver(keyword, clientId, clientSecret)
        const items = data.items ?? []
        if (items.length === 0) return null

        const extracted = await extractTopicAndTags(items)
        const tags = [...new Set([...(tag === 'general' ? [] : [tag]), ...(extracted?.tags ?? [])])]

        return {
          source: 'naver',
          topic: extracted?.topic ?? keyword,
          volumeScore: computeVolumeScore(data.total ?? items.length),
          growthRatePct: null, // single snapshot search, no historical series — never estimate
          timeframe: '1m',
          tags,
          sourceUrl: items[0].link, // real Naver post link, not a redirect
          confidence: 'verified',
        }
      }),
    )

    return results.filter((r): r is NormalizedTrend => r !== null)
  } catch {
    return []
  }
}
