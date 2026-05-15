'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_STATUSES = new Set(['new', 'in_progress', 'resolved'])

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')
}

export async function updateFeedbackStatus(id: string, status: string) {
  await assertAdmin()
  if (!VALID_STATUSES.has(status)) throw new Error('Invalid status')

  const admin = createAdminClient()
  const { error } = await admin.from('feedback').update({ status }).eq('id', id)
  if (error) throw new Error('저장에 실패했습니다. 다시 시도해주세요.')

  revalidatePath('/admin/feedback')
}

export async function saveAdminReply(id: string, reply: string) {
  await assertAdmin()

  const trimmed = reply.trim()
  if (trimmed.length > 1000) throw new Error('답장은 1000자 이내로 입력해주세요')

  const admin = createAdminClient()
  const { error } = await admin
    .from('feedback')
    .update({
      admin_reply: trimmed || null,
      replied_at: trimmed ? new Date().toISOString() : null,
    })
    .eq('id', id)
  if (error) throw new Error('저장에 실패했습니다. 다시 시도해주세요.')

  revalidatePath('/admin/feedback')
}
