export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  // 1. Authenticate user first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // 2. Validate admin client config BEFORE touching any data
  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return new Response('서비스 설정 오류로 계정 삭제를 처리할 수 없습니다', { status: 503 })
  }

  // 3. Require explicit confirmation in body (CSRF + accidental call protection)
  let body: { confirm?: boolean }
  try { body = await req.json() } catch { return new Response('Invalid JSON', { status: 400 }) }
  if (body.confirm !== true) return new Response('confirm 필드가 필요합니다', { status: 400 })

  const uid = user.id

  // 4. Delete app data in dependency order, checking each result
  // decision_reviews: handled by FK CASCADE when decisions are deleted
  const deletes: Array<{ table: string; error: unknown }> = []

  const { error: cacheErr } = await supabase.from('user_insight_cache').delete().eq('user_id', uid)
  if (cacheErr) deletes.push({ table: 'user_insight_cache', error: cacheErr })

  const { error: msgErr } = await supabase.from('chat_messages').delete().eq('user_id', uid)
  if (msgErr) deletes.push({ table: 'chat_messages', error: msgErr })

  const { error: sessErr } = await supabase.from('chat_sessions').delete().eq('user_id', uid)
  if (sessErr) deletes.push({ table: 'chat_sessions', error: sessErr })

  const { error: decErr } = await supabase.from('decisions').delete().eq('user_id', uid)
  if (decErr) deletes.push({ table: 'decisions', error: decErr })

  if (deletes.length > 0) {
    console.error('Account deletion: app data errors', deletes)
    return new Response('데이터 삭제 중 오류가 발생했습니다. 다시 시도해주세요.', { status: 500 })
  }

  // 5. Delete auth user last (point of no return)
  const { error: authErr } = await admin.auth.admin.deleteUser(uid)
  if (authErr) {
    console.error('Account deletion: auth delete failed', authErr)
    return new Response('계정 삭제에 실패했습니다. 고객 지원에 문의해주세요.', { status: 500 })
  }

  return new Response('OK')
}
