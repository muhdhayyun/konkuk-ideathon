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
  '파일이 있지만 추가 작업이 필요해요 *디자인 작업 요청',
  '아니요, 아직 완성된 디자인 파일이 없어요',
]

const STEPS = ['제작 내용', '제작 상황', '문의 정보'] as const

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mx-auto flex max-w-md items-center justify-center gap-0 pt-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          {i > 0 && <span className="mx-3 h-px w-10 bg-neutral-200" />}
          <div className="flex flex-col items-center gap-2">
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
              className={`text-[13px] font-medium ${
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

  const valid = form.name.trim() !== '' && form.quantity.trim() !== '' && form.designFile !== ''

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
            <textarea
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              rows={4}
              placeholder={
                '품질, 재질, 사이즈, 인쇄, 디자인 등 원하는 내용을 자유롭게 입력해주세요\nex. 흰색 컬러, 양면인쇄 필요, 인쇄 영역 대략 A3 사이즈'
              }
              className="mt-3 w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
            <button
              type="button"
              className="mt-3 flex w-full flex-col items-center rounded-lg border border-dashed border-neutral-200 py-8 text-[13px] text-neutral-400 hover:border-neutral-300"
            >
              <span className="text-lg">⬆️</span>
              참고할 이미지나 파일이 있다면 첨부해주세요
            </button>
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
            {DESIGN_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.designFile === opt}
                  onChange={() => setForm({ ...form, designFile: opt })}
                  className="h-4 w-4 accent-indigo-500"
                />
                {opt}
              </label>
            ))}
          </div>
        </section>
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
  const [situation, setSituation] = useState('')
  const [budget, setBudget] = useState('')
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [done, setDone] = useState(false)

  const canNext =
    step === 0 ? products.length > 0 : step === 1 ? true : contact.name !== '' && contact.phone !== ''

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50">
        <span className="text-6xl">✅</span>
        <h1 className="mt-6 text-xl font-bold text-neutral-900">문의가 접수됐어요</h1>
        <p className="mt-2 text-sm text-neutral-500">
          담당 매니저가 확인 후 견적서를 보내드릴게요 (데모 화면입니다)
        </p>
        <button
          type="button"
          onClick={() => navigate('/estimate-requests')}
          className="mt-8 rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white"
        >
          진행중인 문의/주문 보기
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="px-8 py-6">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate('/inquiry') : setStep(step - 1))}
          className="flex items-center gap-2 text-lg font-bold text-neutral-400"
        >
          <span className="text-neutral-300">‹</span>
          {step === 0 ? '처음으로 돌아가기' : '이전 단계'}
        </button>
      </header>

      <StepIndicator current={step} />

      <main className="mx-auto max-w-2xl pt-10 pb-32">
        {step === 0 && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900">제작 내용</h3>
            <p className="mt-4 text-sm font-semibold text-neutral-800">
              제작 하고 싶은 제품을 추가해주세요<span className="text-rose-500">*</span>
            </p>
            <p className="mt-1 text-[13px] text-neutral-400">아래 버튼을 눌러 한 제품씩 추가해주세요</p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {products.map((p, i) => (
                <div key={`${p.name}-${i}`} className="rounded-xl border border-neutral-200 p-5">
                  <div className="flex items-start justify-between">
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
                  <p className="mt-2 text-[13px] text-neutral-500">
                    수량 {p.quantity}개{p.flexibleQuantity && ' (유동적)'}
                  </p>
                  {p.desiredDate && (
                    <p className="mt-0.5 text-[13px] text-neutral-500">희망 수령일 {p.desiredDate}</p>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex h-48 flex-col items-center justify-center rounded-xl border border-neutral-200 text-sm text-neutral-500 hover:border-indigo-300 hover:text-indigo-500"
              >
                <span className="text-xl">+</span>
                제품 추가하기
              </button>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900">제작 상황</h3>

            <p className="mt-4 text-sm font-semibold text-neutral-800">
              어떤 상황에서 제작이 필요하신가요?
            </p>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={4}
              placeholder="ex. 사내 이벤트 기념품으로 배포할 예정이에요"
              className="mt-3 w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />

            <p className="mt-8 text-sm font-semibold text-neutral-800">
              생각하고 계신 예산이 있나요? <span className="font-normal text-neutral-400">(선택)</span>
            </p>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="ex. 총 200만원 내외"
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
          </section>
        )}

        {step === 2 && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900">문의 정보</h3>

            <p className="mt-4 text-sm font-semibold text-neutral-800">
              담당자 성함<span className="text-rose-500">*</span>
            </p>
            <input
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder="ex. 김병진"
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />

            <p className="mt-6 text-sm font-semibold text-neutral-800">
              연락처<span className="text-rose-500">*</span>
            </p>
            <input
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="ex. 010-0000-0000"
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />

            <p className="mt-6 text-sm font-semibold text-neutral-800">
              이메일 <span className="font-normal text-neutral-400">(선택)</span>
            </p>
            <input
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder="ex. brand@example.com"
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
          </section>
        )}
      </main>

      <div className="fixed right-8 bottom-8">
        <button
          type="button"
          disabled={!canNext}
          onClick={() => (step < 2 ? setStep(step + 1) : setDone(true))}
          className="rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-indigo-600 disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          {step < 2 ? '다음 단계 ›' : '문의 접수하기'}
        </button>
      </div>

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
