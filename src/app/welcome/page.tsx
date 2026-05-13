import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.auth.updateUser({ data: { welcomed: true } })

  const fullName: string = user.user_metadata?.full_name || user.user_metadata?.name || ''
  const firstName = fullName.split(' ')[0] || '반갑습니다'

  return (
    <div style={{
      background: '#111210',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>

        <p style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.6rem',
          letterSpacing: '0.35em',
          color: '#d4a84b',
          textTransform: 'uppercase',
          marginBottom: '3rem',
          fontWeight: 400,
        }}>
          NextChoice
        </p>

        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(2.8rem, 7vw, 4.2rem)',
          fontWeight: 300,
          color: '#e8dfc8',
          lineHeight: 1.15,
          marginBottom: '1.5rem',
          letterSpacing: '-0.01em',
        }}>
          환영해요,<br />
          <span style={{ color: '#d4a84b' }}>{firstName}</span>님
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: '#9aaa88',
          lineHeight: 1.8,
          marginBottom: '3.5rem',
        }}>
          더 나은 선택이 더 나은 삶을 만듭니다.<br />
          결정을 기록하고 나만의 패턴을 발견해보세요.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <Link
            href="/decisions/new"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '300px',
              padding: '0.9rem 2rem',
              background: 'linear-gradient(135deg, #d4a84b, #b8892a)',
              color: '#0a0e09',
              borderRadius: '0.75rem',
              textAlign: 'center',
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textDecoration: 'none',
            }}
          >
            첫 번째 결정 기록하기
          </Link>

          <Link
            href="/dashboard"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '300px',
              padding: '0.9rem 2rem',
              background: 'transparent',
              color: '#9aaa88',
              borderRadius: '0.75rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              textDecoration: 'none',
              border: '1px solid rgba(184,137,42,0.25)',
            }}
          >
            대시보드로 바로 가기
          </Link>
        </div>

      </div>
    </div>
  )
}
