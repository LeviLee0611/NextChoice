'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl tracking-[0.2em] uppercase mb-3"
            style={{ fontFamily: 'var(--font-cinzel)', color: '#d4a84b' }}
          >
            NextChoice
          </h1>
          <div className="w-12 h-px mx-auto mb-4" style={{ background: 'linear-gradient(to right, transparent, #b8892a, transparent)' }} />
          <p className="text-sm tracking-wide" style={{ color: '#8a9478' }}>
            당신의 결정이 당신을 만든다
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border text-center"
          style={{
            background: '#0e1410',
            borderColor: '#2d3e28',
            boxShadow: '0 0 60px rgba(184,137,42,0.08)',
          }}
        >
          <p className="text-sm mb-6 leading-relaxed" style={{ color: '#8a9478' }}>
            매 선택의 순간을 기록하고<br />패턴을 발견하세요
          </p>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-xl px-6 py-3 text-sm font-medium transition-all"
            style={{ background: '#141c12', border: '1px solid #2d3e28', color: '#e8dfc8' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#b8892a'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#2d3e28'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google로 계속하기
          </button>
        </div>

      </div>
    </div>
  )
}
