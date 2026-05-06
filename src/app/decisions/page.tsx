import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { IMPORTANCE_LABELS, type Decision, type ImportanceLevel } from '@/types/decision'

export const runtime = 'edge'

const CATEGORY_COLORS: Record<string, string> = {
  '커리어': '#7a9a8a',
  '관계':   '#c47a4a',
  '재정':   '#c4903e',
  '건강':   '#8aad7a',
  '생활':   '#a09060',
  '기타':   '#8a9478',
}

export default async function DecisionsPage() {
  const supabase = await createClient()
  const { data: decisions } = await supabase
    .from('decisions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: '#8a9478' }}>
              Decisions
            </p>
            <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cinzel)', color: '#d4a84b', letterSpacing: '0.08em' }}>
              나의 결정들
            </h1>
          </div>
          <Link
            href="/decisions/new"
            className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors"
            style={{ background: '#141c12', border: '1px solid #6a4e1a', color: '#d4a84b' }}
            onMouseEnter={undefined}
          >
            + 새 결정
          </Link>
        </div>

        <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(to right, transparent, #b8892a, #6b8f5e, transparent)' }} />

        {/* Empty state */}
        {(!decisions || decisions.length === 0) && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">✦</p>
            <p className="text-sm mb-1" style={{ color: '#d4c9a8' }}>아직 기록된 결정이 없어요</p>
            <p className="text-xs mb-8" style={{ color: '#3a4a30' }}>첫 번째 결정을 기록해보세요</p>
            <Link
              href="/decisions/new"
              className="text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-lg transition-colors"
              style={{ background: '#141c12', border: '1px solid #6a4e1a', color: '#d4a84b' }}
            >
              결정 기록하기
            </Link>
          </div>
        )}

        {/* Decision list */}
        <div className="space-y-3">
          {(decisions as Decision[])?.map(decision => {
            const imp = IMPORTANCE_LABELS[decision.importance_level as ImportanceLevel]
            const catColor = CATEGORY_COLORS[decision.category] ?? '#8a9478'
            const date = new Date(decision.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'short', day: 'numeric',
            })

            return (
              <Link
                key={decision.id}
                href={`/decisions/${decision.id}`}
                className="block rounded-xl border border-[#2d3e28] hover:border-[#4a5e3a] p-5 transition-colors"
                style={{ background: 'linear-gradient(to right, #1a2016, #0a0e08)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate mb-2" style={{ color: '#e8dfc8' }}>
                      {decision.title}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-semibold" style={{ color: catColor }}>
                        {decision.category}
                      </span>
                      <span style={{ color: '#2d3e28' }}>·</span>
                      <span className="text-xs" style={{ color: '#8a9478' }}>
                        {imp.emoji} {imp.label}
                      </span>
                      <span style={{ color: '#2d3e28' }}>·</span>
                      <span className="text-xs" style={{ color: '#4a5a3a' }}>
                        {date}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-lg"
                      style={{ background: '#141c12', border: '1px solid #2d3e28', color: '#a09060' }}
                    >
                      {decision.chosen_option === 'A' ? decision.option_a : decision.option_b}
                    </span>
                  </div>
                </div>

                {decision.review_date && new Date(decision.review_date) <= new Date() && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: '#1e2a1a' }}>
                    <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: '#c4903e' }}>
                      ✦ 리뷰할 시간이에요
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
