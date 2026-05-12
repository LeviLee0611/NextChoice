'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountSection({ email }: { email: string }) {
  const [step, setStep] = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleDelete() {
    setStep('deleting')
    setError('')
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      })
      if (!res.ok) {
        setError('삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        setStep('confirm')
        return
      }
      // Sign out locally then redirect
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      setError('삭제 중 오류가 발생했습니다.')
      setStep('confirm')
    }
  }

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{
        background: 'rgba(196,64,64,0.04)',
        border: '1px solid rgba(196,64,64,0.15)',
      }}
    >
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1.5" style={{ color: '#e05a5a' }}>
          위험 구역
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#9aaa8a' }}>
          계정을 삭제하면 <span style={{ color: '#e8dfc8' }}>모든 결정 기록, AI 코치 대화, 분석 데이터</span>가
          영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <p className="text-xs mt-2" style={{ color: '#6a7a60' }}>삭제 대상 계정: {email}</p>
      </div>

      {step === 'idle' && (
        <button
          onClick={() => setStep('confirm')}
          className="self-start px-5 py-2.5 rounded-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-150"
          style={{ border: '1px solid rgba(196,64,64,0.3)', color: '#e05a5a' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,64,64,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          계정 삭제
        </button>
      )}

      {step === 'confirm' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium" style={{ color: '#e8dfc8' }}>
            정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
          </p>
          {error && <p className="text-xs" style={{ color: '#e05a5a' }}>{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-150"
              style={{ background: 'rgba(196,64,64,0.15)', border: '1px solid rgba(196,64,64,0.4)', color: '#e05a5a' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,64,64,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(196,64,64,0.15)' }}
            >
              네, 영구 삭제합니다
            </button>
            <button
              onClick={() => { setStep('idle'); setError('') }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-150"
              style={{ border: '1px solid rgba(184,137,42,0.15)', color: '#6a7a60' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#9aaa8a' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6a7a60' }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {step === 'deleting' && (
        <p className="text-sm" style={{ color: '#6a7a60' }}>삭제 중…</p>
      )}
    </div>
  )
}
