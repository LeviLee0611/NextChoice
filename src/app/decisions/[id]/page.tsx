import Link from 'next/link'
import { notFound } from 'next/navigation'
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

function Row({ label, children, color = '#8a9478' }: { label: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="py-4 border-b" style={{ borderColor: '#1e2a1a' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color }}>
        {label}
      </p>
      <div className="text-sm" style={{ color: '#e8dfc8' }}>{children}</div>
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
  const catColor = CATEGORY_COLORS[d.category] ?? '#8a9478'
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
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase mb-10 transition-colors hover:text-[#8a9478]"
          style={{ color: '#4a5a3a' }}
        >
          ← 목록으로
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: catColor }}>
              {d.category}
            </span>
            <span style={{ color: '#2d3e28' }}>·</span>
            <span className="text-xs" style={{ color: '#4a5a3a' }}>{createdAt}</span>
          </div>
          <h1 className="text-xl font-medium leading-snug" style={{ color: '#e8dfc8' }}>
            {d.title}
          </h1>
        </div>

        <div className="w-full h-px mb-6" style={{ background: 'linear-gradient(to right, transparent, #b8892a, #6b8f5e, transparent)' }} />

        {/* Detail card */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'linear-gradient(to right, #1a2016, #0a0e08)', borderColor: '#2d3e28' }}>
          <div className="px-6">

            <Row label="중요도" color="#c47a4a">
              <span className="mr-2">{imp.emoji}</span>
              <span className="font-medium">{imp.label}</span>
              <span className="ml-2 text-xs" style={{ color: '#5a6a50' }}>— {imp.desc}</span>
            </Row>

            <Row label="선택지" color="#7a9a8a">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="px-3 py-1 rounded-lg text-sm"
                  style={{
                    background: d.chosen_option === 'A' ? 'rgba(184,137,42,0.15)' : '#141c12',
                    border: `1px solid ${d.chosen_option === 'A' ? '#b8892a' : '#2d3e28'}`,
                    color: d.chosen_option === 'A' ? '#d4a84b' : '#3a4a30',
                  }}
                >
                  A — {d.option_a}
                </span>
                <span style={{ color: '#2d3e28' }}>vs</span>
                <span
                  className="px-3 py-1 rounded-lg text-sm"
                  style={{
                    background: d.chosen_option === 'B' ? 'rgba(184,137,42,0.15)' : '#141c12',
                    border: `1px solid ${d.chosen_option === 'B' ? '#b8892a' : '#2d3e28'}`,
                    color: d.chosen_option === 'B' ? '#d4a84b' : '#3a4a30',
                  }}
                >
                  B — {d.option_b}
                </span>
              </div>
            </Row>

            <Row label="확신도" color="#c4903e">
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem', color: '#d4a84b' }}>
                {d.confidence}
              </span>
              <span className="text-xs ml-1" style={{ color: '#3a4a30' }}>/ 10</span>
            </Row>

            {d.reason && (
              <Row label="선택 이유" color="#8aad7a">
                <p className="leading-relaxed" style={{ color: '#c8bc98' }}>{d.reason}</p>
              </Row>
            )}

            {d.reason_not_chosen && (
              <Row label="선택 안 한 이유" color="#c47a4a">
                <p className="leading-relaxed" style={{ color: '#c8bc98' }}>{d.reason_not_chosen}</p>
              </Row>
            )}

            <div className="py-4">
              <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#7a9a8a' }}>
                리뷰 날짜
              </p>
              {reviewDate ? (
                <p className="text-sm" style={{ color: reviewOverdue ? '#c4903e' : '#e8dfc8' }}>
                  {reviewDate}
                  {reviewOverdue && (
                    <span className="ml-2 text-xs font-semibold tracking-widest uppercase" style={{ color: '#c4903e' }}>
                      ✦ 리뷰할 시간
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm" style={{ color: '#2d3e28' }}>설정 안 됨</p>
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
              background: '#141c12',
              border: `1px solid ${reviewOverdue ? '#c4903e' : '#2d3e28'}`,
              color: reviewOverdue ? '#c4903e' : '#4a5a3a',
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
