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

  // 3. Require typed confirmation phrase (CSRF + accidental call protection)
  let body: { confirm_phrase?: string }
  try { body = await req.json() } catch { return new Response('Invalid JSON', { status: 400 }) }
  if (body.confirm_phrase !== '계정삭제하기') return new Response('confirm_phrase가 올바르지 않습니다', { status: 400 })

  const uid = user.id

  // 4. Delete app data via admin client (bypasses RLS, no policy gap risk)
  const deletes: Array<{ table: string; error: unknown }> = []

  const { error: decErr } = await admin.from('decisions').delete().eq('user_id', uid)
  if (decErr) deletes.push({ table: 'decisions', error: decErr })

  const { error: msgErr } = await admin.from('chat_messages').delete().eq('user_id', uid)
  if (msgErr) deletes.push({ table: 'chat_messages', error: msgErr })

  const { error: sessErr } = await admin.from('chat_sessions').delete().eq('user_id', uid)
  if (sessErr) deletes.push({ table: 'chat_sessions', error: sessErr })

  const { error: cacheErr } = await admin.from('user_insight_cache').delete().eq('user_id', uid)
  if (cacheErr) deletes.push({ table: 'user_insight_cache', error: cacheErr })

  const { error: usageErr } = await admin.from('api_usage').delete().eq('user_id', uid)
  if (usageErr) deletes.push({ table: 'api_usage', error: usageErr })

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
