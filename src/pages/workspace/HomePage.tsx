import { useNavigate } from 'react-router-dom'
import { USER_NAME } from './data/portfolio'
import PeerPicksSection from './components/PeerPicksSection'

const STATS = [
  { label: '도착한 견적서', count: 0 },
  { label: '도착한 답변', count: 0 },
  { label: '도착한 작업계획서', count: 0 },
  { label: '결제 필요', count: 0 },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="px-10 pt-6 pb-24">
      <h2 className="text-lg font-bold text-neutral-900">
        안녕하세요, {USER_NAME}님! 진행상황을 한 눈에 확인해보세요
      </h2>

      <div className="mt-6 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => navigate('/estimate-requests')}
            className="rounded-xl border border-neutral-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="flex items-center gap-1 text-[13px] font-medium text-neutral-500">
              {s.label} <span className="text-neutral-300">›</span>
            </p>
            <p className="mt-4 text-3xl font-bold text-neutral-900">{s.count}</p>
          </button>
        ))}
      </div>

      <PeerPicksSection />

      {/* 티셔츠 간편주문 배너 */}
      <div className="mt-10 flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-100 bg-gradient-to-r from-white via-slate-50 to-indigo-50 p-8">
        <div>
          <p className="text-lg font-bold text-neutral-900">혹시 티셔츠 주문하시나요?</p>
          <p className="mt-1.5 text-sm text-neutral-500">
            더 간편하고 섬세해진 커스텀 티셔츠 주문을 경험해보세요!
          </p>
        </div>
        <div className="hidden items-center gap-3 text-4xl sm:flex">
          <span>👕</span>
          <span className="rotate-12">👕</span>
          <span className="-rotate-6">👕</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/portfolio/1208')}
          className="rounded-lg border border-indigo-300 bg-white px-5 py-2.5 text-sm font-bold text-indigo-500 transition-colors hover:bg-indigo-50"
        >
          쉬운 주문 시작하기
        </button>
      </div>
    </div>
  )
}
