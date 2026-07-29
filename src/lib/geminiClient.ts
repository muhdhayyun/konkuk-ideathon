import { GoogleGenAI } from '@google/genai'

export const GEMINI_MODEL = 'gemini-2.5-flash'

let client: GoogleGenAI | null = null

export function getGeminiClient(): GoogleGenAI {
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

export function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  return JSON.parse(cleaned)
}

// For responses that must contain natural-language prose *and* structured data — needed
// when using Google Search grounding, since Google only attaches a grounding citation to
// a text segment the model actually wrote in its own words; a terse JSON-only response
// gives grounding nothing to attach to, so groundingChunks comes back empty even after a
// real search happened. Pulls the fenced ```json ... ``` block out from among any prose
// around it, falling back to parsing the whole trimmed text if no fence is present.
export function extractJsonFromMixedText(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const jsonText = fenceMatch ? fenceMatch[1] : text.trim()
  return JSON.parse(jsonText)
}
