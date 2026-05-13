import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IMPORTANCE_LABELS, type Decision, type ImportanceLevel } from '@/types/decision'
import DeleteButton from './DeleteButton'
import ChatHistorySection from './ChatHistorySection'


const CATEGORY_COLORS: Record<string, string> = {
  '커리어': '#7a9a8a',
  '관계':   '#c47a4a',
  '재정':   '#c4903e',
  '건강':   '#8aad7a',
  '생활':   '#a09060',
  '기타':   '#8a9478',
}

function Row({ label, children, color = '#6a7a60' }: { label: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="py-4" style={{ borderBottom: '1px solid rgba(184,137,42,0.06)' }}>
      <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1.5" style={{ color }}>
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

  const chatMessages = decision.chat_session_id
    ? (await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', decision.chat_session_id)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
      ).data ?? []
    : []

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
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/decisions"
            className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-colors"
            style={{ color: '#5a6a50' }}
            onMouseEnter={undefined}
          >
            ← 목록으로
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/decisions/${d.id}/edit`}
              className="text-xs tracking-[0.15em] uppercase transition-colors"
              style={{ color: '#6a7a60' }}
            >
              수정
            </Link>
            <DeleteButton id={d.id} />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: catColor }}>
              {d.category}
            </span>
            <span style={{ color: 'rgba(184,137,42,0.3)' }}>·</span>
            <span className="text-xs" style={{ color: '#4a5a3a' }}>{createdAt}</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 300,
            color: '#e8dfc8',
            lineHeight: 1.2,
          }}>
            {d.title}
          </h1>
        </div>

        <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.4), rgba(107,143,94,0.2), transparent)' }} />

        {/* Decision card */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            background: 'rgba(18,24,14,0.7)',
            border: '1px solid rgba(184,137,42,0.12)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="px-6 pb-2">
            <Row label="중요도">
              <span className="mr-2">{imp.emoji}</span>
              <span className="font-medium">{imp.label}</span>
              <span className="ml-2 text-xs" style={{ color: '#5a6a50' }}>— {imp.desc}</span>
            </Row>

            <Row label="선택지">
              <div className="flex flex-col gap-2">
                {([
                  { key: 'A', text: d.option_a },
                  { key: 'B', text: d.option_b },
                  ...(d.option_c ? [{ key: 'C', text: d.option_c }] : []),
                  ...(d.option_d ? [{ key: 'D', text: d.option_d }] : []),
                ] as { key: string; text: string }[]).map(({ key, text }) => (
                  <span key={key} className="px-3 py-1.5 rounded-lg text-sm" style={{
                    background: d.chosen_option === key ? 'rgba(184,137,42,0.12)' : 'rgba(8,12,7,0.6)',
                    border: `1px solid ${d.chosen_option === key ? 'rgba(184,137,42,0.4)' : 'rgba(184,137,42,0.06)'}`,
                    color: d.chosen_option === key ? '#d4a84b' : '#5a6a50',
                  }}>
                    <span className="font-semibold mr-2" style={{ color: d.chosen_option === key ? '#d4a84b' : '#4a5a3a' }}>{key}</span>
                    {text}
                    {d.chosen_option === key && (
                      <span className="ml-2 text-[10px] tracking-widest uppercase" style={{ color: '#b8892a' }}>✓ 선택</span>
                    )}
                  </span>
                ))}
              </div>
            </Row>

            <Row label="확신도">
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', fontWeight: 300, color: '#d4a84b' }}>
                {d.confidence}
              </span>
              <span className="text-xs ml-1" style={{ color: '#5a6a50' }}>/ 10</span>
            </Row>

            {d.gut_vs_logic != null && (
              <Row label="결정 방식">
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: '#7050b0' }}>직감</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-3 h-3 rounded-full" style={{
                        background: i <= d.gut_vs_logic! ? (d.gut_vs_logic! <= 2 ? '#7050b0' : d.gut_vs_logic! >= 4 ? '#b8892a' : '#8a9478') : 'rgba(184,137,42,0.08)'
                      }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: '#b8892a' }}>논리</span>
                </div>
              </Row>
            )}

            {d.time_pressure != null && (
              <Row label="시간 압박">
                <span style={{ color: d.time_pressure === 1 ? '#8aad7a' : d.time_pressure === 2 ? '#c4903e' : '#c44040' }}>
                  {d.time_pressure === 1 ? '여유로움' : d.time_pressure === 2 ? '적당함' : '빠듯함'}
                </span>
              </Row>
            )}

            {d.reason && (
              <Row label="선택 이유">
                <p className="leading-relaxed" style={{ color: '#c8bc98' }}>{d.reason}</p>
              </Row>
            )}

            {d.reason_not_chosen && (
              <Row label="선택 안 한 이유">
                <p className="leading-relaxed" style={{ color: '#c8bc98' }}>{d.reason_not_chosen}</p>
              </Row>
            )}

            {reviewDate && (
              <div className="py-4">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1.5" style={{ color: '#7a9a8a' }}>
                  리뷰해야 하는 날
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
              <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#6a7a60' }}>
                리뷰 기록
              </p>
              <Link
                href={`/decisions/${d.id}/review`}
                className="text-xs tracking-[0.15em] uppercase transition-colors"
                style={{ color: '#6a7a60' }}
              >
                수정하기 →
              </Link>
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(18,24,14,0.7)',
                border: '1px solid rgba(184,137,42,0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="px-6 pb-2">
                <Row label="실제 결과">
                  <p className="leading-relaxed" style={{ color: '#c8bc98' }}>{review.actual_result}</p>
                </Row>

                <Row label="만족도">
                  <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', fontWeight: 300, color: satisfactionColor(review.satisfaction_score) }}>
                    {review.satisfaction_score}
                  </span>
                  <span className="text-xs ml-1" style={{ color: '#5a6a50' }}>/ 10</span>
                </Row>

                <Row label="다시 선택한다면">
                  <span style={{ color: review.would_choose_again ? '#8aad7a' : '#c47a7a' }}>
                    {review.would_choose_again ? '같은 선택을 할 것이다' : '다른 선택을 할 것이다'}
                  </span>
                </Row>

                {review.unexpected_things && (
                  <Row label="예상과 달랐던 점">
                    <p className="leading-relaxed" style={{ color: '#c8bc98' }}>{review.unexpected_things}</p>
                  </Row>
                )}

                {review.lesson_learned && (
                  <div className="py-4">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1.5" style={{ color: '#8aad7a' }}>
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
            className="block w-full text-center rounded-xl py-4 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-200"
            style={{
              background: reviewOverdue
                ? 'linear-gradient(135deg, #b8892a 0%, #d4a84b 100%)'
                : 'rgba(184,137,42,0.08)',
              border: `1px solid ${reviewOverdue ? 'transparent' : 'rgba(184,137,42,0.2)'}`,
              color: reviewOverdue ? '#0d1008' : '#d4a84b',
              boxShadow: reviewOverdue ? '0 0 30px rgba(184,137,42,0.25)' : 'none',
            }}
          >
            {reviewOverdue ? '결과 기록하기 →' : '리뷰 작성하기'}
          </Link>
        )}

        {decision.chat_session_id && (
          <ChatHistorySection
            messages={chatMessages}
            sessionId={decision.chat_session_id}
          />
        )}

      </div>
    </div>
  )
}
