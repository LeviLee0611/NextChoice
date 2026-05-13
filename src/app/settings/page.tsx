import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RATE_LIMITS } from '@/lib/rateLimit'
import DeleteAccountSection from './DeleteAccountSection'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const email = user.email ?? ''

  const today = new Date().toISOString().slice(0, 10)
  const { data: usage } = await supabase
    .from('api_usage')
    .select('chat_turns, insight_calls')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  const chatUsed = usage?.chat_turns ?? 0
  const insightUsed = usage?.insight_calls ?? 0

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

        {/* AI usage */}
        <div
          className="rounded-2xl p-6 mb-6 flex flex-col gap-4"
          style={{
            background: 'rgba(18,24,14,0.7)',
            border: '1px solid rgba(184,137,42,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#d4a84b' }}>AI 사용량 (오늘)</p>
            <p className="text-[10px]" style={{ color: '#6a7a60' }}>매일 자정에 초기화</p>
          </div>

          {[
            { label: 'AI Choice 코치', used: chatUsed, limit: RATE_LIMITS.chat_turns, unit: '턴' },
            { label: 'AI 인사이트 생성', used: insightUsed, limit: RATE_LIMITS.insight_calls, unit: '회' },
          ].map(({ label, used, limit, unit }) => {
            const pct = Math.min((used / limit) * 100, 100)
            const barColor = pct >= 90 ? '#c44040' : pct >= 60 ? '#c4903e' : '#8aad7a'
            return (
              <div key={label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#c8d8b8' }}>{label}</span>
                  <span style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1.1rem',
                    color: barColor,
                  }}>
                    {used} <span className="text-xs" style={{ color: '#6a7a60' }}>/ {limit}{unit}</span>
                  </span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: barColor, opacity: 0.8 }}
                  />
                </div>
              </div>
            )
          })}
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
            <Link href="/privacy" className="text-sm transition-colors settings-link">
              개인정보처리방침 →
            </Link>
            <Link href="/terms" className="text-sm transition-colors settings-link">
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
