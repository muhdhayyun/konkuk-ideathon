import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import { translateWorkspaceValue } from '../../i18n/translations'
import LanguageToggle from '../../components/LanguageToggle'

const MODES = ['하나의 제품 추천', '키트 구성 추천', '행사 준비 추천'] as const

const PURPOSES = [
  '사내 행사 기념품',
  '고객 증정용 굿즈',
  '신입사원 웰컴키트',
  '행사/부스 운영',
  '판매용 제품 제작',
  '브랜드 홍보물',
  '기타',
]

const PRIORITY_CHIPS = [
  '합리적인 가격',
  '좋은 품질',
  '빠른 제작',
  '소량제작 가능',
  '다양한 선택지',
  '디자인 감도',
  '친환경 제품',
  '완성도 있는 패키징',
]

const INDUSTRIES = [
  '식품',
  '패션',
  '뷰티',
  '가전·디지털',
  '가구·인테리어',
  '생활·주방',
  'IT·통신·게임',
  '스포츠·레저',
  '여행·숙박',
  '엔터테인먼트',
  '문화·예술·디자인',
  '자동차·모빌리티',
  '건설·건자재',
  '제조·화학',
  '유통·물류',
  '유아동',
  '반려동물',
  '미디어·광고',
  '의료·제약·복지',
  '출판·교육',
  '농림수산·광업',
  '기관·협회',
  '기타 서비스업',
  '금융·보험',
]

const HINTS = [
  '입력한 배송 일정에 맞는 제품을 우선 추천해드려요 🗓️',
  '우선순위를 두 가지 모두 선택하면 더 정확한 추천이 가능해요',
  '사용 목적과 컨셉이 자세할수록 추천이 정확해져요',
]

export default function RecommendPage() {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const [mode, setMode] = useState<(typeof MODES)[number] | null>(null)
  const [purpose, setPurpose] = useState('')
  const [quantity, setQuantity] = useState('')
  const [flexibleQuantity, setFlexibleQuantity] = useState(false)
  const [unitBudget, setUnitBudget] = useState('')
  const [wish, setWish] = useState('')
  const [desiredDate, setDesiredDate] = useState('')
  const [fixedDeadline, setFixedDeadline] = useState(false)
  const [priorities, setPriorities] = useState<string[]>([])
  const [industry, setIndustry] = useState('')
  const [hintIndex] = useState(() => Math.floor(Date.now() / 10000) % HINTS.length)
  const [done, setDone] = useState(false)

  const valid = purpose !== '' && quantity.trim() !== '' && unitBudget.trim() !== '' && wish.trim() !== ''

  const togglePriority = (chip: string) =>
    setPriorities((prev) =>
      prev.includes(chip)
        ? prev.filter((c) => c !== chip)
        : prev.length < 2
          ? [...prev, chip]
          : prev,
    )

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50">
        <span className="text-6xl">🎯</span>
        <h1 className="mt-6 text-xl font-bold text-neutral-900">{t('workspace.recommend.doneTitle')}</h1>
        <p className="mt-2 text-sm text-neutral-500">{t('workspace.recommend.doneBody')}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-8 rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white"
        >
          {t('workspace.recommend.doneCta')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between px-8 py-6">
        <button
          type="button"
          onClick={() => navigate('/inquiry')}
          className="flex items-center gap-2 text-lg font-bold text-neutral-400"
        >
          <span className="text-neutral-300">‹</span> {t('workspace.recommend.backBtn')}
        </button>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label={t('workspace.recommend.closeAriaLabel')}
            className="text-2xl text-neutral-400"
          >
            ✕
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl pb-32">
        <h1 className="text-center text-xl font-bold text-neutral-900">
          {mode === null ? t('workspace.recommend.titleModeSelect') : t('workspace.recommend.titleQuestions')}
        </h1>

        <div className="mt-8 flex justify-center gap-3">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg border px-5 py-3 text-sm font-semibold transition-colors ${
                mode === m
                  ? 'border-indigo-400 bg-white text-indigo-500'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {translateWorkspaceValue(m, language)}
            </button>
          ))}
        </div>

        {mode !== null && (
          <>
            <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900">{t('workspace.recommend.requiredSectionTitle')}</h3>

              <p className="mt-6 text-sm font-semibold text-neutral-800">
                {t('workspace.recommend.purposeQuestion')}<span className="text-rose-500">*</span>
              </p>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-3 w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 outline-none focus:border-indigo-400"
              >
                <option value="" disabled>
                  {t('workspace.recommend.selectPlaceholder')}
                </option>
                {PURPOSES.map((p) => (
                  <option key={p}>{translateWorkspaceValue(p, language)}</option>
                ))}
              </select>

              <p className="mt-8 text-sm font-semibold text-neutral-800">
                {t('workspace.recommend.quantityQuestion')}<span className="text-rose-500">*</span>
              </p>
              <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.recommend.quantityHint')}</p>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="ex. 100"
                inputMode="numeric"
                className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
              />
              <label className="mt-3 flex items-center justify-end gap-2 text-[13px] text-neutral-500">
                <input
                  type="checkbox"
                  checked={flexibleQuantity}
                  onChange={(e) => setFlexibleQuantity(e.target.checked)}
                  className="h-4 w-4 accent-indigo-500"
                />
                {t('workspace.recommend.flexibleQuantityLabel')}
              </label>

              <p className="mt-8 text-sm font-semibold text-neutral-800">
                {t('workspace.recommend.budgetQuestion')}<span className="text-rose-500">*</span>
              </p>
              <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.recommend.budgetHint')}</p>
              <input
                value={unitBudget}
                onChange={(e) => setUnitBudget(e.target.value)}
                placeholder="ex. 15,000"
                inputMode="numeric"
                className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
              />

              <p className="mt-8 text-sm font-semibold text-neutral-800">
                {t('workspace.recommend.wishQuestion')}<span className="text-rose-500">*</span>
              </p>
              <textarea
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                rows={4}
                placeholder={t('workspace.recommend.wishPlaceholder')}
                className="mt-3 w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
              />
            </section>

            <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900">{t('workspace.recommend.optionalSectionTitle')}</h3>

              <p className="mt-6 text-sm font-semibold text-neutral-800">
                {t('workspace.recommend.desiredDateQuestion')}{' '}
                <span className="font-normal text-neutral-400">{t('workspace.recommend.optionalTag')}</span>
              </p>
              <input
                value={desiredDate}
                onChange={(e) => setDesiredDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
              />
              <label className="mt-3 flex items-center justify-end gap-2 text-[13px] text-neutral-500">
                <input
                  type="checkbox"
                  checked={fixedDeadline}
                  onChange={(e) => setFixedDeadline(e.target.checked)}
                  className="h-4 w-4 accent-indigo-500"
                />
                {t('workspace.recommend.fixedDeadlineLabel')}
              </label>

              <p className="mt-8 text-sm font-semibold text-neutral-800">{t('workspace.recommend.priorityQuestion')}</p>
              <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.recommend.priorityHint')}</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {PRIORITY_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => togglePriority(chip)}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                      priorities.includes(chip)
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-500'
                        : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'
                    }`}
                  >
                    {translateWorkspaceValue(chip, language)}
                  </button>
                ))}
              </div>

              <p className="mt-8 text-sm font-semibold text-neutral-800">
                {t('workspace.recommend.industryQuestion')}{' '}
                <span className="font-normal text-neutral-400">{t('workspace.recommend.optionalTag')}</span>
              </p>
              <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.recommend.industryHint')}</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {INDUSTRIES.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setIndustry(industry === chip ? '' : chip)}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                      industry === chip
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-500'
                        : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'
                    }`}
                  >
                    {translateWorkspaceValue(chip, language)}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {mode !== null && (
        <>
          <aside className="fixed bottom-24 left-8 hidden w-56 rounded-xl bg-white p-5 shadow-md lg:block">
            <p className="text-[13px] font-medium text-neutral-300">{t('workspace.recommend.hintLabel')}</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {translateWorkspaceValue(HINTS[hintIndex], language)}
            </p>
          </aside>

          <div className="fixed right-8 bottom-8">
            <button
              type="button"
              disabled={!valid}
              onClick={() => setDone(true)}
              className="rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-indigo-600 disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {t('workspace.recommend.submitCta')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
