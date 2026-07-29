import { useState } from 'react'

const TABS = ['주문연동 결제', '추가 결제'] as const

export default function PaymentPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('주문연동 결제')

  return (
    <div className="px-10 pt-2 pb-24">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-neutral-900">결제 관리</h2>
        <button
          type="button"
          className="rounded-md bg-indigo-50 px-2.5 py-1 text-[13px] font-semibold text-indigo-500 hover:bg-indigo-100"
        >
          통장사본 다운받기
        </button>

        <div className="ml-auto flex items-center gap-3">
          <select
            aria-label="상태 필터"
            className="w-32 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500 outline-none focus:border-indigo-400"
          >
            <option>전체 상태</option>
            <option>결제 대기</option>
            <option>결제 완료</option>
          </select>
          <div className="flex min-w-[220px] items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2">
            <input
              placeholder="검색어를 입력해주세요"
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-300"
            />
            <span className="text-neutral-300">🔍</span>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="mt-6 flex gap-6 border-b border-neutral-100">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2.5 text-[15px] font-semibold transition-colors ${
              tab === t
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-300 hover:text-neutral-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 빈 상태 */}
      <div className="flex flex-col items-center justify-center py-32">
        <span className="text-4xl text-indigo-200">💳</span>
        <p className="mt-4 text-lg font-bold text-neutral-800">아직 진행이 필요한 결제가 없어요</p>
        <p className="mt-2 text-sm text-neutral-400">
          진행중인 주문의 작업계획서가 모두 확정되면 결제가 자동으로 요청돼요
        </p>
      </div>
    </div>
  )
}
