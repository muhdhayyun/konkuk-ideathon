import { useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'

interface ClarifySuggestionsProps {
  loading: boolean
  suggestions: string[]
  notes: string
  onNotesChange: (notes: string) => void
  onContinue: () => void
}

// Button-first, not a typing task: tapping a suggestion toggles it on/off, and the
// composed notes value is rebuilt automatically from whichever ones are selected — no
// manual typing needed for the common case. "Other" is the one deliberate escape hatch
// for something the auto-generated suggestions didn't cover; its text field only
// appears once explicitly chosen, so it never competes with the buttons as the default
// interaction. Not a chat modal — a single extra screen between Summary and Results.
// "Continue to recommendations" is always available regardless of loading state: this
// never blocks submission, it's a quality nudge only.
export default function ClarifySuggestions({
  loading,
  suggestions,
  notes,
  onNotesChange,
  onContinue,
}: ClarifySuggestionsProps) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [otherEnabled, setOtherEnabled] = useState(false)
  const [otherText, setOtherText] = useState('')

  const rebuildNotes = (nextSelected: Set<string>, nextOtherEnabled: boolean, nextOtherText: string) => {
    const parts = [...nextSelected]
    if (nextOtherEnabled && nextOtherText.trim()) parts.push(nextOtherText.trim())
    onNotesChange(parts.join(' '))
  }

  const toggleSuggestion = (s: string) => {
    const next = new Set(selected)
    if (next.has(s)) next.delete(s)
    else next.add(s)
    setSelected(next)
    rebuildNotes(next, otherEnabled, otherText)
  }

  const toggleOther = () => {
    const next = !otherEnabled
    setOtherEnabled(next)
    rebuildNotes(selected, next, otherText)
  }

  const handleOtherTextChange = (text: string) => {
    setOtherText(text)
    rebuildNotes(selected, otherEnabled, text)
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-lg font-semibold text-slate-900">{t('clarify.title')}</h2>

      {loading && <p className="mt-2 text-sm text-slate-400 animate-pulse">{t('clarify.checking')}</p>}

      {!loading && (
        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-2">{t('clarify.nudge')}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => {
              const active = selected.has(s)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSuggestion(s)}
                  className={`rounded-full border px-3 py-1.5 text-xs text-left transition-colors ${
                    active
                      ? 'border-blue-400 bg-blue-100 text-blue-800'
                      : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {s}
                </button>
              )
            })}
            <button
              type="button"
              onClick={toggleOther}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                otherEnabled
                  ? 'border-slate-400 bg-slate-200 text-slate-800'
                  : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {t('clarify.otherOption')}
            </button>
          </div>

          {otherEnabled && (
            <textarea
              value={otherText}
              onChange={(e) => handleOtherTextChange(e.target.value)}
              rows={3}
              autoFocus
              placeholder={t('clarify.otherPlaceholder')}
              className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          )}
        </div>
      )}

      {notes && (
        <p className="mt-4 text-xs text-slate-400">
          {t('clarify.notesLabel')}: <span className="text-slate-600">{notes}</span>
        </p>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="mt-6 w-full px-5 py-3 rounded-md bg-blue-600 text-white text-sm font-medium"
      >
        {t('clarify.continue')}
      </button>
    </div>
  )
}
