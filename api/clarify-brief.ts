import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenAI } from '@google/genai'
import type { ClientBrief } from '../src/pages/client-form/types/index.js'

type Language = 'en' | 'ko'

// Gemini 2.5 Pro, not Flash — judging vagueness and writing good targeted follow-up
// questions needs the stronger reasoning tier. Flash stays on the existing trend/
// grounding call in api/agent-recommend.ts, which this file does not touch.
const MODEL = 'gemini-2.5-pro'

interface ClarifyRequestBody {
  brief: ClientBrief
  language?: Language
}

interface ClarifySuggestionField {
  field: 'notes'
  examples: string[]
}

interface ClarifyResponseBody {
  isVague: boolean
  suggestions: ClarifySuggestionField[]
}

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
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    },
  })
  return client
}

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  return JSON.parse(cleaned)
}

// The form's brief has exactly one free-text field ("notes") — industry, occasion,
// budget, etc. are all fixed dropdowns/checkboxes, so a suggestion chip can only ever
// usefully fill/append text into notes. The spec this was built from allowed suggestions
// nested by arbitrary field name (e.g. "desiredOutcome"); adapted here to always target
// "notes" since that's the only field a tappable text example can actually act on.
function systemPrompt(language: Language): string {
  const languageInstruction =
    language === 'ko'
      ? '\n\nWrite every string in "examples" natively in fluent Korean (한국어) — not a translated label.'
      : ''

  return `You help a client sharpen a vague corporate-gifting brief before recommendations are generated. This form has exactly ONE free-text field: "notes" — every other field is already a fixed dropdown or checkbox choice. Judge whether the brief (given below as JSON) is specific enough to produce good product recommendations, or too vague/generic.${languageInstruction}

If vague, write 2-3 short, concrete example sentences the client could add to "notes" to make their intent more specific and actionable — e.g. what feeling the gift should evoke, more context on the occasion, or specifics about the recipients. Keep each example short (one sentence).

Respond with ONLY JSON, no markdown fences, no commentary:
{
  "isVague": boolean,
  "suggestions": [ { "field": "notes", "examples": ["...", "..."] } ]
}
"suggestions" has at most one entry (field is always "notes") with at most 3 examples. If the brief is already specific enough, respond {"isVague": false, "suggestions": []}.`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = req.body as ClarifyRequestBody
  const brief = body.brief
  const language: Language = body.language === 'ko' ? 'ko' : 'en'

  try {
    const ai = getClient()
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `ClientBrief:\n${JSON.stringify(brief, null, 2)}`,
      config: { systemInstruction: systemPrompt(language) },
    })

    const text = response.text
    if (!text) throw new Error('No text in Gemini response')

    const parsed = extractJson(text) as ClarifyResponseBody
    res.status(200).json(parsed)
  } catch (err) {
    console.error('clarify-brief failed:', err)
    // Silent-fail contract: the caller treats this the same as "brief looks fine" and
    // proceeds straight to recommendations — never surface an error, never block.
    res.status(200).json({ isVague: false, suggestions: [] } satisfies ClarifyResponseBody)
  }
}
