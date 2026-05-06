'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createDecision(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('decisions').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    importance_level: Number(formData.get('importance_level')),
    option_a: formData.get('option_a') as string,
    option_b: formData.get('option_b') as string,
    chosen_option: formData.get('chosen_option') as string,
    reason: formData.get('reason') as string || null,
    reason_not_chosen: formData.get('reason_not_chosen') as string || null,
    confidence: Number(formData.get('confidence')),
    review_date: formData.get('review_date') as string || null,
  })

  if (error) throw new Error(error.message)

  redirect('/decisions')
}

export async function createReview(decisionId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const reviewData = {
    actual_result: formData.get('actual_result') as string,
    satisfaction_score: Number(formData.get('satisfaction_score')),
    unexpected_things: formData.get('unexpected_things') as string || null,
    lesson_learned: formData.get('lesson_learned') as string || null,
    would_choose_again: formData.get('would_choose_again') === 'true',
  }

  const { data: existing } = await supabase
    .from('decision_reviews')
    .select('id')
    .eq('decision_id', decisionId)
    .maybeSingle()

  const { error } = existing
    ? await supabase.from('decision_reviews').update(reviewData).eq('id', existing.id)
    : await supabase.from('decision_reviews').insert({ decision_id: decisionId, ...reviewData })

  if (error) throw new Error(error.message)

  redirect(`/decisions/${decisionId}`)
}

export async function updateDecision(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('decisions')
    .update({
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      importance_level: Number(formData.get('importance_level')),
      option_a: formData.get('option_a') as string,
      option_b: formData.get('option_b') as string,
      chosen_option: formData.get('chosen_option') as string,
      reason: formData.get('reason') as string || null,
      reason_not_chosen: formData.get('reason_not_chosen') as string || null,
      confidence: Number(formData.get('confidence')),
      review_date: formData.get('review_date') as string || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  redirect(`/decisions/${id}`)
}

export async function deleteDecision(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('decision_reviews').delete().eq('decision_id', id)

  const { error } = await supabase
    .from('decisions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  redirect('/decisions')
}
