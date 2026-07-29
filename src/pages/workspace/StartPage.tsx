import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES, PORTFOLIO, type Category } from './data/portfolio'
import { useLanguage } from '../../i18n/LanguageContext'
import { translateWorkspaceValue } from '../../i18n/translations'

function PortfolioCard({ id, emoji, gradient, name, category, tall }: (typeof PORTFOLIO)[number]) {
  const { language } = useLanguage()
  return (
    <Link
      to={`/portfolio/${id}`}
      className="group mb-6 block break-inside-avoid overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 transition-shadow hover:shadow-lg"
    >
      <div
        className={`flex items-center justify-center bg-gradient-to-br ${gradient} ${tall ? 'h-72' : 'h-44'}`}
      >
        <span className="text-6xl transition-transform group-hover:scale-110">{emoji}</span>
      </div>
      <div className="bg-white px-4 py-3">
        <p className="text-[15px] font-bold text-neutral-800">{name}</p>
        <p className="mt-0.5 text-xs text-neutral-400">{translateWorkspaceValue(category, language)}</p>
      </div>
    </Link>
  )
}

export default function StartPage() {
  const navigate = useNavigate()
  const galleryRef = useRef<HTMLElement>(null)
  const [category, setCategory] = useState<Category>('전체')
  const [query, setQuery] = useState('')
  const { t, language } = useLanguage()

  const items = useMemo(
    () =>
      PORTFOLIO.filter(
        (p) =>
          (category === '전체' || p.category === category) &&
          (query.trim() === '' || p.name.includes(query.trim())),
      ),
    [category, query],
  )

  return (
    <div className="px-10 pb-16">
      {/* 히어로 */}
      <section className="pt-24 pb-16 text-center">
        <h1 className="text-[32px] leading-snug font-bold whitespace-pre-line text-neutral-900">
          {t('workspace.start.heroTitle')}
        </h1>

        <div className="mx-auto mt-14 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/inquiry')}
            className="rounded-2xl border border-neutral-100 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="inline-block rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-500">
              {t('workspace.start.tag1')}
            </span>
            <p className="mt-3 text-lg font-bold text-neutral-900">{t('workspace.start.card1Title')}</p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-neutral-500">
              {t('workspace.start.card1Body')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => galleryRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-2xl border border-neutral-100 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="inline-block rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-500">
              {t('workspace.start.tag2')}
            </span>
            <p className="mt-3 text-lg font-bold text-neutral-900">{t('workspace.start.card2Title')}</p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-neutral-500">
              {t('workspace.start.card2Body')}
            </p>
          </button>
        </div>
      </section>

      {/* 카테고리 필터 + 검색 */}
      <section
        ref={galleryRef}
        className="sticky top-0 z-10 -mx-10 flex flex-wrap items-center gap-3 bg-white/95 px-10 py-4 backdrop-blur"
      >
        <span className="mr-1 text-sm font-medium text-neutral-400">{t('workspace.start.categoryLabel')}</span>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === c
                ? 'border-indigo-400 font-semibold text-indigo-500'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
            }`}
          >
            {translateWorkspaceValue(c, language)}
          </button>
        ))}
        <div className="ml-auto flex min-w-[260px] items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('workspace.start.searchPlaceholder')}
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-300"
          />
          <span className="text-neutral-300">🔍</span>
        </div>
      </section>

      {/* 갤러리 */}
      <section className="mt-6 columns-1 gap-6 sm:columns-2 lg:columns-3">
        {items.map((item) => (
          <PortfolioCard key={item.id} {...item} />
        ))}
      </section>

      {items.length === 0 && (
        <p className="py-20 text-center text-sm text-neutral-400">{t('workspace.start.emptyResults')}</p>
      )}
    </div>
  )
}
