'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function DecisionsDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const active = pathname === '/decisions' || pathname.startsWith('/decisions/')

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className="text-sm font-medium tracking-widest uppercase px-5 py-2 rounded-lg transition-colors"
        style={{
          color: active ? '#d4a84b' : '#9aaa8a',
          background: active ? 'rgba(184,137,42,0.08)' : 'transparent',
        }}
      >
        결정 목록
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-50 min-w-[140px]"
          style={{ background: '#0d150b', border: '1px solid #2d3e28', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
        >
          <Link
            href="/decisions"
            className="flex items-center gap-2 px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors hover:bg-[#141c12]"
            style={{ color: '#9aaa8a', borderBottom: '1px solid #1a2418' }}
          >
            나의 결정들
          </Link>
          <Link
            href="/decisions?reviewed=no"
            className="flex items-center gap-2 px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors hover:bg-[#141c12]"
            style={{ color: '#c4903e' }}
          >
            ✦ 리뷰 필요
          </Link>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  if (pathname === '/login') return null

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        background: 'linear-gradient(to right, rgba(184,137,42,0.2), rgba(184,137,42,0.12), rgba(184,137,42,0.2)), rgba(8,12,7,0.92)',
        borderColor: '#6a5020',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Mobile layout */}
      <div className="flex md:hidden w-full px-4 h-14 items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xl"
          style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 600, letterSpacing: '0.04em', color: '#d4a84b' }}
        >
          NextChoice
        </Link>
        <div className="flex items-center gap-1">
          <NavLink href="/dashboard" label="대시보드" pathname={pathname} />
          <NavLink href="/decisions" label="결정 목록" pathname={pathname} />
          <NavLink href="/insights" label="AI Choice 코치" pathname={pathname} noUppercase />
          <Link
            href="/decisions/new"
            className="ml-1 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: pathname === '/decisions/new' ? '#1a2416' : '#141c12',
              border: `1px solid ${pathname === '/decisions/new' ? '#b8892a' : '#6a4e1a'}`,
              color: '#d4a84b',
            }}
          >
            + 새 결정
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="ml-1 text-xs font-medium tracking-widest uppercase px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
            style={{ color: loggingOut ? '#5a6a50' : '#8a9478' }}
            onMouseEnter={e => { if (!loggingOut) e.currentTarget.style.color = '#c44040' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8a9478' }}
          >
            {loggingOut ? '…' : '로그아웃'}
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex w-full px-6 h-14 relative items-center">

        {/* Logo — far left */}
        <Link
          href="/dashboard"
          className="text-3xl mr-6"
          style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 600, letterSpacing: '0.04em', color: '#d4a84b' }}
        >
          NextChoice
        </Link>

        {/* Nav — centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <NavLink href="/dashboard" label="대시보드" pathname={pathname} />
          <DecisionsDropdown pathname={pathname} />
          <NavLink href="/insights" label="AI Choice 코치" pathname={pathname} noUppercase />
          <Link
            href="/decisions/new"
            className="ml-1 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors"
            style={{
              background: pathname === '/decisions/new' ? '#1a2416' : '#141c12',
              border: `1px solid ${pathname === '/decisions/new' ? '#b8892a' : '#6a4e1a'}`,
              color: '#d4a84b',
            }}
          >
            + 새 결정
          </Link>
        </div>

        {/* Logout — absolutely pinned to far right */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="absolute right-6 text-xs font-medium tracking-widest uppercase px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
          style={{ color: loggingOut ? '#5a6a50' : '#8a9478' }}
          onMouseEnter={e => { if (!loggingOut) e.currentTarget.style.color = '#c44040' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#8a9478' }}
        >
          {loggingOut ? '…' : '로그아웃'}
        </button>

      </div>
    </header>
  )
}

function NavLink({ href, label, pathname, noUppercase }: { href: string; label: string; pathname: string; noUppercase?: boolean }) {
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
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
