import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IMPORTANCE_LABELS, type Decision, type ImportanceLevel } from '@/types/decision'
import DeleteButton from './DeleteButton'


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

function satisfactionColor(score: number) {
  if (score >= 7) return '#8aad7a'
  if (score >= 4) return '#c4903e'
  return '#c44040'
}

export default async function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: decision } = await supabase
    .from('decisions')
    .select('*, decision_reviews(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!decision) notFound()

  const d = decision as Decision & { decision_reviews: {
    id: string
    actual_result: string
    satisfaction_score: number
    unexpected_things: string | null
    lesson_learned: string | null
    would_choose_again: boolean
  }[] }

  const review = d.decision_reviews?.[0] ?? null
  const imp = IMPORTANCE_LABELS[d.importance_level as ImportanceLevel]
  const catColor = CATEGORY_COLORS[d.category] ?? '#8a9478'
  const createdAt = new Date(d.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const reviewDate = d.review_date
    ? new Date(d.review_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null
  const reviewOverdue = !review && d.review_date && new Date(d.review_date) <= new Date()

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-xl mx-auto">

        {/* Back + actions */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/decisions"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase transition-colors hover:text-[#8a9478]"
            style={{ color: '#4a5a3a' }}
          >
            ← 목록으로
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/decisions/${d.id}/edit`}
              className="text-xs tracking-widest uppercase transition-colors hover:text-[#d4a84b]"
              style={{ color: '#4a5a3a' }}
            >
              수정
            </Link>
            <DeleteButton id={d.id} />
          </div>
        </div>

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

        {/* Decision card */}
        <div className="rounded-2xl border overflow-hidden mb-6" style={{ background: 'linear-gradient(to right, #1a2016, #0a0e08)', borderColor: '#2d3e28' }}>
          <div className="px-6">
            <Row label="중요도" color="#c47a4a">
              <span className="mr-2">{imp.emoji}</span>
              <span className="font-medium">{imp.label}</span>
              <span className="ml-2 text-xs" style={{ color: '#5a6a50' }}>— {imp.desc}</span>
            </Row>

            <Row label="선택지" color="#7a9a8a">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-lg text-sm" style={{
                  background: d.chosen_option === 'A' ? 'rgba(184,137,42,0.15)' : '#141c12',
                  border: `1px solid ${d.chosen_option === 'A' ? '#b8892a' : '#2d3e28'}`,
                  color: d.chosen_option === 'A' ? '#d4a84b' : '#3a4a30',
                }}>
                  A — {d.option_a}
                </span>
                <span style={{ color: '#2d3e28' }}>vs</span>
                <span className="px-3 py-1 rounded-lg text-sm" style={{
                  background: d.chosen_option === 'B' ? 'rgba(184,137,42,0.15)' : '#141c12',
                  border: `1px solid ${d.chosen_option === 'B' ? '#b8892a' : '#2d3e28'}`,
                  color: d.chosen_option === 'B' ? '#d4a84b' : '#3a4a30',
                }}>
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

            {reviewDate && (
              <div className="py-4">
                <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#7a9a8a' }}>
                  리뷰 날짜
                </p>
                <p className="text-sm" style={{ color: reviewOverdue ? '#c4903e' : '#e8dfc8' }}>
                  {reviewDate}
                  {reviewOverdue && (
                    <span className="ml-2 text-xs font-semibold tracking-widest uppercase" style={{ color: '#c4903e' }}>
                      ✦ 리뷰할 시간
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Review section */}
        {review ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#4a5a3a' }}>
                리뷰 기록
              </p>
              <Link
                href={`/decisions/${d.id}/review`}
                className="text-xs tracking-widest uppercase transition-colors hover:text-[#8a9478]"
                style={{ color: '#3a4a30' }}
              >
                수정하기 →
              </Link>
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'linear-gradient(to right, #1a2016, #0a0e08)', borderColor: '#2d3e28' }}>
              <div className="px-6">
                <Row label="실제 결과" color="#d4c9a8">
                  <p className="leading-relaxed" style={{ color: '#c8bc98' }}>{review.actual_result}</p>
                </Row>

                <Row label="만족도" color="#c4903e">
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem', color: satisfactionColor(review.satisfaction_score) }}>
                    {review.satisfaction_score}
                  </span>
                  <span className="text-xs ml-1" style={{ color: '#3a4a30' }}>/ 10</span>
                </Row>

                <Row label="다시 선택한다면" color="#7a9a8a">
                  <span style={{ color: review.would_choose_again ? '#8aad7a' : '#c47a7a' }}>
                    {review.would_choose_again ? '같은 선택을 할 것이다' : '다른 선택을 할 것이다'}
                  </span>
                </Row>

                {review.unexpected_things && (
                  <Row label="예상과 달랐던 점" color="#8aad7a">
                    <p className="leading-relaxed" style={{ color: '#c8bc98' }}>{review.unexpected_things}</p>
                  </Row>
                )}

                {review.lesson_learned && (
                  <div className="py-4">
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#8aad7a' }}>
                      배운 점
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#c8bc98' }}>{review.lesson_learned}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
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
        )}

      </div>
    </div>
  )
}
