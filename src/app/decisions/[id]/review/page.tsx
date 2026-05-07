import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReviewForm from './ReviewForm'
import type { Decision } from '@/types/decision'


export interface ExistingReview {
  id: string
  actual_result: string
  satisfaction_score: number
  unexpected_things: string | null
  lesson_learned: string | null
  would_choose_again: boolean
}

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
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

  const existing = (decision.decision_reviews as ExistingReview[])?.[0] ?? null

  return <ReviewForm decision={decision as Decision} existing={existing} />
}
