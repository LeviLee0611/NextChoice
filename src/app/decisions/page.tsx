import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { IMPORTANCE_LABELS, type Decision, type ImportanceLevel } from '@/types/decision'

export const runtime = 'edge'

const CATEGORY_COLORS: Record<string, string> = {
  '커리어': '#7d92c9',
  '관계':   '#d47a8a',
  '재정':   '#c4903e',
  '건강':   '#9ab87d',
  '생활':   '#b08fd4',
  '기타':   '#8b7aa0',
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
            <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: '#7c3aed' }}>
              Decisions
            </p>
            <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cinzel)', color: '#c4b5fd', letterSpacing: '0.08em' }}>
              나의 결정들
            </h1>
          </div>
          <Link
            href="/decisions/new"
            className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors"
            style={{ background: '#2a1548', border: '1px solid #6b4a8a', color: '#c4b5fd' }}
          >
            + 새 결정
          </Link>
        </div>

        <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(to right, transparent, #7c3aed, #c4903e, transparent)' }} />

        {/* Empty state */}
        {(!decisions || decisions.length === 0) && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">✦</p>
            <p className="text-sm mb-1" style={{ color: '#c4b5fd' }}>아직 기록된 결정이 없어요</p>
            <p className="text-xs mb-8" style={{ color: '#5b4a7a' }}>첫 번째 결정을 기록해보세요</p>
            <Link
              href="/decisions/new"
              className="text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-lg transition-colors"
              style={{ background: '#2a1548', border: '1px solid #6b4a8a', color: '#c4b5fd' }}
            >
              결정 기록하기
            </Link>
          </div>
        )}

        {/* Decision list */}
        <div className="space-y-3">
          {(decisions as Decision[])?.map(decision => {
            const imp = IMPORTANCE_LABELS[decision.importance_level as ImportanceLevel]
            const catColor = CATEGORY_COLORS[decision.category] ?? '#8b7aa0'
            const date = new Date(decision.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'short', day: 'numeric',
            })

            return (
              <Link
                key={decision.id}
                href={`/decisions/${decision.id}`}
                className="block rounded-xl border p-5 transition-colors group"
                style={{ background: '#160e30', borderColor: '#3d2470' }}
                onMouseEnter={undefined}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <p className="text-sm font-medium truncate mb-2" style={{ color: '#e4d9c8' }}>
                      {decision.title}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-semibold" style={{ color: catColor }}>
                        {decision.category}
                      </span>
                      <span className="text-xs" style={{ color: '#5b4a7a' }}>·</span>
                      <span className="text-xs" style={{ color: '#8b7aa0' }}>
                        {imp.emoji} {imp.label}
                      </span>
                      <span className="text-xs" style={{ color: '#5b4a7a' }}>·</span>
                      <span className="text-xs" style={{ color: '#5b4a7a' }}>
                        {date}
                      </span>
                    </div>
                  </div>

                  {/* Chosen option badge */}
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-lg"
                      style={{ background: '#1e1340', border: '1px solid #3d2470', color: '#a78bfa' }}>
                      {decision.chosen_option === 'A' ? decision.option_a : decision.option_b}
                    </span>
                  </div>
                </div>

                {/* Review due indicator */}
                {decision.review_date && new Date(decision.review_date) <= new Date() && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: '#2d1f4e' }}>
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
