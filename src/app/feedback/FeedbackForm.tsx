'use client'

import { useActionState } from 'react'
import { submitFeedback } from './actions'

const CATEGORIES = [
  { value: 'bug', label: '버그 신고' },
  { value: 'feature', label: '기능 제안' },
  { value: 'other', label: '기타' },
]

export default function FeedbackForm() {
  const [error, action, isPending] = useActionState(
    async (_: string | null, formData: FormData) => {
      try {
        await submitFeedback(formData)
        return null
      } catch (e) {
        if (e instanceof Error && (e as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw e
        return e instanceof Error ? e.message : '오류가 발생했습니다'
      }
    },
    null
  )

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Category */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: 'rgba(18,24,14,0.7)',
          border: '1px solid rgba(184,137,42,0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#d4a84b' }}>카테고리</p>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(({ value, label }) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="category" value={value} defaultChecked={value === 'feature'} className="sr-only peer" />
              <span
                className="inline-block px-4 py-2 rounded-lg text-sm font-medium tracking-wide border transition-all peer-checked:border-[rgba(184,137,42,0.5)] peer-checked:text-[#d4a84b] peer-checked:bg-[rgba(184,137,42,0.08)]"
                style={{
                  color: '#9aaa8a',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Title + Body */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: 'rgba(18,24,14,0.7)',
          border: '1px solid rgba(184,137,42,0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#d4a84b' }}>
            제목
          </label>
          <input
            name="title"
            type="text"
            maxLength={100}
            required
            placeholder="한 줄로 요약해주세요"
            className="w-full bg-transparent outline-none text-sm placeholder:text-[#6a7a60] border-b pb-2 transition-colors focus:border-[rgba(184,137,42,0.4)]"
            style={{ color: '#e8dfc8', borderColor: 'rgba(255,255,255,0.08)' }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#d4a84b' }}>
            내용
          </label>
          <textarea
            name="body"
            rows={6}
            maxLength={2000}
            required
            placeholder="자세히 설명해주세요. 어떤 상황에서 발생했는지, 어떻게 개선되면 좋겠는지 등..."
            className="w-full bg-transparent outline-none text-sm placeholder:text-[#6a7a60] resize-none rounded-lg p-3 transition-colors focus:border-[rgba(184,137,42,0.3)]"
            style={{
              color: '#e8dfc8',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-center" style={{ color: '#c44040' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all disabled:opacity-40"
        style={{
          background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 100%)',
          color: '#0d1008',
        }}
      >
        {isPending ? '전송 중…' : '피드백 보내기'}
      </button>
    </form>
  )
}
