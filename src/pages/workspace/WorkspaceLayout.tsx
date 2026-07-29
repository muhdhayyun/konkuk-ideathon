import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { COMPANY_INFO, USER_NAME } from './data/portfolio'

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
            <span className="mr-1 font-semibold text-neutral-400">상호명</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.name}</span>
            <span className="mr-1 font-semibold text-neutral-400">대표</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.ceo}</span>
            <span className="mr-1 font-semibold text-neutral-400">주소</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.address}</span>
            <span className="mr-1 font-semibold text-neutral-400">전화번호</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.tel}</span>
            <span className="mr-1 font-semibold text-neutral-400">영업시간</span>{' '}
            <span className="font-semibold text-neutral-700">{COMPANY_INFO.hours}</span>
          </p>
          <p>
            <span className="mr-1 font-semibold text-neutral-400">이메일</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.email}</span>
            <span className="mr-1 font-semibold text-neutral-400">사업자등록 번호</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.bizNo}</span>
            <span className="mr-1 font-semibold text-neutral-400">통신판매업 신고번호</span>{' '}
            <span className="mr-4 font-semibold text-neutral-700">{COMPANY_INFO.mailOrderNo}</span>
            <button type="button" className="text-neutral-400 underline">
              이용약관 및 개인정보 처리 방침
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
                <SparkleIcon className="h-5 w-5 text-indigo-500" /> 제작 시작하기
              </button>

              <p className="mt-6 mb-1 px-3 text-xs font-medium text-neutral-300">워크스페이스</p>

              <button
                type="button"
                onClick={() => navigate('/home')}
                className={menuClass(pathname === '/home')}
              >
                <HomeIcon className="h-5 w-5" /> 브랜드 홈
              </button>

              <button
                type="button"
                onClick={() => navigate('/estimate-requests')}
                className={menuClass(ordersActive)}
              >
                <DocIcon className="h-5 w-5" /> 문의/주문 관리
              </button>
              <NavLink to="/estimate-requests" end className={subClass}>
                진행중인 문의/주문
              </NavLink>
              <NavLink to="/payment" className={subClass}>
                결제 관리
              </NavLink>
            </nav>

            <div className="px-4 pb-6">
              <div className="mb-3 rounded-xl bg-neutral-50 p-4">
                <p className="text-sm font-bold text-neutral-800">피드백 남기기 📮</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                  남겨주신 의견은 서비스
                  <br />
                  개선에 바로 반영돼요
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/inquiry')}
                className="w-full rounded-lg bg-indigo-500 py-3 text-[15px] font-bold text-white transition-colors hover:bg-indigo-600"
              >
                + 간편 문의하기
              </button>
              <button
                type="button"
                className="mt-3 flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-neutral-400 hover:text-neutral-600"
              >
                <HeadsetIcon className="h-4 w-4" /> 서비스 사용 문의
              </button>
            </div>

            {/* 사이드바 접기 토글 */}
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="사이드바 닫기"
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
            aria-label="사이드바 열기"
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
              <HeadsetIcon className="h-4 w-4" /> 서비스 사용 문의
            </button>
            <button
              type="button"
              aria-label="알림"
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
              {USER_NAME} 님
            </button>
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
