import type { NormalizedTrend } from '../../types/trend.js'
import type { CollectorInput } from './types.js'
import { getGeminiClient, GEMINI_MODEL } from '../geminiClient.js'
import { TAG_VOCABULARY } from './tagVocabulary.js'

const TAG_SEARCH_TERMS: Record<string, string> = {
  sustainable: 'sustainable corporate gift ideas',
  'eco-friendly': 'eco-friendly promotional products',
  'tech-forward': 'tech gadgets corporate gifts',
  premium: 'premium corporate gifts unboxing',
  luxury: 'luxury corporate gifts',
  customizable: 'custom branded merch',
  wellness: 'corporate wellness gift ideas',
  playful: 'fun office swag ideas',
  professional: 'professional business gift ideas',
  minimalist: 'minimalist gift ideas',
  experiential: 'experiential corporate gifts',
  engravable: 'engraved gift ideas',
  apparel: 'branded apparel corporate swag',
  everyday: 'everyday use corporate gifts',
  giftset: 'corporate gift set unboxing',
}

const MAX_QUERIES = 2 // keep YouTube Data API quota usage modest
const MAX_VIDEOS_PER_QUERY = 3
const MAX_COMMENTS_PER_VIDEO = 15

interface YouTubeSearchResponse {
  items?: { id: { videoId: string } }[]
}
interface YouTubeVideoItem {
  id: string
  snippet: { title: string; publishedAt: string }
  statistics: { viewCount?: string }
}
interface YouTubeVideosResponse {
  items?: YouTubeVideoItem[]
}
interface YouTubeCommentThreadsResponse {
  items?: { snippet: { topLevelComment: { snippet: { textOriginal: string } } } }[]
}

function pickQueries(input: CollectorInput): { keyword: string; tag: string }[] {
  const tagQueries = input.tags
    .filter((tag) => tag in TAG_SEARCH_TERMS)
    .slice(0, MAX_QUERIES)
    .map((tag) => ({ keyword: TAG_SEARCH_TERMS[tag], tag }))

  if (tagQueries.length > 0) return tagQueries
  return [{ keyword: `${input.industry} ${input.occasion} corporate gift ideas`, tag: 'general' }]
}

async function searchVideos(keyword: string, apiKey: string): Promise<string[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', keyword)
  url.searchParams.set('type', 'video')
  url.searchParams.set('order', 'relevance')
  url.searchParams.set('maxResults', String(MAX_VIDEOS_PER_QUERY))
  url.searchParams.set('publishedAfter', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`)
  const data = (await res.json()) as YouTubeSearchResponse
  return (data.items ?? []).map((item) => item.id.videoId).filter(Boolean)
}

async function fetchVideoStats(videoIds: string[], apiKey: string): Promise<YouTubeVideoItem[]> {
  if (videoIds.length === 0) return []
  const url = new URL('https://www.googleapis.com/youtube/v3/videos')
  url.searchParams.set('part', 'snippet,statistics')
  url.searchParams.set('id', videoIds.join(','))
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`YouTube videos failed: ${res.status}`)
  const data = (await res.json()) as YouTubeVideosResponse
  return data.items ?? []
}

async function fetchComments(videoId: string, apiKey: string): Promise<string[]> {
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/commentThreads')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('videoId', videoId)
    url.searchParams.set('maxResults', String(MAX_COMMENTS_PER_VIDEO))
    url.searchParams.set('order', 'relevance')
    url.searchParams.set('key', apiKey)

    const res = await fetch(url.toString())
    if (!res.ok) return [] // comments can be disabled on a video — not a hard failure
    const data = (await res.json()) as YouTubeCommentThreadsResponse
    return (data.items ?? []).map((c) => c.snippet.topLevelComment.snippet.textOriginal)
  } catch {
    return []
  }
}

interface VideoWithComments {
  video: YouTubeVideoItem
  tag: string
  comments: string[]
}

// The ONLY LLM call in this collector — pure extraction, no search, no scoring. Batched
// across ALL videos in a single call rather than one call per video: Vertex AI enforces
// a per-minute request quota on the shared Gemini client, and this collector used to be
// responsible for up to 6 of the ~10 Gemini calls one user request could fire (2
// queries x 3 videos each), which was enough on its own to trip 429 RESOURCE_EXHAUSTED
// for the rest of the pipeline.
async function extractTagsForAllVideos(videos: VideoWithComments[]): Promise<Map<number, string[]>> {
  const withComments = videos.map((v, i) => ({ i, comments: v.comments })).filter((v) => v.comments.length > 0)
  if (withComments.length === 0) return new Map()

  try {
    const ai = getGeminiClient()
    const prompt = withComments
      .map((v) => `Video ${v.i}:\n${v.comments.map((c, ci) => `${ci + 1}. ${c}`).join('\n')}`)
      .join('\n\n')

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: `You are given comments from several YouTube videos, each labeled "Video N:". For each video, decide which of these tags apply based on what people are actually praising/discussing: ${TAG_VOCABULARY.join(', ')}. Respond with ONLY JSON, no markdown fences: {"results": [{"index": N, "tags": ["tag1", "tag2"]}]}. Include every video index that was given, even if tags is an empty array.`,
      },
    })
    const text = response.text
    if (!text) return new Map()
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
    const parsed = JSON.parse(cleaned) as { results: { index: number; tags: string[] }[] }
    return new Map(
      parsed.results.map((r) => [
        r.index,
        r.tags.filter((tag) => (TAG_VOCABULARY as readonly string[]).includes(tag)),
      ]),
    )
  } catch {
    return new Map()
  }
}

function computeVolumeScore(video: YouTubeVideoItem): number {
  const views = Number(video.statistics.viewCount ?? 0)
  const ageDays = Math.max(1, (Date.now() - new Date(video.snippet.publishedAt).getTime()) / (24 * 60 * 60 * 1000))
  // Views per day, log-scaled into a 0-100 band — a raw view count isn't comparable
  // across a 3-day-old video and a 3-year-old one.
  const viewsPerDay = views / ageDays
  const score = Math.round((Math.log10(viewsPerDay + 1) / Math.log10(10000)) * 100)
  return Math.min(100, Math.max(0, score))
}

export async function youtubeCollector(input: CollectorInput): Promise<NormalizedTrend[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.info('youtubeCollector: YOUTUBE_API_KEY not set — skipping (deactivated pending credentials)')
    return []
  }

  try {
    const queries = pickQueries(input)
    const videosByTag: { video: YouTubeVideoItem; tag: string }[] = []

    for (const { keyword, tag } of queries) {
      const videoIds = await searchVideos(keyword, apiKey)
      const videos = await fetchVideoStats(videoIds, apiKey)
      videos.forEach((video) => videosByTag.push({ video, tag }))
    }

    const videosWithComments: VideoWithComments[] = await Promise.all(
      videosByTag.map(async ({ video, tag }) => ({ video, tag, comments: await fetchComments(video.id, apiKey) })),
    )

    const extractedTagsByIndex = await extractTagsForAllVideos(videosWithComments)

    return videosWithComments.map(({ video, tag }, i) => {
      const extractedTags = extractedTagsByIndex.get(i) ?? []
      const tags = [...new Set([...(tag === 'general' ? [] : [tag]), ...extractedTags])]

      return {
        source: 'youtube',
        topic: video.snippet.title,
        volumeScore: computeVolumeScore(video),
        growthRatePct: null, // single snapshot, no historical series — never estimate
        timeframe: '3m',
        tags,
        sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
        confidence: 'verified',
      }
    })
  } catch {
    return []
  }
}
