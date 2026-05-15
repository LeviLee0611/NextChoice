'use server'

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/types/decision'

const VALID_CATEGORIES = new Set(CATEGORIES)

function parseDecisionFields(formData: FormData) {
  const title = (formData.get('title') as string).trim()
  const category = formData.get('category') as string
  const importanceLevel = Number(formData.get('importance_level'))
  const optionA = (formData.get('option_a') as string).trim()
  const optionB = (formData.get('option_b') as string).trim()
  const optionC = ((formData.get('option_c') as string | null) ?? '').trim() || null
  const optionD = ((formData.get('option_d') as string | null) ?? '').trim() || null
  const chosenOption = formData.get('chosen_option') as string
  const confidence = Number(formData.get('confidence'))
  const reason = (formData.get('reason') as string).trim() || null
  const reasonNotChosen = (formData.get('reason_not_chosen') as string).trim() || null
  const reviewDate = (formData.get('review_date') as string) || null

  if (!title || title.length > 200) throw new Error('Invalid title')
  if (!VALID_CATEGORIES.has(category as never)) throw new Error('Invalid category')
  if (!Number.isInteger(importanceLevel) || importanceLevel < 1 || importanceLevel > 5) throw new Error('Invalid importance')
  if (!optionA || optionA.length > 200 || !optionB || optionB.length > 200) throw new Error('Options required')
  if (optionC && optionC.length > 200) throw new Error('Option C too long')
  if (optionD && optionD.length > 200) throw new Error('Option D too long')
  if (optionD && !optionC) throw new Error('Option D requires option C')

  const validChosenOptions = new Set(['A', 'B', ...(optionC ? ['C'] : []), ...(optionD ? ['D'] : [])])
  if (!validChosenOptions.has(chosenOption)) throw new Error('Invalid chosen option')

  if (!Number.isInteger(confidence) || confidence < 1 || confidence > 10) throw new Error('Invalid confidence')
  if (reason && reason.length > 1000) throw new Error('Reason too long')
  if (reasonNotChosen && reasonNotChosen.length > 1000) throw new Error('Reason not chosen too long')
  if (reviewDate && !/^\d{4}-\d{2}-\d{2}$/.test(reviewDate)) throw new Error('Invalid review date')

  const gutVsLogicRaw = formData.get('gut_vs_logic')
  const gutVsLogic = gutVsLogicRaw ? Number(gutVsLogicRaw) : null
  if (gutVsLogic !== null && (!Number.isInteger(gutVsLogic) || gutVsLogic < 1 || gutVsLogic > 5)) throw new Error('Invalid gut_vs_logic')

  const timePressureRaw = formData.get('time_pressure')
  const timePressure = timePressureRaw ? Number(timePressureRaw) : null
  if (timePressure !== null && (!Number.isInteger(timePressure) || timePressure < 1 || timePressure > 3)) throw new Error('Invalid time_pressure')

  return { title, category, importance_level: importanceLevel, option_a: optionA, option_b: optionB, option_c: optionC, option_d: optionD, chosen_option: chosenOption, confidence, gut_vs_logic: gutVsLogic, time_pressure: timePressure, reason, reason_not_chosen: reasonNotChosen, review_date: reviewDate }
}

export async function createDecision(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const fields = parseDecisionFields(formData)

  const rawSessionId = (formData.get('chat_session_id') as string) || null
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  let chatSessionId: string | null = null
  if (rawSessionId && uuidRe.test(rawSessionId)) {
    const { data: ownedSession } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', rawSessionId)
      .eq('user_id', user.id)
      .single()
    if (ownedSession) chatSessionId = rawSessionId
  }

  const { error } = await supabase.from('decisions').insert({
    user_id: user.id,
    ...fields,
    ...(chatSessionId ? { chat_session_id: chatSessionId } : {}),
  })
  if (error) throw new Error('결정을 저장하지 못했습니다. 다시 시도해주세요.')

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

  if (error) throw new Error('리뷰를 저장하지 못했습니다. 다시 시도해주세요.')

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

  if (error) throw new Error('삭제하지 못했습니다. 다시 시도해주세요.')

  redirect('/decisions')
}
