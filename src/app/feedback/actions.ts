'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const VALID_CATEGORIES = new Set(['bug', 'feature', 'other'])

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const category = formData.get('category') as string
  const title = (formData.get('title') as string).trim()
  const body = (formData.get('body') as string).trim()

  if (!VALID_CATEGORIES.has(category)) throw new Error('Invalid category')
  if (!title || title.length > 100) throw new Error('제목은 1~100자 이내로 입력해주세요')
  if (!body || body.length > 2000) throw new Error('내용은 1~2000자 이내로 입력해주세요')

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    user_email: user.email,
    category,
    title,
    body,
  })
  if (error) throw new Error('피드백 제출에 실패했습니다. 다시 시도해주세요.')

  redirect('/feedback?sent=1')
}
