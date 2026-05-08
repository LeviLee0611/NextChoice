import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewDecisionForm from './NewDecisionForm'

export const runtime = 'edge'

export default async function NewDecisionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <NewDecisionForm />
}
