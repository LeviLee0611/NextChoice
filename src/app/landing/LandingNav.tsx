'use client'

import Link from 'next/link'

export default function LandingNav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-5"
      style={{ backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(184,137,42,0.08)' }}
    >
      <Link href="/" className="text-xl font-light tracking-widest uppercase"
        style={{ fontFamily: 'var(--font-cormorant)', color: '#d4a84b', letterSpacing: '0.15em' }}
      >
        NextChoice
      </Link>
      <div className="flex items-center gap-6">
        <a href="#features"
          className="text-xs font-semibold tracking-widest uppercase transition-colors hidden sm:block"
          style={{ color: '#5a6a50' }}
          onMouseEnter={e => e.currentTarget.style.color = '#d4a84b'}
          onMouseLeave={e => e.currentTarget.style.color = '#5a6a50'}
        >
          기능
        </a>
        <Link
          href="/login"
          className="text-xs font-semibold tracking-widest uppercase px-5 py-2.5 rounded-lg transition-all duration-200"
          style={{ background: 'rgba(184,137,42,0.1)', border: '1px solid rgba(184,137,42,0.3)', color: '#d4a84b' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,137,42,0.2)'; e.currentTarget.style.borderColor = 'rgba(184,137,42,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,137,42,0.1)'; e.currentTarget.style.borderColor = 'rgba(184,137,42,0.3)' }}
        >
          로그인
        </Link>
      </div>
    </nav>
  )
}
