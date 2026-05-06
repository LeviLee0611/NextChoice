import Link from 'next/link'
import { notFound } from 'next/navigation'
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

function Row({ label, children, color = '#8b7aa0' }: { label: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="py-4 border-b" style={{ borderColor: '#2d1f4e' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color }}>
        {label}
      </p>
      <div className="text-sm" style={{ color: '#e4d9c8' }}>{children}</div>
    </div>
  )
}

export default async function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: decision } = await supabase
    .from('decisions')
    .select('*')
    .eq('id', id)
    .single()

  if (!decision) notFound()

  const d = decision as Decision
  const imp = IMPORTANCE_LABELS[d.importance_level as ImportanceLevel]
  const catColor = CATEGORY_COLORS[d.category] ?? '#8b7aa0'
  const createdAt = new Date(d.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const reviewDate = d.review_date
    ? new Date(d.review_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null
  const reviewOverdue = d.review_date && new Date(d.review_date) <= new Date()

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-xl mx-auto">

        {/* Back */}
        <Link
          href="/decisions"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase mb-10 transition-colors"
          style={{ color: '#5b4a7a' }}
        >
          ← 목록으로
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: catColor }}>
              {d.category}
            </span>
            <span style={{ color: '#3d2d58' }}>·</span>
            <span className="text-xs" style={{ color: '#8b7aa0' }}>{createdAt}</span>
          </div>
          <h1 className="text-xl font-medium leading-snug" style={{ color: '#e4d9c8' }}>
            {d.title}
          </h1>
        </div>

        <div className="w-full h-px mb-6" style={{ background: 'linear-gradient(to right, transparent, #7c3aed, #c4903e, transparent)' }} />

        {/* Detail rows */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#160e30', borderColor: '#3d2470' }}>
          <div className="px-6">

            <Row label="중요도" color="#d47a8a">
              <span className="mr-2">{imp.emoji}</span>
              <span className="font-medium">{imp.label}</span>
              <span className="ml-2 text-xs" style={{ color: '#8b7aa0' }}>— {imp.desc}</span>
            </Row>

            <Row label="선택지" color="#7d92c9">
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-lg text-sm"
                  style={{
                    background: d.chosen_option === 'A' ? 'rgba(124,58,237,0.2)' : '#1e1340',
                    border: `1px solid ${d.chosen_option === 'A' ? '#7c3aed' : '#3d2470'}`,
                    color: d.chosen_option === 'A' ? '#c4b5fd' : '#5b4a7a',
                  }}
                >
                  A — {d.option_a}
                </span>
                <span style={{ color: '#3d2d58' }}>vs</span>
                <span
                  className="px-3 py-1 rounded-lg text-sm"
                  style={{
                    background: d.chosen_option === 'B' ? 'rgba(124,58,237,0.2)' : '#1e1340',
                    border: `1px solid ${d.chosen_option === 'B' ? '#7c3aed' : '#3d2470'}`,
                    color: d.chosen_option === 'B' ? '#c4b5fd' : '#5b4a7a',
                  }}
                >
                  B — {d.option_b}
                </span>
              </div>
            </Row>

            <Row label="확신도" color="#c4903e">
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem', color: '#c4903e' }}>
                {d.confidence}
              </span>
              <span className="text-xs ml-1" style={{ color: '#5b4a7a' }}>/ 10</span>
            </Row>

            {d.reason && (
              <Row label="선택 이유" color="#9ab87d">
                <p className="leading-relaxed" style={{ color: '#c4b5fd' }}>{d.reason}</p>
              </Row>
            )}

            <div className="py-4">
              <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#7d92c9' }}>
                리뷰 날짜
              </p>
              {reviewDate ? (
                <p className="text-sm" style={{ color: reviewOverdue ? '#c4903e' : '#e4d9c8' }}>
                  {reviewDate}
                  {reviewOverdue && (
                    <span className="ml-2 text-xs font-semibold tracking-widest uppercase" style={{ color: '#c4903e' }}>
                      ✦ 리뷰할 시간
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm" style={{ color: '#3d2d58' }}>설정 안 됨</p>
              )}
            </div>

          </div>
        </div>

        {/* Review CTA */}
        <div className="mt-6">
          <Link
            href={`/decisions/${d.id}/review`}
            className="block w-full text-center rounded-xl py-3.5 text-sm font-semibold tracking-[0.15em] uppercase transition-colors"
            style={{
              background: reviewOverdue ? '#1e1038' : '#160e30',
              border: `1px solid ${reviewOverdue ? '#c4903e' : '#3d2470'}`,
              color: reviewOverdue ? '#c4903e' : '#5b4a7a',
              fontFamily: 'var(--font-cinzel)',
            }}
          >
            {reviewOverdue ? '결과 기록하기 →' : '리뷰 작성하기'}
          </Link>
        </div>

      </div>
    </div>
  )
}
