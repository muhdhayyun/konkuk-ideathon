import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PORTFOLIO } from './data/portfolio'

export default function PortfolioDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const item = PORTFOLIO.find((p) => p.id === Number(id))
  const [specTab, setSpecTab] = useState<'draft' | 'editable'>('draft')

  if (!item) {
    return (
      <div className="flex flex-col items-center py-40">
        <p className="text-lg font-bold">제품을 찾을 수 없어요</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white"
        >
          제작 시작하기로 돌아가기
        </button>
      </div>
    )
  }

  const specs = specTab === 'draft' ? item.draftSpecs : item.editableSpecs

  return (
    <div className="px-10 pt-2 pb-24">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-lg font-bold text-neutral-900"
      >
        <span className="text-neutral-300">‹</span> {item.name}
      </button>

      <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(280px,360px)_minmax(360px,1fr)_340px]">
        {/* 제품 이미지 */}
        <div
          className={`flex h-[420px] items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient}`}
        >
          <span className="text-8xl">{item.emoji}</span>
        </div>

        {/* 제품 정보 */}
        <div>
          <p className="text-xs font-medium text-neutral-400">{item.category}</p>
          <h2 className="mt-1 text-xl font-bold text-neutral-900">{item.name}</h2>

          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-neutral-600">
            {item.description.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="mt-6 flex gap-3">
            <div className="rounded-xl border border-neutral-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium whitespace-nowrap text-neutral-400">◎ 개당 단가</p>
              <p className="mt-1.5 text-lg font-bold whitespace-nowrap text-neutral-900">
                {item.unitPrice.toLocaleString()}원{' '}
                <span className="text-xs font-medium text-neutral-400">({item.priceBasis})</span>
              </p>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium whitespace-nowrap text-neutral-400">
                ☑ 총 제작 소요기간
              </p>
              <p className="mt-1.5 text-lg font-bold text-neutral-900">{item.leadTime}</p>
            </div>
          </div>

          {/* 제작 공정 타임라인 */}
          <h3 className="mt-8 text-[15px] font-bold text-neutral-900">제작 공정</h3>
          <ol className="mt-4 space-y-3">
            {item.process.map((step, i) => (
              <li key={step.name} className="flex items-stretch gap-4">
                <div className="flex w-12 flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-xs font-semibold text-neutral-500">
                    {step.days}
                  </span>
                  {i < item.process.length - 1 && (
                    <span className="my-1 w-px flex-1 bg-neutral-200" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between gap-2 rounded-xl border border-neutral-100 bg-white px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-neutral-800">
                    <span className="mr-2 text-indigo-500">{i + 1}</span>
                    {step.name}
                  </p>
                  <p className="self-end text-xs whitespace-nowrap text-neutral-400">
                    🔧 {step.partner} · ☑ {step.duration}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* 사양 패널 */}
        <div className="relative self-start rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <span className="absolute -top-3 right-4 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white">
            실제 제작시, 커스텀 가능한 사양은 더 많아요!
          </span>

          <div className="flex gap-5 border-b border-neutral-100 pb-3">
            <button
              type="button"
              onClick={() => setSpecTab('draft')}
              className={`flex items-center gap-1.5 text-sm font-semibold ${
                specTab === 'draft' ? 'text-neutral-900' : 'text-neutral-300'
              }`}
            >
              시안 반영사양
              <span
                className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] text-white ${
                  specTab === 'draft' ? 'bg-rose-500' : 'bg-neutral-300'
                }`}
              >
                {item.draftSpecs.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSpecTab('editable')}
              className={`flex items-center gap-1.5 text-sm font-semibold ${
                specTab === 'editable' ? 'text-neutral-900' : 'text-neutral-300'
              }`}
            >
              전체 수정가능 사양
              <span
                className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] text-white ${
                  specTab === 'editable' ? 'bg-rose-500' : 'bg-neutral-300'
                }`}
              >
                {item.editableSpecs.length}
              </span>
            </button>
          </div>

          <div className="mt-4 min-h-[220px] space-y-4">
            {specs.map((s) => (
              <div key={s.label}>
                <p className="text-xs font-medium text-neutral-400">{s.label}</p>
                <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700">
                  <span className="text-indigo-500">✔</span> {s.value}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('/estimate-requests/create', { state: { product: item.name } })}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
          >
            제품 사양 커스텀하기
          </button>
        </div>
      </div>
    </div>
  )
}
