import { useLanguage } from '../../../i18n/LanguageContext'

interface ClarifySuggestionsProps {
  loading: boolean
  suggestions: string[]
  notes: string
  onNotesChange: (notes: string) => void
  onAppendSuggestion: (text: string) => void
  onContinue: () => void
}

// Inline suggestion chips, not a chat modal — a single extra screen between Summary and
// Results. "Continue to recommendations" is always available regardless of loading
// state: this never blocks submission, it's a quality nudge only. On any clarify-brief
// failure the caller (AgentFormPage) skips this screen's suggestions silently, so this
// component only ever needs to render "loading" or "here are some suggestions" states.
export default function ClarifySuggestions({
  loading,
  suggestions,
  notes,
  onNotesChange,
  onAppendSuggestion,
  onContinue,
}: ClarifySuggestionsProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-lg font-semibold text-slate-900">{t('clarify.title')}</h2>

      {loading && <p className="mt-2 text-sm text-slate-400 animate-pulse">{t('clarify.checking')}</p>}

      {!loading && suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-2">{t('clarify.nudge')}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onAppendSuggestion(s)}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-100 text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <label className="block text-xs font-medium text-slate-500 mb-1">{t('clarify.notesLabel')}</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

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
