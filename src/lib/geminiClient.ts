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
