// Cheap local check, no network — run once, at final wizard submit, to decide whether
// the brief is worth an LLM clarification pass at all (api/clarify-brief.ts). Keeps
// Vertex quota usage minimal: a specific brief skips the LLM call entirely.
import type { ClientBrief } from '../pages/client-form/types'

// Below this many words, free-text notes count as "near-empty." Fires often in
// practice — notes is optional and commonly left blank on the happy path — but that's
// intentional: an empty free-text field is itself a signal the brief could be
// sharpened, which is the whole point of this feature. Tune here if it fires too often
// during a demo.
const MIN_NOTES_WORDS = 3

export function isBriefVague(brief: ClientBrief): boolean {
  const notesWordCount = (brief.notes ?? '').trim().split(/\s+/).filter(Boolean).length

  return (
    brief.emotionalOutcomes.length === 0 || // no desired outcome selected at all
    brief.occasion === '' || // no occasion chosen
    notesWordCount < MIN_NOTES_WORDS // free-text notes near-empty
  )
}
