export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(30)

  if (error) return new Response('DB error', { status: 500 })
  return Response.json(data ?? [])
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: user.id })
    .select('id')
    .single()

  if (error) return new Response('DB error', { status: 500 })
  return Response.json({ id: data.id })
}
