import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewDecisionForm from './NewDecisionForm'
import type { Category } from '@/types/decision'


export type CategoryInsight = {
  total: number
  reviewed: number
  avgSatisfaction: number | null
  highConfAvgSat: number | null
  lowConfAvgSat: number | null
  wouldChooseAgainRate: number | null
}

export type CategoryStats = Partial<Record<Category, CategoryInsight>>

export default async function NewDecisionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: decisions } = await supabase
    .from('decisions')
    .select('category, confidence, decision_reviews(satisfaction_score, would_choose_again)')
    .eq('user_id', user.id)

  type Accum = {
    total: number
    satSum: number; satCount: number
    highConfSatSum: number; highConfSatCount: number
    lowConfSatSum: number; lowConfSatCount: number
    wouldAgainCount: number; wouldAgainReviewed: number
  }

  const accum: Partial<Record<Category, Accum>> = {}

  for (const d of decisions ?? []) {
    const cat = d.category as Category
    if (!accum[cat]) {
      accum[cat] = {
        total: 0,
        satSum: 0, satCount: 0,
        highConfSatSum: 0, highConfSatCount: 0,
        lowConfSatSum: 0, lowConfSatCount: 0,
        wouldAgainCount: 0, wouldAgainReviewed: 0,
      }
    }
    const a = accum[cat]!
    a.total++

    const review = (d.decision_reviews as { satisfaction_score: number; would_choose_again: boolean }[] | null)?.[0]
    if (review) {
      a.satSum += review.satisfaction_score
      a.satCount++
      a.wouldAgainReviewed++
      if (review.would_choose_again) a.wouldAgainCount++

      if (d.confidence >= 7) {
        a.highConfSatSum += review.satisfaction_score
        a.highConfSatCount++
      } else {
        a.lowConfSatSum += review.satisfaction_score
        a.lowConfSatCount++
      }
    }
  }

  const stats: CategoryStats = {}
  for (const [cat, a] of Object.entries(accum)) {
    stats[cat as Category] = {
      total: a.total,
      reviewed: a.satCount,
      avgSatisfaction: a.satCount > 0 ? Math.round((a.satSum / a.satCount) * 10) / 10 : null,
      highConfAvgSat: a.highConfSatCount > 0 ? Math.round((a.highConfSatSum / a.highConfSatCount) * 10) / 10 : null,
      lowConfAvgSat: a.lowConfSatCount > 0 ? Math.round((a.lowConfSatSum / a.lowConfSatCount) * 10) / 10 : null,
      wouldChooseAgainRate: a.wouldAgainReviewed > 0 ? Math.round((a.wouldAgainCount / a.wouldAgainReviewed) * 100) : null,
    }
  }

  return <NewDecisionForm categoryStats={stats} />
}
