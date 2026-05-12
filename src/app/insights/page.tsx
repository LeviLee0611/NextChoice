import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatLayout from './ChatLayout'
import CompareSection from './CompareSection'

type Tab = 'chat' | 'compare'
type SearchParams = { tab?: string; session?: string }

export default async function InsightsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams
  const tab: Tab = (['chat', 'compare'] as const).includes(raw.tab as Tab)
    ? (raw.tab as Tab) : 'chat'
  const sessionId = raw.session ?? null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Chat tab: full-height app layout ───────────────────────
  if (tab === 'chat') {
    return <ChatLayout sessionId={sessionId} />
  }

  // ── Compare tab: standard scrollable layout ─────────────────
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-5xl mx-auto">

        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: '#d4a84b' }}>
            Analytics
          </p>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 300,
            color: '#e8dfc8',
            lineHeight: 1.1,
            marginBottom: '0.5rem',
          }}>
            결정 분석
          </h1>
          <p className="text-sm" style={{ color: '#8a9a78' }}>기간별 결정 패턴과 성장을 확인하세요</p>
        </div>

        <div className="w-full h-px mb-10" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.4), rgba(107,143,94,0.2), transparent)' }} />

        <CompareSection />

      </div>
    </div>
  )
}
