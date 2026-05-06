import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReviewForm from './ReviewForm'
import type { Decision } from '@/types/decision'

export const runtime = 'edge'

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: decision } = await supabase
    .from('decisions')
    .select('*')
    .eq('id', id)
    .single()

  if (!decision) notFound()

  return <ReviewForm decision={decision as Decision} />
}
