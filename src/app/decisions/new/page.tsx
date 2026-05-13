import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewDecisionForm from './NewDecisionForm'
import { CATEGORIES, type PastDecisionInsight } from '@/types/decision'

type SearchParams = {
  title?: string; category?: string; option_a?: string; option_b?: string
  option_c?: string; importance_level?: string; reason?: string; chat_session_id?: string
}

export default async function NewDecisionPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const validCategory = CATEGORIES.includes(params.category as never) ? params.category : undefined
  const initialValues = {
    title: params.title,
    category: validCategory as typeof CATEGORIES[number] | undefined,
    option_a: params.option_a,
    option_b: params.option_b,
    option_c: params.option_c,
    importance_level: (() => { const n = Number(params.importance_level); return Number.isInteger(n) && n >= 1 && n <= 5 ? n as 1|2|3|4|5 : undefined })(),
    reason: params.reason,
    chatSessionId: params.chat_session_id,
  }

  const { data: raw } = await supabase
    .from('decisions')
    .select('id, title, category, chosen_option, option_a, option_b, option_c, option_d, decision_reviews(satisfaction_score)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const pastDecisions: PastDecisionInsight[] = (raw ?? []).map(d => {
    const chosenText =
      d.chosen_option === 'A' ? d.option_a :
      d.chosen_option === 'B' ? d.option_b :
      d.chosen_option === 'C' ? (d.option_c ?? '') :
      (d.option_d ?? '')
    const review = (d.decision_reviews as { satisfaction_score: number }[] | null)?.[0]
    return {
      id: d.id,
      title: d.title,
      category: d.category,
      chosen_option: d.chosen_option,
      chosen_text: chosenText,
      satisfaction: review?.satisfaction_score ?? null,
    }
  })

  return <NewDecisionForm initialValues={initialValues} pastDecisions={pastDecisions} />
}
