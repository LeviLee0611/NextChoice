import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'


export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message, error)
      // 이미 세션이 있으면 그냥 통과 (중복 요청 방어)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user && !user.user_metadata?.welcomed) {
      return NextResponse.redirect(`${origin}/welcome`)
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
