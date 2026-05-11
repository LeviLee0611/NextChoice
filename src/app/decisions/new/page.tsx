import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewDecisionForm from './NewDecisionForm'
import { CATEGORIES } from '@/types/decision'

export const runtime = 'edge'

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
    importance_level: params.importance_level ? Math.min(5, Math.max(1, Number(params.importance_level))) as 1|2|3|4|5 : undefined,
    reason: params.reason,
    chatSessionId: params.chat_session_id,
  }

  return <NewDecisionForm initialValues={initialValues} />
}
