'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-xl"
          style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 500, letterSpacing: '0.04em', color: '#d4a84b' }}
        >
          NextChoice
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <NavLink href="/dashboard" label="대시보드" pathname={pathname} />
          <NavLink href="/decisions" label="결정 목록" pathname={pathname} />
          <Link
            href="/decisions/new"
            className="ml-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors"
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
        </nav>

      </div>
    </header>
  )
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className="text-xs font-medium tracking-widest uppercase px-3 py-2 rounded-lg transition-colors"
      style={{
        color: active ? '#d4a84b' : '#9aaa8a',
        background: active ? 'rgba(184,137,42,0.08)' : 'transparent',
      }}
    >
      {label}
    </Link>
  )
}
