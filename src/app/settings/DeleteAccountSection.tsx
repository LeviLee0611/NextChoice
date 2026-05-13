'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CONFIRM_PHRASE = '계정삭제하기'

export default function DeleteAccountSection({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function closeModal() {
    setOpen(false)
    setInput('')
    setError('')
  }

  async function handleDelete() {
    if (input !== CONFIRM_PHRASE) return
    setDeleting(true)
    setError('')
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm_phrase: CONFIRM_PHRASE }),
      })
      if (!res.ok) {
        setError('삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        setDeleting(false)
        return
      }
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      setError('삭제 중 오류가 발생했습니다.')
      setDeleting(false)
    }
  }

  return (
    <>
      <div
        className="rounded-2xl p-6 flex flex-col gap-5"
        style={{ background: 'rgba(196,64,64,0.04)', border: '1px solid rgba(196,64,64,0.15)' }}
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1.5" style={{ color: '#e05a5a' }}>
            위험 구역
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#9aaa8a' }}>
            계정을 삭제하면 <span style={{ color: '#e8dfc8' }}>모든 결정 기록, AI 코치 대화, 분석 데이터</span>가
            영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <p className="text-xs mt-2" style={{ color: '#9aaa88' }}>삭제 대상 계정: {email}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="self-start px-5 py-2.5 rounded-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-150"
          style={{ border: '1px solid rgba(196,64,64,0.3)', color: '#e05a5a', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,64,64,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          계정 삭제
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-5"
            style={{ background: '#131510', border: '1px solid rgba(196,64,64,0.25)' }}
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: '#e05a5a' }}>
                계정 영구 삭제
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#9aaa8a' }}>
                삭제하면 모든 데이터가 복구 불가능하게 사라져요.
                계속하려면 아래에 <span style={{ color: '#e8dfc8', fontWeight: 500 }}>{CONFIRM_PHRASE}</span>를 입력하세요.
              </p>
            </div>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && input === CONFIRM_PHRASE) handleDelete() }}
              placeholder={CONFIRM_PHRASE}
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(196,64,64,0.05)',
                border: `1px solid ${input === CONFIRM_PHRASE ? 'rgba(196,64,64,0.5)' : 'rgba(196,64,64,0.2)'}`,
                color: '#e8dfc8',
              }}
            />

            {error && <p className="text-xs" style={{ color: '#e05a5a' }}>{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={input !== CONFIRM_PHRASE || deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-150 disabled:opacity-30"
                style={{ background: 'rgba(196,64,64,0.15)', border: '1px solid rgba(196,64,64,0.4)', color: '#e05a5a' }}
                onMouseEnter={e => { if (input === CONFIRM_PHRASE && !deleting) e.currentTarget.style.background = 'rgba(196,64,64,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(196,64,64,0.15)' }}
              >
                {deleting ? '삭제 중…' : '영구 삭제'}
              </button>
              <button
                onClick={closeModal}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-150"
                style={{ border: '1px solid rgba(184,137,42,0.15)', color: '#9aaa88' }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
