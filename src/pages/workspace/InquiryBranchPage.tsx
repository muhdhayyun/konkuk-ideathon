import { useNavigate } from 'react-router-dom'

export default function InquiryBranchPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="px-8 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-lg font-bold text-neutral-900"
        >
          <span className="text-neutral-300">‹</span> 문의하기
        </button>
      </header>

      <main className="flex flex-col items-center pt-16 pb-24">
        <h1 className="text-xl font-bold text-neutral-900">제작할 제품을 정하셨나요?</h1>
        <p className="mt-2 text-sm text-neutral-500">상황에 맞는 문의 방식으로 도와드릴게요</p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/estimate-requests/create')}
            className="flex w-64 flex-col items-center rounded-2xl bg-white px-8 py-12 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-7xl">📂</span>
            <p className="mt-8 text-[15px] font-bold text-neutral-900">제작할 품목을 정했어요</p>
            <p className="mt-1.5 text-[13px] text-neutral-400">자유롭게 문의해보세요</p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/inquiry/recommend')}
            className="flex w-64 flex-col items-center rounded-2xl bg-white px-8 py-12 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-7xl">🗂️</span>
            <p className="mt-8 text-[15px] font-bold text-neutral-900">아직 정하지 못 했어요</p>
            <p className="mt-1.5 text-[13px] text-neutral-400">상황에 맞는 제품을 제안해드릴게요</p>
          </button>
        </div>
      </main>
    </div>
  )
}
