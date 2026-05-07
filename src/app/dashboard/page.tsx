import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IMPORTANCE_LABELS, type ImportanceLevel } from '@/types/decision'


const CATEGORY_COLORS: Record<string, string> = {
  '커리어': '#7a9a8a',
  '관계':   '#c47a4a',
  '재정':   '#c4903e',
  '건강':   '#8aad7a',
  '생활':   '#a09060',
  '기타':   '#8a9478',
}

function satisfactionColor(score: number) {
  if (score >= 7) return '#8aad7a'
  if (score >= 4) return '#c4903e'
  return '#c44040'
}

function StatCard({ label, value, sub, color = '#d4a84b' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: '#0f1a0d', borderColor: '#2d3e28' }}
    >
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#8a9478' }}>
        {label}
      </p>
      <p className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-cinzel)', color }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1.5" style={{ color: '#5a6a50' }}>{sub}</p>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. 쿼리 + 에러 처리 / 불필요한 필드 제거
  const { data: decisions, error } = await supabase
    .from('decisions')
    .select('id, title, category, importance_level, created_at, decision_reviews(satisfaction_score)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  if (!decisions || decisions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-4xl mb-4">✦</p>
        <p className="text-sm mb-1" style={{ color: '#d4c9a8' }}>아직 기록된 결정이 없어요</p>
        <p className="text-xs mb-8" style={{ color: '#5a6a50' }}>첫 번째 결정을 기록해보세요</p>
        <Link
          href="/decisions/new"
          className="text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-lg transition-colors"
          style={{ background: '#141c12', border: '1px solid #6a4e1a', color: '#d4a84b' }}
        >
          결정 기록하기
        </Link>
      </div>
    )
  }

  // 통계 계산
  const total = decisions.length
  const reviewed = decisions.filter(d => (d.decision_reviews as { satisfaction_score: number }[])?.length > 0)
  const reviewedCount = reviewed.length
  const allScores = reviewed.flatMap(d => (d.decision_reviews as { satisfaction_score: number }[]).map(r => r.satisfaction_score))
  const avgSatisfaction = allScores.length > 0
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
    : null

  // 카테고리별 통계
  const categoryMap: Record<string, { count: number; scores: number[] }> = {}
  for (const d of decisions) {
    if (!categoryMap[d.category]) categoryMap[d.category] = { count: 0, scores: [] }
    categoryMap[d.category].count++
    const scores = (d.decision_reviews as { satisfaction_score: number }[])?.map(r => r.satisfaction_score) ?? []
    categoryMap[d.category].scores.push(...scores)
  }
  const categoryStats = Object.entries(categoryMap).sort((a, b) => b[1].count - a[1].count)

  const recent = decisions.slice(0, 3)

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: '#8a9478' }}>Dashboard</p>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cinzel)', color: '#d4a84b', letterSpacing: '0.08em' }}>
            나의 기록
          </h1>
        </div>

        <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(to right, transparent, #b8892a, #6b8f5e, transparent)' }} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <StatCard label="총 결정" value={total} sub="기록된 선택들" />
          <StatCard
            label="리뷰 완료"
            value={`${reviewedCount} / ${total}`}
            sub={`${Math.round(reviewedCount / total * 100)}% 돌아봄`}
            color="#8aad7a"
          />
          <StatCard
            label="평균 만족도"
            value={avgSatisfaction ?? '—'}
            sub={avgSatisfaction ? '10점 만점' : '리뷰 후 집계'}
            color={avgSatisfaction ? satisfactionColor(avgSatisfaction) : '#5a6a50'}
          />
        </div>

        {/* 카테고리별 */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#8a9478' }}>
            카테고리별
          </p>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: '#0f1a0d', borderColor: '#2d3e28' }}
          >
            {categoryStats.map(([cat, { count, scores }], i) => {
              const avg = scores.length > 0
                ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
                : null
              const isLast = i === categoryStats.length - 1
              return (
                <div
                  key={cat}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderBottom: isLast ? 'none' : '1px solid #1e2a1a' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium" style={{ color: CATEGORY_COLORS[cat] ?? '#8a9478' }}>
                      {cat}
                    </span>
                    <span className="text-xs" style={{ color: '#5a6a50' }}>{count}개</span>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ fontFamily: 'var(--font-cinzel)', color: avg ? satisfactionColor(avg) : '#5a6a50' }}
                  >
                    {avg ?? '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 최근 결정 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#8a9478' }}>
              최근 결정
            </p>
            <Link
              href="/decisions"
              className="text-xs tracking-widest uppercase transition-colors hover:text-[#d4a84b]"
              style={{ color: '#8a9478' }}
            >
              전체 보기 →
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map(d => {
              // 5. IMPORTANCE_LABELS fallback
              const imp = IMPORTANCE_LABELS[d.importance_level as ImportanceLevel] ?? { emoji: '•', label: '' }
              const hasReview = (d.decision_reviews as unknown[])?.length > 0
              return (
                <Link
                  key={d.id}
                  href={`/decisions/${d.id}`}
                  className="flex items-center justify-between rounded-xl border px-5 py-3.5 transition-colors border-[#2d3e28] hover:border-[#4a5e3a]"
                  style={{ background: '#0f1a0d' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm">{imp.emoji}</span>
                    <p className="text-sm truncate" style={{ color: '#e8dfc8' }}>{d.title}</p>
                  </div>
                  <span
                    className="shrink-0 text-[11px] font-semibold tracking-widest uppercase ml-3"
                    style={{ color: hasReview ? '#8aad7a' : '#5a6a50' }}
                  >
                    {hasReview ? '완료' : '미완료'}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
