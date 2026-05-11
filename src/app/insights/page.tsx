export const runtime = 'edge'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatSection from './ChatSection'
import CompareSection from './CompareSection'
import SessionSidebar from './SessionSidebar'

type Tab = 'chat' | 'compare'
type SearchParams = { tab?: string; session?: string }

const TAB_LABELS: Record<Tab, string> = {
  chat: '결정 코치',
  compare: '기간 비교',
}

export default async function InsightsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams
  const tab: Tab = (['chat', 'compare'] as const).includes(raw.tab as Tab)
    ? (raw.tab as Tab) : 'chat'
  const sessionId = raw.session ?? null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-cinzel)', color: '#d4a84b', letterSpacing: '0.08em' }}>
            AI Choice 코치
          </h1>
          <p className="text-sm" style={{ color: '#8a9a78' }}>더 현명한 선택을 위한 AI</p>
        </div>

        <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(to right, transparent, #b8892a, #6b8f5e, transparent)' }} />

        {/* Tab navigation */}
        <div className="flex gap-1.5 mb-8">
          {(['chat', 'compare'] as Tab[]).map(t => {
            const isActive = tab === t
            return (
              <Link
                key={t}
                href={`/insights?tab=${t}`}
                className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: isActive ? 'rgba(184,137,42,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? '#b8892a' : '#2d3e28'}`,
                  color: isActive ? '#d4a84b' : '#5a6a50',
                }}
              >
                {TAB_LABELS[t]}
              </Link>
            )
          })}
        </div>

        {/* 결정 코치 탭 — sidebar fixed left, chat centered */}
        {tab === 'chat' && (
          <>
            <SessionSidebar sessionId={sessionId} />
            <div className="max-w-2xl mx-auto">
              <ChatSection sessionId={sessionId} />
            </div>
          </>
        )}

        {/* 기간 비교 탭 */}
        {tab === 'compare' && <CompareSection />}

      </div>
    </div>
  )
}
