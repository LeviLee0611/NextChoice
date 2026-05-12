export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return new Response('Missing session_id', { status: 400 })

  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()
  if (!session) return new Response('Not found', { status: 404 })

  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) return new Response('DB error', { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  let body: { session_id?: string; messages?: { role: string; content: string }[] }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }
  const { session_id, messages } = body

  if (!session_id || !Array.isArray(messages) || messages.length === 0) {
    return new Response('Invalid', { status: 400 })
  }
  if (messages.length > 4) return new Response('Too many messages', { status: 400 })

  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('id', session_id)
    .eq('user_id', user.id)
    .single()
  if (!session) return new Response('Not found', { status: 404 })

  for (const m of messages) {
    if (typeof m !== 'object' || m === null) return new Response('Invalid message', { status: 400 })
    if (!['user', 'assistant'].includes(m.role)) return new Response('Invalid role', { status: 400 })
    if (typeof m.content !== 'string' || m.content.length > 4000) return new Response('Invalid content', { status: 400 })
  }

  const rows = messages.map((m: { role: string; content: string }) => ({
    session_id,
    user_id: user.id,
    role: m.role,
    content: m.content,
  }))

  const { error } = await supabase.from('chat_messages').insert(rows)
  if (error) return new Response('DB error', { status: 500 })

  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', session_id)
    .eq('user_id', user.id)

  return new Response('OK')
}
