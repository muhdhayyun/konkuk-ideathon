import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { COMPANY_INFO, USER_NAME } from './data/portfolio'
import { useLanguage } from '../../i18n/LanguageContext'
import LanguageToggle from '../../components/LanguageToggle'

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2l2.1 5.9L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-2.1L12 2z" />
      <path d="M19 15l.9 2.6L22.5 18l-2.6.9L19 21l-.9-2.1L15.5 18l2.6-.4L19 15z" opacity=".7" />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M3.5 10.5 12 3.5l8.5 7v9a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5a1.5 1.5 0 0 1-1.5-1.5v-9z" strokeLinejoin="round" />
    </svg>
  )
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M6 3.5h8.5L19 8v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" strokeLinejoin="round" />
      <path d="M14.5 3.5V8H19" strokeLinejoin="round" />
    </svg>
  )
}

function HeadsetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M4 13a8 8 0 1 1 16 0" strokeLinecap="round" />
      <rect x="3" y="13" width="4" height="6" rx="2" />
      <rect x="17" y="13" width="4" height="6" rx="2" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  )
}

function Logo() {
  return (
    <Link to="/" className="block px-6 pt-8 pb-2 select-none">
      <span className="block text-[22px] font-black leading-[0.95] tracking-tight text-neutral-900">
        BRAND<span className="align-super text-[10px]">✦</span>
        <br />
        BOOST
      </span>
    </Link>
  )
}

export function WorkspaceFooter() {
  const { t } = useLanguage()
  return (
    <footer className="border-t border-neutral-100 bg-white px-10 py-8">
      <div className="mx-auto flex max-w-6xl items-start gap-10">
        <span className="text-lg font-black leading-[0.95] tracking-tight text-neutral-800">
          BRAND<span className="align-super text-[8px]">✦</span>
          <br />
          BOOST
        </span>
        <div className="space-y-1.5 text-xs leading-relaxed text-neutral-500">
          <p>
            <span className="mr-1 font-semibold text-neutral-400">{t('workspace.footer.bizName')}</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.name}</span>
            <span className="mr-1 font-semibold text-neutral-400">{t('workspace.footer.ceo')}</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.ceo}</span>
            <span className="mr-1 font-semibold text-neutral-400">{t('workspace.footer.address')}</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.address}</span>
            <span className="mr-1 font-semibold text-neutral-400">{t('workspace.footer.tel')}</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.tel}</span>
            <span className="mr-1 font-semibold text-neutral-400">{t('workspace.footer.hours')}</span>{' '}
            <span className="font-semibold text-neutral-700">{COMPANY_INFO.hours}</span>
          </p>
          <p>
            <span className="mr-1 font-semibold text-neutral-400">{t('workspace.footer.email')}</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.email}</span>
            <span className="mr-1 font-semibold text-neutral-400">{t('workspace.footer.bizNo')}</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.bizNo}</span>
            <span className="mr-1 font-semibold text-neutral-400">{t('workspace.footer.mailOrderNo')}</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.mailOrderNo}</span>
            <button type="button" className="text-neutral-400 underline">
              {t('workspace.footer.terms')}
            </button>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function WorkspaceLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useLanguage()

  const startActive = pathname === '/' || pathname.startsWith('/portfolio')
  const ordersActive = pathname.startsWith('/estimate-requests') || pathname.startsWith('/payment')

  const menuClass = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition-colors ${
      active ? 'text-indigo-500' : 'text-neutral-400 hover:text-neutral-600'
    }`

  const subClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2.5 pl-11 text-[14px] font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 font-semibold text-indigo-500'
        : 'text-neutral-400 hover:text-neutral-600'
    }`

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="flex min-h-screen">
        {/* 사이드바 */}
        {!collapsed && (
          <aside className="relative flex w-[238px] shrink-0 flex-col border-r border-neutral-100">
            <Logo />

            <nav className="mt-6 flex-1 px-3">
              <button type="button" onClick={() => navigate('/')} className={menuClass(startActive)}>
                <SparkleIcon className="h-5 w-5 text-indigo-500" /> {t('workspace.nav.start')}
              </button>

              <p className="mt-6 mb-1 px-3 text-xs font-medium text-neutral-300">{t('workspace.nav.workspaceLabel')}</p>

              <button
                type="button"
                onClick={() => navigate('/home')}
                className={menuClass(pathname === '/home')}
              >
                <HomeIcon className="h-5 w-5" /> {t('workspace.nav.brandHome')}
              </button>

              <button
                type="button"
                onClick={() => navigate('/estimate-requests')}
                className={menuClass(ordersActive)}
              >
                <DocIcon className="h-5 w-5" /> {t('workspace.nav.inquiryOrders')}
              </button>
              <NavLink to="/estimate-requests" end className={subClass}>
                {t('workspace.nav.inProgressInquiries')}
              </NavLink>
              <NavLink to="/payment" className={subClass}>
                {t('workspace.nav.paymentManagement')}
              </NavLink>
            </nav>

            <div className="px-4 pb-6">
              <div className="mb-3 rounded-xl bg-neutral-50 p-4">
                <p className="text-sm font-bold text-neutral-800">{t('workspace.nav.feedbackTitle')}</p>
                <p className="mt-1 text-xs leading-relaxed whitespace-pre-line text-neutral-400">
                  {t('workspace.nav.feedbackBody')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/inquiry')}
                className="w-full rounded-lg bg-indigo-500 py-3 text-[15px] font-bold text-white transition-colors hover:bg-indigo-600"
              >
                {t('workspace.nav.easyInquiry')}
              </button>
              <button
                type="button"
                className="mt-3 flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-neutral-400 hover:text-neutral-600"
              >
                <HeadsetIcon className="h-4 w-4" /> {t('workspace.nav.serviceInquiry')}
              </button>
            </div>

            {/* 사이드바 접기 토글 */}
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label={t('workspace.nav.collapseSidebar')}
              className="absolute top-[92px] -right-3.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-[10px] text-neutral-400 shadow-sm hover:text-neutral-600"
            >
              ❮
            </button>
          </aside>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label={t('workspace.nav.expandSidebar')}
            className="fixed top-[92px] left-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-[10px] text-neutral-400 shadow-sm hover:text-neutral-600"
          >
            ❯
          </button>
        )}

        {/* 본문 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-end gap-5 px-8 py-4">
            <button
              type="button"
              className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-400 hover:text-neutral-600"
            >
              <HeadsetIcon className="h-4 w-4" /> {t('workspace.nav.serviceInquiry')}
            </button>
            <button
              type="button"
              aria-label={t('workspace.nav.notifications')}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <BellIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-neutral-200 py-1.5 pr-4 pl-1.5 text-sm font-semibold hover:bg-neutral-50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-sm">
                🦊
              </span>
              {t('workspace.nav.userGreeting', { name: USER_NAME })}
            </button>
            <LanguageToggle />
          </header>

          <main className="flex-1">
            <Outlet />
          </main>

          <WorkspaceFooter />
        </div>
      </div>
    </div>
  )
}
