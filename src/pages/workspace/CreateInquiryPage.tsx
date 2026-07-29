import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface DraftProduct {
  name: string
  quantity: string
  flexibleQuantity: boolean
  desiredDate: string
  fixedDeadline: boolean
  detail: string
  designFile: string
}

const DESIGN_OPTIONS = [
  '네, 제작된 디자인 파일이 있어요',
  '파일이 있지만 추가 작업이 필요해요',
  '아니요, 아직 완성된 디자인 파일이 없어요',
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

const STEPS = ['제작 내용', '제작 상황', '문의 정보'] as const

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mx-auto flex max-w-md items-start justify-center pt-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-start">
          {i > 0 && <span className="mx-3 mt-3.5 h-px w-10 bg-neutral-200" />}
          <div className="flex w-16 flex-col items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                i === current
                  ? 'bg-indigo-500 text-white'
                  : i < current
                    ? 'bg-indigo-100 text-indigo-500'
                    : 'border border-neutral-200 text-neutral-300'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`text-[13px] font-medium whitespace-nowrap ${
                i === current ? 'text-indigo-500' : 'text-neutral-300'
              }`}
            >
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function FileDropPlaceholder() {
  return (
    <button
      type="button"
      className="flex w-full flex-col items-center gap-1 rounded-lg border border-neutral-200 py-8 text-[13px] text-neutral-400 hover:border-neutral-300"
    >
      <span className="text-lg">⬆️</span>
      참고할 이미지나 파일이 있다면 첨부해주세요
    </button>
  )
}

function AddProductModal({
  initialName,
  onClose,
  onAdd,
}: {
  initialName?: string
  onClose: () => void
  onAdd: (p: DraftProduct) => void
}) {
  const [form, setForm] = useState<DraftProduct>({
    name: initialName ?? '',
    quantity: '',
    flexibleQuantity: false,
    desiredDate: '',
    fixedDeadline: false,
    detail: '',
    designFile: '',
  })
  // 디자인 파일이 없을 때: 이후 직접 디자인이 가능한 상황인지
  const [canDesignLater, setCanDesignLater] = useState('')
  // 디자인 가이드 확인 체크
  const [guideChecked, setGuideChecked] = useState(false)

  const noFile = form.designFile === DESIGN_OPTIONS[2]
  const needsGuide =
    form.designFile === DESIGN_OPTIONS[0] || (noFile && canDesignLater === 'can')

  const valid =
    form.name.trim() !== '' &&
    form.quantity.trim() !== '' &&
    form.designFile !== '' &&
    (!noFile || canDesignLater !== '') &&
    (!needsGuide || guideChecked)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-100">
      <header className="flex items-center justify-between px-8 py-6">
        <p className="text-lg font-bold text-neutral-900">제품별 문의</p>
        <button type="button" onClick={onClose} aria-label="닫기" className="text-2xl text-neutral-400">
          ✕
        </button>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 pb-32">
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900">제작 내용</h3>

          <div className="mt-6">
            <p className="text-sm font-semibold text-neutral-800">
              제작하고 싶은 제품을 입력해주세요<span className="text-rose-500">*</span>
            </p>
            <p className="mt-1 text-[13px] text-neutral-400">
              <span className="text-rose-500">한 제품 기준</span>으로 작성해주세요. 여러 제품은 나누어
              등록해야 정확한 안내가 가능합니다
            </p>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ex. 반팔티셔츠"
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-neutral-800">
              원하는 수량을 입력해주세요<span className="text-rose-500">*</span>
            </p>
            <p className="mt-1 text-[13px] text-neutral-400">
              아직 정해지지 않았다면 대략적인 수량만 입력해주셔도 괜찮아요
            </p>
            <input
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="ex. 100"
              inputMode="numeric"
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
            <label className="mt-3 flex items-center justify-end gap-2 text-[13px] text-neutral-500">
              <input
                type="checkbox"
                checked={form.flexibleQuantity}
                onChange={(e) => setForm({ ...form, flexibleQuantity: e.target.checked })}
                className="h-4 w-4 accent-indigo-500"
              />
              예산에 맞춰 유동적으로 변경 가능해요
            </label>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-neutral-800">
              희망 수령일이 있으신가요? <span className="font-normal text-neutral-400">(선택)</span>
            </p>
            <p className="mt-1 text-[13px] text-neutral-400">
              최대한 희망 수령일에 맞는 기업과 매치해드릴게요. 지나치게 촉박한 일정은 불가능할 수
              있어요.
            </p>
            <input
              value={form.desiredDate}
              onChange={(e) => setForm({ ...form, desiredDate: e.target.value })}
              placeholder="ex. 1월 2일 오후 10시 전까지"
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
            <label className="mt-3 flex items-center justify-end gap-2 text-[13px] text-neutral-500">
              <input
                type="checkbox"
                checked={form.fixedDeadline}
                onChange={(e) => setForm({ ...form, fixedDeadline: e.target.checked })}
                className="h-4 w-4 accent-indigo-500"
              />
              납기일 조정이 불가해요
            </label>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-neutral-800">
              어떻게 제작을 원하시나요?<span className="text-rose-500">*</span>
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-indigo-300 bg-indigo-50/40 px-4 py-3">
              <p className="text-[13px] text-neutral-600">
                💬{' '}
                {form.name.trim() === ''
                  ? '위에서 제작하고 싶은 제품을 먼저 입력해주시면 구체화를 도와드릴게요'
                  : '어떤 형태로 제작할지 고민되시나요? 구체화 할 수 있도록 도와드릴게요'}
              </p>
              <button
                type="button"
                className={`text-[13px] font-semibold whitespace-nowrap ${
                  form.name.trim() === '' ? 'text-neutral-300' : 'text-indigo-500'
                }`}
              >
                다른 형태 고르기 ›
              </button>
            </div>
            <textarea
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              rows={4}
              placeholder={
                '품질, 재질, 사이즈, 인쇄, 디자인 등 원하는 내용을 자유롭게 입력해주세요\nex. 흰색 컬러, 양면인쇄 필요, 인쇄 영역 대략 A3 사이즈'
              }
              className="mt-3 w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
            <div className="mt-3">
              <FileDropPlaceholder />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900">디자인 파일</h3>
          <p className="mt-4 text-sm font-semibold text-neutral-800">
            현재 준비된 디자인 파일이 있나요?<span className="text-rose-500">*</span>
          </p>
          <p className="mt-1 text-[13px] text-neutral-400">
            디자인 예정이거나 디자인이 어려운 상황이어도 괜찮아요
          </p>
          <div className="mt-4 space-y-3">
            {DESIGN_OPTIONS.map((opt, i) => (
              <label key={opt} className="flex items-center gap-2.5 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.designFile === opt}
                  onChange={() => {
                    setForm({ ...form, designFile: opt })
                    setCanDesignLater('')
                    setGuideChecked(false)
                  }}
                  className="h-4 w-4 accent-indigo-500"
                />
                {opt}
                {i === 1 && <span className="text-[13px] text-neutral-400">*디자인 작업 요청</span>}
              </label>
            ))}
          </div>
        </section>

        {noFile && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-neutral-800">
              이후에 디자인 작업 후 전달 예정인가요?<span className="text-rose-500">*</span>
              {canDesignLater === '' && (
                <span className="ml-2 text-[13px] font-medium text-rose-500">
                  *필수항목의 선택이 필요해요
                </span>
              )}
            </p>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2.5 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={canDesignLater === 'can'}
                  onChange={() => {
                    setCanDesignLater('can')
                    setGuideChecked(false)
                  }}
                  className="h-4 w-4 accent-indigo-500"
                />
                네, 디자인 할 수 있는 상황이에요
              </label>
              <label className="flex items-center gap-2.5 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={canDesignLater === 'cannot'}
                  onChange={() => {
                    setCanDesignLater('cannot')
                    setGuideChecked(false)
                  }}
                  className="h-4 w-4 accent-indigo-500"
                />
                아니요, 디자인이 어려운 상황이에요{' '}
                <span className="text-neutral-400">(디자인 툴 미숙, 사내 디자인 리소스 부재 등)</span>
              </label>
            </div>
          </section>
        )}

        {needsGuide && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm text-neutral-800">
              아래 가이드에 따라 디자인 파일을 제작하고{' '}
              <span className="font-semibold text-indigo-500">
                [문의/주문 상세 - 히스토리: 제작파일]
              </span>
              을 통해 전달해주세요
            </p>
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-between rounded-lg border border-neutral-200 px-4 py-3.5 text-sm font-semibold text-neutral-700 hover:border-neutral-300"
            >
              <span>📁 브랜드부스트 전용 디자인 가이드 확인하기</span>
              <span className="text-neutral-300">›</span>
            </button>
            <p className="mt-2 text-right text-[13px] text-neutral-400">ⓘ 용어가 이해되지 않아요</p>
            <ul className="mt-4 space-y-1.5 rounded-lg bg-neutral-50 p-5 text-[13px] leading-relaxed text-neutral-600">
              <li>· 실제 인쇄/제작 사이즈(mm/cm)로 디자인을 제작해주세요</li>
              <li>· 색상모드 CMYK로 파일을 설정해주세요 (RGB X)</li>
              <li>· 이미지(jpg/png)가 있는 파일의 경우, 이미지 포함(embed) 작업을 진행해주세요</li>
              <li>· 폰트를 사용한 텍스트가 있는 경우, 윤곽선 처리(Outline Stroke) 작업을 진행해주세요</li>
              <li>· 스티커, 키링 등 '칼선'이 필요한 제품들은 칼선 작업까지 완료해주세요</li>
            </ul>
            <label className="mt-4 flex items-center gap-2.5 text-sm font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={guideChecked}
                onChange={(e) => setGuideChecked(e.target.checked)}
                className="h-4 w-4 accent-indigo-500"
              />
              네, 확인했어요!
              {!guideChecked && (
                <span className="text-[13px] font-medium text-rose-500">
                  *필수항목의 선택이 필요해요
                </span>
              )}
            </label>
          </section>
        )}
      </div>

      <div className="fixed right-8 bottom-8">
        <button
          type="button"
          disabled={!valid}
          onClick={() => onAdd(form)}
          className="rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-indigo-600 disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          제품 추가하기
        </button>
      </div>
    </div>
  )
}

export default function CreateInquiryPage() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { product?: string } }
  const [step, setStep] = useState(0)
  const [products, setProducts] = useState<DraftProduct[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [priorities, setPriorities] = useState<string[]>([])
  const [budget, setBudget] = useState('')
  const [request, setRequest] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [notify, setNotify] = useState<'email' | 'kakao'>('email')
  const [done, setDone] = useState(false)

  const canNext = step === 0 ? products.length > 0 : step === 1 ? true : title.trim() !== ''

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
        <span className="text-6xl">✅</span>
        <h1 className="mt-6 text-xl font-bold text-neutral-900">문의가 접수됐어요</h1>
        <p className="mt-2 text-sm text-neutral-500">
          담당 매니저가 확인 후 견적서를 보내드릴게요 (데모 화면입니다)
        </p>
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate('/inquiry/report', {
                state: { title, company, products: products.map((p) => p.name) },
              })
            }
            className="rounded-lg border border-indigo-300 bg-white px-6 py-3 text-[15px] font-bold text-indigo-500 hover:bg-indigo-50"
          >
            📊 트렌드 근거 리포트 보기
          </button>
          <button
            type="button"
            onClick={() => navigate('/estimate-requests')}
            className="rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white"
          >
            진행중인 문의/주문 보기
          </button>
        </div>
        <p className="mt-3 text-[13px] text-neutral-400">
          이번 발주 선택의 트렌드 근거를 정리해드렸어요 · 내부 보고에 활용해보세요
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="px-8 py-6">
        <button
          type="button"
          onClick={() => navigate('/inquiry')}
          className="flex items-center gap-2 text-lg font-bold text-neutral-400"
        >
          <span className="text-neutral-300">‹</span> 처음으로 돌아가기
        </button>
      </header>

      <StepIndicator current={step} />

      <main className="mx-auto max-w-2xl pt-10 pb-32">
        {step === 0 && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900">제작 내용</h3>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-800">
                  제작 하고 싶은 제품을 추가해주세요<span className="text-rose-500">*</span>
                </p>
                <p className="mt-1 text-[13px] text-neutral-400">
                  아래 버튼을 눌러 한 제품씩 추가해주세요
                </p>
              </div>
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="rounded-lg bg-indigo-50 px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-indigo-500 hover:bg-indigo-100"
                >
                  + 제품 추가하기
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {products.map((p, i) => (
                <div key={`${p.name}-${i}`} className="rounded-xl border border-neutral-200 p-5">
                  <div className="flex items-start gap-2">
                    <p className="text-[15px] font-bold text-neutral-900">{p.name}</p>
                    <button
                      type="button"
                      aria-label="제품 삭제"
                      onClick={() => setProducts(products.filter((_, j) => j !== i))}
                      className="text-neutral-300 hover:text-neutral-500"
                    >
                      ✕
                    </button>
                  </div>
                  <dl className="mt-3 space-y-1.5 text-[13px]">
                    <div className="flex gap-3">
                      <dt className="w-7 shrink-0 text-neutral-300">수량</dt>
                      <dd className="text-neutral-700">
                        {p.quantity}
                        {p.flexibleQuantity && ' (유동적)'}
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-7 shrink-0 text-neutral-300">기간</dt>
                      <dd className="text-neutral-700">{p.desiredDate || '-'}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-7 shrink-0 text-neutral-300">내용</dt>
                      <dd className="line-clamp-1 text-neutral-700">{p.detail || '-'}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-7 shrink-0 text-neutral-300">파일</dt>
                      <dd className="line-clamp-1 text-neutral-700">
                        {p.designFile.replace(/^(네, |아니요, )/, '')}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}

              {products.length === 0 && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="flex h-48 flex-col items-center justify-center rounded-xl border border-neutral-200 text-sm text-neutral-500 hover:border-indigo-300 hover:text-indigo-500"
                >
                  <span className="text-xl">+</span>
                  제품 추가하기
                </button>
              )}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900">
              제작 상황 <span className="text-sm font-normal text-neutral-400">(선택)</span>
            </h3>

            <p className="mt-6 text-sm font-semibold text-neutral-800">
              이번 제작에서 어떤 부분을 가장 중요하게 보시나요?{' '}
              <span className="font-normal text-neutral-400">(선택)</span>
            </p>
            <p className="mt-1 text-[13px] text-neutral-400">최대 두 가지까지 선택해주세요</p>
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
                  {chip}
                </button>
              ))}
            </div>

            <p className="mt-8 text-sm font-semibold text-neutral-800">
              참고할 예산 규모가 있다면 입력해주세요{' '}
              <span className="font-normal text-neutral-400">(선택)</span>
            </p>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="ex. 5백만원 이하, 키트당 4만원 내"
              className="mt-3 w-full max-w-xl rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />

            <p className="mt-8 text-sm font-semibold text-neutral-800">
              추가로 전달하고 싶은 요청사항이 있으신가요?{' '}
              <span className="font-normal text-neutral-400">(선택)</span>
            </p>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={4}
              placeholder="제작을 위해 참고할 요청사항이나 전달할 내용을 자유롭게 입력해주세요"
              className="mt-3 w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
            <div className="mt-3">
              <FileDropPlaceholder />
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900">문의 정보</h3>

            <p className="mt-6 text-sm font-semibold text-neutral-800">
              문의 제목을 설정해주세요<span className="text-rose-500">*</span>
            </p>
            <p className="mt-1 text-[13px] text-neutral-400">붙여주신 제목으로 문의 내용이 관리돼요</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. 24기 신입사원 웰컴키트, 부스트 부서 워크샵 단체티셔츠"
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />

            <p className="mt-8 text-sm font-semibold text-neutral-800">기업명</p>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="기업명을 입력해주세요"
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />

            <p className="mt-8 text-sm font-semibold text-neutral-800">알림 수단</p>
            <p className="mt-1 text-[13px] text-neutral-400">
              견적 도착, 제작 시작 등의 상태 알림을 받고 싶은 수단을 선택해주세요
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setNotify('email')}
                className={`rounded-lg border px-4 py-3.5 text-left text-sm transition-colors ${
                  notify === 'email'
                    ? 'border-indigo-400 bg-indigo-50/50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <p className="font-semibold text-neutral-700">✉️ 이메일 알림</p>
                <p className="mt-1 text-neutral-500">user@example.com</p>
              </button>
              <button
                type="button"
                onClick={() => setNotify('kakao')}
                className={`rounded-lg border px-4 py-3.5 text-left text-sm transition-colors ${
                  notify === 'kakao'
                    ? 'border-indigo-400 bg-indigo-50/50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <p className="font-semibold text-neutral-700">💬 카카오 채널톡 알림</p>
                <p className="mt-1 text-neutral-500">-</p>
              </button>
            </div>
          </section>
        )}

        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-lg border border-indigo-300 bg-white px-6 py-3 text-[15px] font-bold text-indigo-500 hover:bg-indigo-50"
            >
              ‹ 이전 단계
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            disabled={!canNext}
            onClick={() => (step < 2 ? setStep(step + 1) : setDone(true))}
            className="rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-indigo-600 disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {step < 2 ? '다음 단계 ›' : '문의하기 ›'}
          </button>
        </div>
      </main>

      {modalOpen && (
        <AddProductModal
          initialName={products.length === 0 ? location.state?.product : undefined}
          onClose={() => setModalOpen(false)}
          onAdd={(p) => {
            setProducts([...products, p])
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
