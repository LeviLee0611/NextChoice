'use server'

import { createClient } from '@/lib/supabase/server'

export async function markWelcomed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.auth.updateUser({ data: { welcomed: true } })
}
