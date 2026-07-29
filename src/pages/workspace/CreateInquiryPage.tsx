import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import { translateWorkspaceValue } from '../../i18n/translations'
import LanguageToggle from '../../components/LanguageToggle'

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
  const { language } = useLanguage()
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
              {translateWorkspaceValue(label, language)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function FileDropPlaceholder() {
  const { t } = useLanguage()
  return (
    <button
      type="button"
      className="flex w-full flex-col items-center gap-1 rounded-lg border border-neutral-200 py-8 text-[13px] text-neutral-400 hover:border-neutral-300"
    >
      <span className="text-lg">⬆️</span>
      {t('workspace.createInquiry.filePlaceholderHint')}
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
  const { t, language } = useLanguage()

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
        <p className="text-lg font-bold text-neutral-900">{t('workspace.createInquiry.modalTitle')}</p>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <button type="button" onClick={onClose} aria-label={t('workspace.recommend.closeAriaLabel')} className="text-2xl text-neutral-400">
            ✕
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 pb-32">
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900">{t('workspace.createInquiry.contentSectionTitle')}</h3>

          <div className="mt-6">
            <p className="text-sm font-semibold text-neutral-800">
              {t('workspace.createInquiry.productNameQuestion')}<span className="text-rose-500">*</span>
            </p>
            <p className="mt-1 text-[13px] text-neutral-400">
              {t('workspace.createInquiry.productNameHintPrefix')}
              <span className="text-rose-500">{t('workspace.createInquiry.productNameHintEmphasis')}</span>
              {t('workspace.createInquiry.productNameHintSuffix')}
            </p>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('workspace.createInquiry.namePlaceholder')}
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-neutral-800">
              {t('workspace.recommend.quantityQuestion')}<span className="text-rose-500">*</span>
            </p>
            <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.recommend.quantityHint')}</p>
            <input
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder={t('workspace.createInquiry.quantityPlaceholder')}
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
              {t('workspace.recommend.flexibleQuantityLabel')}
            </label>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-neutral-800">
              {t('workspace.recommend.desiredDateQuestion')}{' '}
              <span className="font-normal text-neutral-400">{t('workspace.recommend.optionalTag')}</span>
            </p>
            <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.createInquiry.desiredDateHint')}</p>
            <input
              value={form.desiredDate}
              onChange={(e) => setForm({ ...form, desiredDate: e.target.value })}
              placeholder={t('workspace.createInquiry.desiredDatePlaceholder')}
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
            <label className="mt-3 flex items-center justify-end gap-2 text-[13px] text-neutral-500">
              <input
                type="checkbox"
                checked={form.fixedDeadline}
                onChange={(e) => setForm({ ...form, fixedDeadline: e.target.checked })}
                className="h-4 w-4 accent-indigo-500"
              />
              {t('workspace.recommend.fixedDeadlineLabel')}
            </label>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-neutral-800">
              {t('workspace.createInquiry.methodQuestion')}<span className="text-rose-500">*</span>
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-indigo-300 bg-indigo-50/40 px-4 py-3">
              <p className="text-[13px] text-neutral-600">
                💬{' '}
                {form.name.trim() === ''
                  ? t('workspace.createInquiry.methodHintEmpty')
                  : t('workspace.createInquiry.methodHintFilled')}
              </p>
              <button
                type="button"
                className={`text-[13px] font-semibold whitespace-nowrap ${
                  form.name.trim() === '' ? 'text-neutral-300' : 'text-indigo-500'
                }`}
              >
                {t('workspace.createInquiry.methodOtherFormCta')}
              </button>
            </div>
            <textarea
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              rows={4}
              placeholder={t('workspace.createInquiry.detailPlaceholder')}
              className="mt-3 w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
            <div className="mt-3">
              <FileDropPlaceholder />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900">{t('workspace.createInquiry.designFileSectionTitle')}</h3>
          <p className="mt-4 text-sm font-semibold text-neutral-800">
            {t('workspace.createInquiry.designFileQuestion')}<span className="text-rose-500">*</span>
          </p>
          <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.createInquiry.designFileHint')}</p>
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
                {translateWorkspaceValue(opt, language)}
                {i === 1 && (
                  <span className="text-[13px] text-neutral-400">{t('workspace.createInquiry.designWorkNote')}</span>
                )}
              </label>
            ))}
          </div>
        </section>

        {noFile && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-neutral-800">
              {t('workspace.createInquiry.canDesignLaterQuestion')}<span className="text-rose-500">*</span>
              {canDesignLater === '' && (
                <span className="ml-2 text-[13px] font-medium text-rose-500">
                  {t('workspace.createInquiry.requiredNote')}
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
                {t('workspace.createInquiry.canDesignYes')}
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
                {t('workspace.createInquiry.canDesignNo')}{' '}
                <span className="text-neutral-400">{t('workspace.createInquiry.canDesignNoDetail')}</span>
              </label>
            </div>
          </section>
        )}

        {needsGuide && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm text-neutral-800">
              {t('workspace.createInquiry.guideIntroPrefix')}
              <span className="font-semibold text-indigo-500">
                {t('workspace.createInquiry.guideIntroEmphasis')}
              </span>
              {t('workspace.createInquiry.guideIntroSuffix')}
            </p>
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-between rounded-lg border border-neutral-200 px-4 py-3.5 text-sm font-semibold text-neutral-700 hover:border-neutral-300"
            >
              <span>{t('workspace.createInquiry.guideLinkCta')}</span>
              <span className="text-neutral-300">›</span>
            </button>
            <p className="mt-2 text-right text-[13px] text-neutral-400">{t('workspace.createInquiry.guideTermsHelp')}</p>
            <ul className="mt-4 space-y-1.5 rounded-lg bg-neutral-50 p-5 text-[13px] leading-relaxed text-neutral-600">
              <li>· {t('workspace.createInquiry.guideBullet1')}</li>
              <li>· {t('workspace.createInquiry.guideBullet2')}</li>
              <li>· {t('workspace.createInquiry.guideBullet3')}</li>
              <li>· {t('workspace.createInquiry.guideBullet4')}</li>
              <li>· {t('workspace.createInquiry.guideBullet5')}</li>
            </ul>
            <label className="mt-4 flex items-center gap-2.5 text-sm font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={guideChecked}
                onChange={(e) => setGuideChecked(e.target.checked)}
                className="h-4 w-4 accent-indigo-500"
              />
              {t('workspace.createInquiry.guideConfirmedLabel')}
              {!guideChecked && (
                <span className="text-[13px] font-medium text-rose-500">
                  {t('workspace.createInquiry.requiredNote')}
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
          {t('workspace.createInquiry.addProductCta')}
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
  const { t, language } = useLanguage()

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
        <h1 className="mt-6 text-xl font-bold text-neutral-900">{t('workspace.createInquiry.doneTitle')}</h1>
        <p className="mt-2 text-sm text-neutral-500">{t('workspace.createInquiry.doneBody')}</p>
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
            {t('workspace.createInquiry.viewTrendReportCta')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/estimate-requests')}
            className="rounded-lg bg-indigo-500 px-6 py-3 text-[15px] font-bold text-white"
          >
            {t('workspace.createInquiry.viewOrdersCta')}
          </button>
        </div>
        <p className="mt-3 text-[13px] text-neutral-400">{t('workspace.createInquiry.doneFootnote')}</p>
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
          <span className="text-neutral-300">‹</span> {t('workspace.createInquiry.backToHome')}
        </button>
        <LanguageToggle />
      </header>

      <StepIndicator current={step} />

      <main className="mx-auto max-w-2xl pt-10 pb-32">
        {step === 0 && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900">{t('workspace.createInquiry.contentSectionTitle')}</h3>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-800">
                  {t('workspace.createInquiry.addProductQuestion')}<span className="text-rose-500">*</span>
                </p>
                <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.createInquiry.addProductHint')}</p>
              </div>
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="rounded-lg bg-indigo-50 px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-indigo-500 hover:bg-indigo-100"
                >
                  {t('workspace.createInquiry.addProductBtn')}
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
                      aria-label={t('workspace.createInquiry.deleteProductAriaLabel')}
                      onClick={() => setProducts(products.filter((_, j) => j !== i))}
                      className="text-neutral-300 hover:text-neutral-500"
                    >
                      ✕
                    </button>
                  </div>
                  <dl className="mt-3 space-y-1.5 text-[13px]">
                    <div className="flex gap-3">
                      <dt className="w-7 shrink-0 text-neutral-300">{t('workspace.createInquiry.quantityDdLabel')}</dt>
                      <dd className="text-neutral-700">
                        {p.quantity}
                        {p.flexibleQuantity && t('workspace.createInquiry.flexibleSuffix')}
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-7 shrink-0 text-neutral-300">{t('workspace.createInquiry.durationDdLabel')}</dt>
                      <dd className="text-neutral-700">{p.desiredDate || '-'}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-7 shrink-0 text-neutral-300">{t('workspace.createInquiry.contentDdLabel')}</dt>
                      <dd className="line-clamp-1 text-neutral-700">{p.detail || '-'}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-7 shrink-0 text-neutral-300">{t('workspace.createInquiry.fileDdLabel')}</dt>
                      <dd className="line-clamp-1 text-neutral-700">
                        {translateWorkspaceValue(p.designFile.replace(/^(네, |아니요, )/, ''), language)}
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
                  {t('workspace.createInquiry.addProductBtn').replace(/^\+ /, '')}
                </button>
              )}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900">
              {t('workspace.createInquiry.situationSectionTitle')}{' '}
              <span className="text-sm font-normal text-neutral-400">{t('workspace.recommend.optionalTag')}</span>
            </h3>

            <p className="mt-6 text-sm font-semibold text-neutral-800">
              {t('workspace.recommend.priorityQuestion')}{' '}
              <span className="font-normal text-neutral-400">{t('workspace.recommend.optionalTag')}</span>
            </p>
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
              {t('workspace.createInquiry.budgetQuestion')}{' '}
              <span className="font-normal text-neutral-400">{t('workspace.recommend.optionalTag')}</span>
            </p>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder={t('workspace.createInquiry.budgetPlaceholder')}
              className="mt-3 w-full max-w-xl rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />

            <p className="mt-8 text-sm font-semibold text-neutral-800">
              {t('workspace.createInquiry.requestQuestion')}{' '}
              <span className="font-normal text-neutral-400">{t('workspace.recommend.optionalTag')}</span>
            </p>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={4}
              placeholder={t('workspace.createInquiry.requestPlaceholder')}
              className="mt-3 w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />
            <div className="mt-3">
              <FileDropPlaceholder />
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900">{t('workspace.createInquiry.infoSectionTitle')}</h3>

            <p className="mt-6 text-sm font-semibold text-neutral-800">
              {t('workspace.createInquiry.titleQuestion')}<span className="text-rose-500">*</span>
            </p>
            <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.createInquiry.titleHint')}</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('workspace.createInquiry.titlePlaceholder')}
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />

            <p className="mt-8 text-sm font-semibold text-neutral-800">{t('workspace.createInquiry.companyLabel')}</p>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={t('workspace.createInquiry.companyPlaceholder')}
              className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-300 focus:border-indigo-400"
            />

            <p className="mt-8 text-sm font-semibold text-neutral-800">{t('workspace.createInquiry.notifyLabel')}</p>
            <p className="mt-1 text-[13px] text-neutral-400">{t('workspace.createInquiry.notifyHint')}</p>
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
                <p className="font-semibold text-neutral-700">{t('workspace.createInquiry.emailNotify')}</p>
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
                <p className="font-semibold text-neutral-700">{t('workspace.createInquiry.kakaoNotify')}</p>
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
              {t('workspace.createInquiry.prevStep')}
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
            {step < 2 ? t('workspace.createInquiry.nextStep') : t('workspace.createInquiry.submitInquiry')}
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
