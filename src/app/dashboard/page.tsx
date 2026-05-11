import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IMPORTANCE_LABELS, type ImportanceLevel } from '@/types/decision'
import InsightsPanel from '@/components/InsightsPanel'
import PeriodFilter from '@/components/dashboard/PeriodFilter'
import InsightSummary from '@/components/dashboard/InsightSummary'

function SectionCard({ title, accent, action, children }: {
  title: string
  accent: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl overflow-hidden flex flex-col" style={{ background: '#0f1a0d', border: '1px solid #2d3e28' }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #1e2a1a', background: '#0b1409' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-0.5 h-4 rounded-full" style={{ background: accent }} />
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: accent }}>{title}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}


export const runtime = 'edge'

type Period = 'all' | '1m' | '3m' | '6m' | '1y'
type SearchParams = { period?: string }

const CATEGORY_COLORS: Record<string, string> = {
  '커리어': '#7a9a8a', '관계': '#c47a4a', '재정': '#c4903e',
  '건강': '#8aad7a', '생활': '#a09060', '기타': '#8a9478',
}

function satisfactionColor(s: number) {
  if (s >= 7) return '#8aad7a'
  if (s >= 4) return '#c4903e'
  return '#c44040'
}

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function getPeriodStart(period: Period): string | null {
  if (period === 'all') return null
  const d = new Date()
  if (period === '1m') d.setMonth(d.getMonth() - 1)
  else if (period === '3m') d.setMonth(d.getMonth() - 3)
  else if (period === '6m') d.setMonth(d.getMonth() - 6)
  else d.setFullYear(d.getFullYear() - 1)
  return d.toISOString()
}

type ReviewRow = { satisfaction_score: number; would_choose_again: boolean }
type DecisionRow = {
  id: string; title: string; category: string
  importance_level: number; created_at: string
  decision_reviews: ReviewRow | ReviewRow[] | null
}

function getReviews(d: DecisionRow): ReviewRow[] {
  if (!d.decision_reviews) return []
  return Array.isArray(d.decision_reviews) ? d.decision_reviews : [d.decision_reviews]
}

function SatisfactionChart({ data }: { data: Array<{ label: string; avg: number | null }> }) {
  const W = 500, H = 160
  const pad = { t: 20, r: 20, b: 36, l: 34 }
  const cw = W - pad.l - pad.r
  const ch = H - pad.t - pad.b

  const pts = data.map((d, i) => ({
    x: pad.l + (data.length > 1 ? (i / (data.length - 1)) * cw : cw / 2),
    y: d.avg !== null ? pad.t + ch - (d.avg / 10) * ch : null,
    label: d.label, avg: d.avg,
  }))
  const valid = pts.filter((p): p is typeof p & { y: number; avg: number } => p.y !== null)

  if (valid.length < 2) return (
    <div className="flex items-center justify-center" style={{ height: H }}>
      <p className="text-xs" style={{ color: '#3a4a30' }}>데이터가 더 쌓이면 보여요</p>
    </div>
  )

  // Smooth cubic bezier path
  function smoothPath(points: { x: number; y: number }[]) {
    if (points.length < 2) return ''
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      d += ` C ${cpx.toFixed(1)} ${prev.y.toFixed(1)}, ${cpx.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`
    }
    return d
  }

  const linePath = smoothPath(valid)
  const bottom = pad.t + ch
  const areaPath = `${linePath} L ${valid[valid.length-1].x.toFixed(1)} ${bottom.toFixed(1)} L ${valid[0].x.toFixed(1)} ${bottom.toFixed(1)} Z`

  // Show labels only every N to avoid overlap
  const step = data.length > 8 ? 2 : 1
  const labelIds = new Set(data.map((_, i) => i).filter(i => i % step === 0 || i === data.length - 1))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8892a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#b8892a" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 5, 10].map(v => {
        const y = pad.t + ch - (v / 10) * ch
        return (
          <g key={v}>
            <line x1={pad.l} y1={y.toFixed(1)} x2={(pad.l+cw).toFixed(1)} y2={y.toFixed(1)}
              stroke={v === 0 ? '#2a3a28' : '#1a2418'} strokeWidth={v === 0 ? 1 : 0.5} strokeDasharray={v === 5 ? '3 4' : undefined} />
            <text x={(pad.l-8).toFixed(1)} y={(y+4).toFixed(1)} textAnchor="end" fontSize="9" fill="#3a4a30" fontFamily="monospace">{v}</text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#b8892a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {valid.map((p, i) => (
        <g key={i}>
          <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="5" fill="#0f1a0d" stroke="#b8892a" strokeWidth="1.5" />
          <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.5" fill="#d4a84b" />
        </g>
      ))}

      {/* X-axis labels */}
      {pts.map((p, i) => labelIds.has(i) && (
        <text key={i} x={p.x.toFixed(1)} y={(H - 8).toFixed(1)} textAnchor="middle" fontSize="9" fill="#4a5a3a">{p.label}</text>
      ))}
    </svg>
  )
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams
  const period: Period = (['1m','3m','6m','1y','all'] as const).includes(raw.period as Period)
    ? (raw.period as Period) : 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const periodStart = getPeriodStart(period)

  let query = supabase
    .from('decisions')
    .select('id, title, category, importance_level, created_at, decision_reviews(satisfaction_score, would_choose_again)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (periodStart) query = query.gte('created_at', periodStart)

  const [{ data, error }, { data: insightCache }] = await Promise.all([
    query,
    supabase.from('user_insight_cache').select('content').eq('user_id', user.id).eq('period', period).maybeSingle(),
  ])

  if (error) throw new Error(error.message)
  const decisions = (data ?? []) as DecisionRow[]

  if (decisions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-4xl mb-4">✦</p>
        <p className="text-sm mb-1" style={{ color: '#d4c9a8' }}>
          {period === 'all' ? '아직 기록된 결정이 없어요' : '해당 기간에 기록된 결정이 없어요'}
        </p>
        <p className="text-xs mb-8" style={{ color: '#5a6a50' }}>첫 번째 결정을 기록해보세요</p>
        <Link href="/decisions/new" className="text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-lg" style={{ background: '#141c12', border: '1px solid #6a4e1a', color: '#d4a84b' }}>
          결정 기록하기
        </Link>
      </div>
    )
  }

  // Stats
  const total = decisions.length
  const reviewedDecisions = decisions.filter(d => getReviews(d).length > 0)
  const reviewedCount = reviewedDecisions.length
  const allScores = reviewedDecisions.flatMap(d => getReviews(d).map(r => r.satisfaction_score))
  const avgSatisfaction = allScores.length > 0 ? Math.round(mean(allScores) * 10) / 10 : null
  const wouldChooseAll = reviewedDecisions.flatMap(d => getReviews(d).map(r => r.would_choose_again))
  const wouldChoosePct = wouldChooseAll.length > 0
    ? Math.round(wouldChooseAll.filter(Boolean).length / wouldChooseAll.length * 100) : null

  // Monthly trend
  const monthCount = period === '1m' ? 4 : period === '3m' ? 3 : period === '6m' ? 6 : 12
  const monthlyMap = new Map<string, number[]>()
  for (const d of decisions) {
    const reviews = getReviews(d)
    if (!reviews.length) continue
    const key = d.created_at.slice(0, 7)
    const e = monthlyMap.get(key) ?? []
    e.push(...reviews.map(r => r.satisfaction_score))
    monthlyMap.set(key, e)
  }
  const trendData = Array.from({ length: monthCount }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (monthCount - 1 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    const scores = monthlyMap.get(key) ?? []
    return { label: `${d.getMonth()+1}월`, avg: scores.length > 0 ? Math.round(mean(scores)*10)/10 : null }
  })

  // Category stats
  const catMap = new Map<string, { count: number; scores: number[] }>()
  for (const d of decisions) {
    const e = catMap.get(d.category) ?? { count: 0, scores: [] }
    e.count++; e.scores.push(...getReviews(d).map(r => r.satisfaction_score))
    catMap.set(d.category, e)
  }
  const categoryStats = [...catMap.entries()]
    .map(([cat, { count, scores }]) => ({
      cat, count, avg: scores.length > 0 ? Math.round(mean(scores)*10)/10 : null,
    }))
    .sort((a, b) => b.count - a.count)

  const recent = decisions.slice(0, 4)

  const statItems = [
    { label: '총 결정', value: String(total), color: '#d4a84b' },
    { label: '리뷰 완료', value: `${reviewedCount}/${total}`, color: '#8aad7a' },
    { label: '평균 만족도', value: avgSatisfaction != null ? String(avgSatisfaction) : '—', color: avgSatisfaction != null ? satisfactionColor(avgSatisfaction) : '#3a4a30' },
    { label: '재선택', value: wouldChoosePct != null ? `${wouldChoosePct}%` : '—', color: '#7a9a8a' },
  ] as const

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: '#8a9478' }}>Dashboard</p>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cinzel)', color: '#d4a84b', letterSpacing: '0.08em' }}>
            My Choices
          </h1>
        </div>

        <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(to right, transparent, #b8892a, #6b8f5e, transparent)' }} />

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ── Section 1: Stats ───────────────────────── */}
          <SectionCard title="통계" accent="#c4903e">
            <div className="p-5 flex flex-col gap-4">
              <PeriodFilter active={period} />
              <div className="grid grid-cols-2 gap-2">
                {statItems.map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl px-4 py-4 text-center" style={{ background: '#0d150b', border: '1px solid #1e2a1a' }}>
                    <p className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-cinzel)', color }}>{value}</p>
                    <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#4a5a3a' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* ── Section 2: Trend Chart ─────────────────── */}
          <SectionCard title="만족도 추이" accent="#b8892a">
            <div className="px-5 pt-3 pb-1">
              <p className="text-[10px] mb-2" style={{ color: '#3a4a30' }}>월별 리뷰 완료된 결정의 평균 만족도 (0–10점)</p>
              <SatisfactionChart data={trendData} />
            </div>
          </SectionCard>

          {/* ── Section 3: Category Stats ──────────────── */}
          <SectionCard title="카테고리별" accent="#7a9a8a">
            <div>
              {/* Column header */}
              <div className="flex items-center justify-between px-5 py-2" style={{ borderBottom: '1px solid #1a2418' }}>
                <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#3a4a30' }}>카테고리</span>
                <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#3a4a30' }}>평균 만족도 /10</span>
              </div>
            {categoryStats.map(({ cat, count, avg }, i) => {
              const isLast = i === categoryStats.length - 1
              const catColor = CATEGORY_COLORS[cat] ?? '#8a9478'
              return (
                <div key={cat} className="px-5 py-3.5" style={{ borderBottom: isLast ? 'none' : '1px solid #1a2418' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: catColor }} />
                      <span className="text-sm font-medium" style={{ color: catColor }}>{cat}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: '#4a5a3a', background: '#1a2418' }}>{count}건</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-cinzel)', color: avg ? satisfactionColor(avg) : '#3a4a30' }}>
                      {avg ?? '—'}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-1" style={{ background: '#1a2418' }}>
                    <div className="h-1 rounded-full transition-all" style={{ width: avg ? `${(avg/10)*100}%` : '0%', background: avg ? satisfactionColor(avg) : 'transparent' }} />
                  </div>
                </div>
              )
            })}
            </div>
          </SectionCard>

          {/* ── Section 4: AI Insights + Recent ───────── */}
          <div className="flex flex-col gap-3">

            {/* AI Insights */}
            <SectionCard
              title="AI 인사이트 요약"
              accent="#d4a84b"
              action={
                <Link href="/insights" className="text-[10px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-lg transition-colors"
                  style={{ color: '#5a6a50', border: '1px solid #2d3e28' }}>
                  더 보기 →
                </Link>
              }
            >
              <div className="p-5">
                {insightCache?.content ? (
                  <InsightSummary content={insightCache.content} />
                ) : (
                  <InsightsPanel compact period={period} />
                )}
              </div>
            </SectionCard>

            {/* Recent decisions */}
            <SectionCard
              title="최근 결정"
              accent="#6b8f5e"
              action={
                <Link href="/decisions" className="text-[10px] font-medium tracking-widest uppercase transition-colors" style={{ color: '#5a6a50' }}>
                  전체 보기 →
                </Link>
              }
            >
              {recent.map((d, i) => {
                const imp = IMPORTANCE_LABELS[d.importance_level as ImportanceLevel] ?? { emoji: '•' }
                const hasReview = getReviews(d).length > 0
                const isLast = i === recent.length - 1
                return (
                  <Link key={d.id} href={`/decisions/${d.id}`}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-[#141c12]"
                    style={{ borderBottom: isLast ? 'none' : '1px solid #1a2418' }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm shrink-0">{imp.emoji}</span>
                      <p className="text-sm truncate" style={{ color: '#e8dfc8' }}>{d.title}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold tracking-widest uppercase ml-3" style={{ color: hasReview ? '#6b8f5e' : '#3a4a30' }}>
                      {hasReview ? '✓' : '—'}
                    </span>
                  </Link>
                )
              })}
            </SectionCard>

          </div>

        </div>
      </div>
    </div>
  )
}
