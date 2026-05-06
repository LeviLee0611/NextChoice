'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createDecision(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('decisions').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    importance_level: Number(formData.get('importance_level')),
    option_a: formData.get('option_a') as string,
    option_b: formData.get('option_b') as string,
    chosen_option: formData.get('chosen_option') as string,
    reason: formData.get('reason') as string || null,
    confidence: Number(formData.get('confidence')),
    review_date: formData.get('review_date') as string || null,
  })

  if (error) throw new Error(error.message)

  redirect('/decisions')
}
