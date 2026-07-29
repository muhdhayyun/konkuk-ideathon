interface StepCardProps {
  label: string
  icon?: string
  selected: boolean
  onClick: () => void
}

export default function StepCard({ label, icon, selected, onClick }: StepCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ${
        selected
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  )
}
