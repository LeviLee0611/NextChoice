export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function mean(arr: number[]) {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

type ReviewRow = { satisfaction_score: number; would_choose_again: boolean }
type DecisionRow = { category: string; decision_reviews: ReviewRow | ReviewRow[] | null }

function getReviews(d: DecisionRow): ReviewRow[] {
  if (!d.decision_reviews) return []
  return Array.isArray(d.decision_reviews) ? d.decision_reviews : [d.decision_reviews]
}

function computeStats(decisions: DecisionRow[]) {
  const reviewed = decisions.filter(d => getReviews(d).length > 0)
  const scores = reviewed.flatMap(d => getReviews(d).map(r => r.satisfaction_score))
  const would = reviewed.flatMap(d => getReviews(d).map(r => r.would_choose_again))
  const catCounts: Record<string, number> = {}
  for (const d of decisions) catCounts[d.category] = (catCounts[d.category] ?? 0) + 1
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  return {
    total: decisions.length,
    reviewed: reviewed.length,
    avgSatisfaction: scores.length > 0 ? Math.round(mean(scores) * 10) / 10 : null,
    wouldChoosePct: would.length > 0 ? Math.round(would.filter(Boolean).length / would.length * 100) : null,
    topCategory: topCat,
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const aFrom = searchParams.get('aFrom')
  const aTo = searchParams.get('aTo')
  const bFrom = searchParams.get('bFrom')
  const bTo = searchParams.get('bTo')

  if (!aFrom || !aTo || !bFrom || !bTo) {
    return new Response('Missing params', { status: 400 })
  }

  const ISO_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/
  const MAX_RANGE_MS = 3 * 365 * 86400 * 1000 // 3년
  const dates = [aFrom, aTo, bFrom, bTo]
  if (dates.some(d => !ISO_RE.test(d) || isNaN(Date.parse(d)))) {
    return new Response('Invalid date format', { status: 400 })
  }
  if (Date.parse(aTo) < Date.parse(aFrom) || Date.parse(bTo) < Date.parse(bFrom)) {
    return new Response('from must be before to', { status: 400 })
  }
  if (Date.parse(aTo) - Date.parse(aFrom) > MAX_RANGE_MS || Date.parse(bTo) - Date.parse(bFrom) > MAX_RANGE_MS) {
    return new Response('Range too large', { status: 400 })
  }

  const [resA, resB] = await Promise.all([
    supabase.from('decisions')
      .select('category, decision_reviews(satisfaction_score, would_choose_again)')
      .eq('user_id', user.id)
      .gte('created_at', aFrom)
      .lte('created_at', aTo),
    supabase.from('decisions')
      .select('category, decision_reviews(satisfaction_score, would_choose_again)')
      .eq('user_id', user.id)
      .gte('created_at', bFrom)
      .lte('created_at', bTo),
  ])

  if (resA.error || resB.error) return new Response('DB error', { status: 500 })

  return Response.json({
    a: computeStats((resA.data ?? []) as DecisionRow[]),
    b: computeStats((resB.data ?? []) as DecisionRow[]),
  })
}
