import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditDecisionForm from './EditDecisionForm'
import type { Decision } from '@/types/decision'


export default async function EditDecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: decision } = await supabase
    .from('decisions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!decision) notFound()

  return <EditDecisionForm decision={decision as Decision} />
}
