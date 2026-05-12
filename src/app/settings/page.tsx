import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DeleteAccountSection from './DeleteAccountSection'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const email = user.email ?? ''

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-xl mx-auto">

        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: '#d4a84b' }}>
            Settings
          </p>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 300,
            color: '#e8dfc8',
            lineHeight: 1.1,
          }}>
            계정 설정
          </h1>
        </div>

        <div className="w-full h-px mb-10" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.4), transparent)' }} />

        {/* Account info */}
        <div
          className="rounded-2xl p-6 mb-6 flex flex-col gap-3"
          style={{
            background: 'rgba(18,24,14,0.7)',
            border: '1px solid rgba(184,137,42,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#d4a84b' }}>계정 정보</p>
          <div className="flex items-center gap-3 pt-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ background: 'rgba(184,137,42,0.12)', color: '#d4a84b', border: '1px solid rgba(184,137,42,0.2)' }}>
              {email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm" style={{ color: '#e8dfc8' }}>{email}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6a7a60' }}>Google 계정으로 로그인 중</p>
            </div>
          </div>
        </div>

        {/* Legal links */}
        <div
          className="rounded-2xl p-6 mb-6 flex flex-col gap-3"
          style={{
            background: 'rgba(18,24,14,0.7)',
            border: '1px solid rgba(184,137,42,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#d4a84b' }}>약관 및 정책</p>
          <div className="flex flex-col gap-2 pt-1">
            <Link href="/privacy" className="text-sm transition-colors" style={{ color: '#8a9a78' }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.color = '#d4a84b' }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.color = '#8a9a78' }}>
              개인정보처리방침 →
            </Link>
            <Link href="/terms" className="text-sm transition-colors" style={{ color: '#8a9a78' }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.color = '#d4a84b' }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.color = '#8a9a78' }}>
              이용약관 →
            </Link>
          </div>
        </div>

        {/* Delete account */}
        <DeleteAccountSection email={email} />

      </div>
    </div>
  )
}
