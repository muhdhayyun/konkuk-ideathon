import { useNavigate } from 'react-router-dom'

export default function EstimateRequestsPage() {
  const navigate = useNavigate()

  return (
    <div className="px-10 pt-2 pb-24">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-neutral-900">진행중인 문의/주문</h2>
        <button
          type="button"
          onClick={() => navigate('/inquiry')}
          className="rounded-md bg-indigo-50 px-2.5 py-1 text-[13px] font-semibold text-indigo-500 hover:bg-indigo-100"
        >
          문의하기
        </button>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex w-32 items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-400">
            전체 상태 <span>▾</span>
          </div>
          <div className="flex min-w-[220px] items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2">
            <input
              placeholder="검색어를 입력해주세요"
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-300"
            />
            <span className="text-neutral-300">🔍</span>
          </div>
        </div>
      </div>

      {/* 빈 상태 */}
      <div className="flex flex-col items-center justify-center py-36">
        <span className="text-4xl text-indigo-200">📄</span>
        <p className="mt-4 text-lg font-bold text-neutral-800">아직 진행중인 문의와 주문이 없어요</p>
        <p className="mt-2 text-sm text-neutral-400">
          지금 간편 문의하기를 통해 국내 최적의 견적을 받아보세요
        </p>
        <button
          type="button"
          onClick={() => navigate('/inquiry')}
          className="mt-8 rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-indigo-600"
        >
          + 간편 문의하기
        </button>
      </div>
    </div>
  )
}
