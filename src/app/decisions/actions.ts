'use server'

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/types/decision'

const VALID_CATEGORIES = new Set(CATEGORIES)
const VALID_OPTIONS = new Set(['A', 'B'])

function parseDecisionFields(formData: FormData) {
  const title = (formData.get('title') as string).trim()
  const category = formData.get('category') as string
  const importanceLevel = Number(formData.get('importance_level'))
  const optionA = (formData.get('option_a') as string).trim()
  const optionB = (formData.get('option_b') as string).trim()
  const chosenOption = formData.get('chosen_option') as string
  const confidence = Number(formData.get('confidence'))
  const reason = (formData.get('reason') as string).trim() || null
  const reasonNotChosen = (formData.get('reason_not_chosen') as string).trim() || null
  const reviewDate = (formData.get('review_date') as string) || null

  if (!title || title.length > 200) throw new Error('Invalid title')
  if (!VALID_CATEGORIES.has(category as never)) throw new Error('Invalid category')
  if (!Number.isInteger(importanceLevel) || importanceLevel < 1 || importanceLevel > 5) throw new Error('Invalid importance')
  if (!optionA || optionA.length > 200 || !optionB || optionB.length > 200) throw new Error('Options required')
  if (!VALID_OPTIONS.has(chosenOption as never)) throw new Error('Invalid chosen option')
  if (!Number.isInteger(confidence) || confidence < 1 || confidence > 10) throw new Error('Invalid confidence')
  if (reason && reason.length > 1000) throw new Error('Reason too long')
  if (reasonNotChosen && reasonNotChosen.length > 1000) throw new Error('Reason not chosen too long')
  if (reviewDate && !/^\d{4}-\d{2}-\d{2}$/.test(reviewDate)) throw new Error('Invalid review date')

  return { title, category, importance_level: importanceLevel, option_a: optionA, option_b: optionB, chosen_option: chosenOption, confidence, reason, reason_not_chosen: reasonNotChosen, review_date: reviewDate }
}

export async function createDecision(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const fields = parseDecisionFields(formData)

  const { error } = await supabase.from('decisions').insert({ user_id: user.id, ...fields })
  if (error) throw new Error(error.message)

  redirect('/decisions')
}

export async function createReview(decisionId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify ownership
  const { data: decision } = await supabase
    .from('decisions')
    .select('id')
    .eq('id', decisionId)
    .eq('user_id', user.id)
    .single()
  if (!decision) notFound()

  const satisfactionScore = Number(formData.get('satisfaction_score'))
  if (!Number.isInteger(satisfactionScore) || satisfactionScore < 1 || satisfactionScore > 10) throw new Error('Invalid satisfaction score')
  const wouldChooseAgain = formData.get('would_choose_again')
  if (wouldChooseAgain !== 'true' && wouldChooseAgain !== 'false') throw new Error('Invalid would_choose_again')

  const actualResult = (formData.get('actual_result') as string).trim()
  const unexpectedThings = (formData.get('unexpected_things') as string).trim() || null
  const lessonLearned = (formData.get('lesson_learned') as string).trim() || null

  if (!actualResult || actualResult.length > 2000) throw new Error('Invalid actual result')
  if (unexpectedThings && unexpectedThings.length > 1000) throw new Error('Unexpected things too long')
  if (lessonLearned && lessonLearned.length > 1000) throw new Error('Lesson learned too long')

  const reviewData = {
    actual_result: actualResult,
    satisfaction_score: satisfactionScore,
    unexpected_things: unexpectedThings,
    lesson_learned: lessonLearned,
    would_choose_again: wouldChooseAgain === 'true',
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

  const fields = parseDecisionFields(formData)

  const { data, error } = await supabase
    .from('decisions')
    .update(fields)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .single()

  if (error || !data) notFound()

  redirect(`/decisions/${id}`)
}

export async function deleteDecision(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify ownership before doing anything
  const { data: decision } = await supabase
    .from('decisions')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!decision) notFound()

  // ON DELETE CASCADE handles decision_reviews automatically
  const { error } = await supabase
    .from('decisions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  redirect('/decisions')
}
