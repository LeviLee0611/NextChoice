export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { title, category, option_a, option_b, option_c, context, importance_level } = body

  if (!title || !category || !option_a || !option_b) {
    return new Response('Missing required fields', { status: 400 })
  }


  const VALID_CATEGORIES = ['커리어', '관계', '재정', '건강', '생활', '기타']
  if (!VALID_CATEGORIES.includes(category)) {
    return new Response('Invalid category', { status: 400 })
  }

  const imp = Math.min(5, Math.max(1, parseInt(importance_level) || 3))

  const { data, error } = await supabase.from('decisions').insert({
    user_id: user.id,
    title: String(title).slice(0, 200),
    category,
    option_a: String(option_a).slice(0, 200),
    option_b: String(option_b).slice(0, 200),
    option_c: option_c ? String(option_c).slice(0, 200) : null,
    reason: context ? String(context).slice(0, 1000) : null,
    importance_level: imp,
    chosen_option: 'A',
    confidence: 5,
    gut_vs_logic: 3,
  }).select('id').single()

  if (error) return new Response(`DB error: ${error.message}`, { status: 500 })

  return Response.json({ id: data.id })
}
