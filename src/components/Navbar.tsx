'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function DecisionsDropdown({ pathname }: { pathname: string }) {
  const active = pathname === '/decisions' || pathname.startsWith('/decisions/')

  return (
    <div className="relative group">
      <button
        type="button"
        className="text-sm font-medium tracking-widest uppercase px-5 py-2 rounded-lg transition-colors"
        style={{
          color: active ? '#d4a84b' : '#9aaa8a',
          background: active ? 'rgba(184,137,42,0.08)' : 'transparent',
        }}
      >
        선택 목록
      </button>

      <div
        className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-50 min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150"
        style={{
          background: 'rgba(15,18,13,0.96)',
          border: '1px solid rgba(184,137,42,0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <Link
          href="/decisions"
          className="flex items-center gap-2 px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors hover:bg-[rgba(184,137,42,0.06)]"
          style={{ color: '#9aaa8a', borderBottom: '1px solid rgba(184,137,42,0.08)' }}
        >
          나의 결정들
        </Link>
        <Link
          href="/decisions?reviewed=no"
          className="flex items-center gap-2 px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors hover:bg-[rgba(184,137,42,0.06)]"
          style={{ color: '#c4903e' }}
        >
          ✦ 리뷰 필요
        </Link>
      </div>
    </div>
  )
}

function InsightsNavLinks({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams()
  const onInsights = pathname === '/insights'
  const compareActive = onInsights && searchParams.get('tab') === 'compare'
  const coachActive = onInsights && !compareActive

  return (
    <>
      <NavLink href="/insights" label="AI Choice 코치" pathname={pathname} noUppercase active={coachActive} />
      <NavLink href="/insights?tab=compare" label="분석" pathname={pathname} active={compareActive} />
    </>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (pathname === '/login') return null

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(17,18,16,0.88)',
        borderBottom: '1px solid rgba(184,137,42,0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Mobile layout */}
      <div className="flex md:hidden w-full px-4 h-14 items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xl font-light tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, letterSpacing: '0.15em', color: '#d4a84b' }}
        >
          NextChoice
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/decisions/new"
            className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 100%)', color: '#0d1008' }}
          >
            + 새 결정
          </Link>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex flex-col gap-1.5 p-2"
            aria-label="메뉴"
          >
            <span className="block w-5 h-0.5 transition-all" style={{ background: menuOpen ? '#d4a84b' : '#9aaa8a' }} />
            <span className="block w-5 h-0.5 transition-all" style={{ background: menuOpen ? '#d4a84b' : '#9aaa8a' }} />
            <span className="block w-5 h-0.5 transition-all" style={{ background: menuOpen ? '#d4a84b' : '#9aaa8a' }} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="flex md:hidden flex-col px-4 pb-4 gap-1"
          style={{ borderTop: '1px solid rgba(184,137,42,0.1)' }}
        >
          <MobileNavLink href="/dashboard" label="Dashboard" pathname={pathname} onClick={() => setMenuOpen(false)} />
          <MobileNavLink href="/decisions" label="선택 목록" pathname={pathname} onClick={() => setMenuOpen(false)} />
          <MobileNavLink href="/insights" label="AI Choice 코치" pathname={pathname} onClick={() => setMenuOpen(false)} />
          <MobileNavLink href="/insights?tab=compare" label="분석" pathname={pathname} onClick={() => setMenuOpen(false)} />
          <MobileNavLink href="/feedback" label="피드백" pathname={pathname} onClick={() => setMenuOpen(false)} />
          <MobileNavLink href="/settings" label="설정" pathname={pathname} onClick={() => setMenuOpen(false)} />
          <button
            onClick={() => { setMenuOpen(false); handleLogout() }}
            disabled={loggingOut}
            className="text-xs font-medium tracking-widest uppercase px-3 py-3 rounded-lg transition-colors disabled:opacity-40 text-left"
            style={{ color: '#9aaa88' }}
          >
            {loggingOut ? '…' : '로그아웃'}
          </button>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden md:flex w-full px-6 h-14 relative items-center">

        {/* Logo — far left */}
        <Link
          href="/dashboard"
          className="text-3xl mr-6 font-light tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, letterSpacing: '0.15em', color: '#d4a84b' }}
        >
          NextChoice
        </Link>

        {/* Nav — centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <NavLink href="/dashboard" label="Dashboard" pathname={pathname} />
          <DecisionsDropdown pathname={pathname} />
          <Suspense fallback={
            <>
              <NavLink href="/insights" label="AI Choice 코치" pathname={pathname} noUppercase />
              <NavLink href="/insights?tab=compare" label="분석" pathname={pathname} />
            </>
          }>
            <InsightsNavLinks pathname={pathname} />
          </Suspense>
          <Link
            href="/decisions/new"
            className="ml-1 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 100%)',
              color: '#0d1008',
            }}
          >
            + 새 결정
          </Link>
        </div>

        {/* Settings + Logout — absolutely pinned to far right */}
        <div className="absolute right-6 flex items-center gap-1">
          <Link
            href="/feedback"
            className="text-xs font-medium tracking-widest uppercase px-3 py-2 rounded-lg transition-colors"
            style={{ color: pathname === '/feedback' ? '#d4a84b' : '#9aaa88' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#d4a84b' }}
            onMouseLeave={e => { e.currentTarget.style.color = pathname === '/feedback' ? '#d4a84b' : '#9aaa88' }}
          >
            피드백
          </Link>
          <Link
            href="/settings"
            className="text-xs font-medium tracking-widest uppercase px-3 py-2 rounded-lg transition-colors"
            style={{ color: pathname === '/settings' ? '#d4a84b' : '#9aaa88' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#d4a84b' }}
            onMouseLeave={e => { e.currentTarget.style.color = pathname === '/settings' ? '#d4a84b' : '#9aaa88' }}
          >
            설정
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs font-medium tracking-widest uppercase px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
            style={{ color: loggingOut ? '#7a8a70' : '#9aaa88' }}
            onMouseEnter={e => { if (!loggingOut) e.currentTarget.style.color = '#c44040' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9aaa88' }}
          >
            {loggingOut ? '…' : '로그아웃'}
          </button>
        </div>

      </div>
    </header>
  )
}

function MobileNavLink({ href, label, pathname, onClick }: { href: string; label: string; pathname: string; onClick: () => void }) {
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href.split('?')[0]))
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-sm font-medium tracking-widest uppercase px-3 py-3 rounded-lg transition-colors"
      style={{ color: active ? '#d4a84b' : '#9aaa8a', background: active ? 'rgba(184,137,42,0.08)' : 'transparent' }}
    >
      {label}
    </Link>
  )
}

function NavLink({ href, label, pathname, noUppercase, active: activeOverride }: { href: string; label: string; pathname: string; noUppercase?: boolean; active?: boolean }) {
  const defaultActive = pathname === href || (href !== '/dashboard' && href.split('?')[0] !== '/insights' && pathname.startsWith(href))
  const active = activeOverride !== undefined ? activeOverride : defaultActive
  return (
    <Link
      href={href}
      className={`text-sm font-medium tracking-widest px-5 py-2 rounded-lg transition-colors ${noUppercase ? '' : 'uppercase'}`}
      style={{
        color: active ? '#d4a84b' : '#9aaa8a',
        background: active ? 'rgba(184,137,42,0.08)' : 'transparent',
      }}
    >
      {label}
    </Link>
  )
}
