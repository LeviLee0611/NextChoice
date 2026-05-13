import type { SupabaseClient } from '@supabase/supabase-js'

export const RATE_LIMITS = {
  chat_turns: 30,     // per day
  insight_calls: 5,   // per day (캐시 히트는 카운트 안 됨)
} as const

export type UsageField = keyof typeof RATE_LIMITS

// Returns true if allowed, false if limit exceeded.
// Fails open on DB error (don't block users on infra issues).
export async function checkAndIncrement(
  supabase: SupabaseClient,
  userId: string,
  field: UsageField,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('increment_and_check_usage', {
    p_user_id: userId,
    p_field: field,
    p_limit: RATE_LIMITS[field],
  })
  if (error) return true
  return data === true
}
