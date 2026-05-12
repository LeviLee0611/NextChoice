export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id, created_at, updated_at, title')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(30)

  if (error) return new Response('DB error', { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  let title: string | null = null
  try {
    const body = await req.json()
    if (typeof body?.title === 'string') title = body.title.slice(0, 60) || null
  } catch {}

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: user.id, title })
    .select('id')
    .single()

  if (error) return new Response('DB error', { status: 500 })
  return Response.json({ id: data.id })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  let body: { id?: string; title?: string }
  try { body = await req.json() } catch { return new Response('Invalid JSON', { status: 400 }) }

  const { id, title } = body
  if (!id || typeof title !== 'string') return new Response('Invalid', { status: 400 })

  const { error } = await supabase
    .from('chat_sessions')
    .update({ title: title.slice(0, 60) || null })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return new Response('DB error', { status: 500 })
  return new Response('OK')
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  let body: { id?: string }
  try { body = await req.json() } catch { return new Response('Invalid JSON', { status: 400 }) }

  const { id } = body
  if (!id) return new Response('Invalid', { status: 400 })

  // Verify ownership before deleting
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!session) return new Response('Not found', { status: 404 })

  await supabase.from('chat_messages').delete().eq('session_id', id)
  const { error } = await supabase.from('chat_sessions').delete().eq('id', id).eq('user_id', user.id)

  if (error) return new Response('DB error', { status: 500 })
  return new Response('OK')
}
