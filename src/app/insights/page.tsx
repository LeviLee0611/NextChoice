export const runtime = 'edge'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InsightsPanel from '@/components/InsightsPanel'
import ChatSection from './ChatSection'
import CompareSection from './CompareSection'

type Tab = 'analyze' | 'compare' | 'chat'
type SearchParams = { tab?: string }

const TAB_LABELS: Record<Tab, string> = {
  analyze: '분석',
  compare: '기간 비교',
  chat: '결정 코치',
}

export default async function InsightsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams
  const tab: Tab = (['analyze', 'compare', 'chat'] as const).includes(raw.tab as Tab)
    ? (raw.tab as Tab) : 'analyze'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: '#8a9478' }}>Insights</p>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cinzel)', color: '#d4a84b', letterSpacing: '0.08em' }}>
            AI 인사이트
          </h1>
        </div>

        <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(to right, transparent, #b8892a, #6b8f5e, transparent)' }} />

        {/* Tab navigation */}
        <div className="flex gap-1.5 mb-8">
          {(['analyze', 'compare', 'chat'] as Tab[]).map(t => {
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

        {/* 분석 탭 */}
        {tab === 'analyze' && (
          <InsightsPanel />
        )}

        {/* 기간 비교 탭 */}
        {tab === 'compare' && <CompareSection />}

        {/* 결정 코치 탭 */}
        {tab === 'chat' && (
          <ChatSection />
        )}

      </div>
    </div>
  )
}
