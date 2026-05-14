'use client'

import { useState, useTransition } from 'react'
import { saveAdminReply } from './actions'

export default function ReplyForm({ id, initialReply }: { id: string; initialReply: string | null }) {
  const [reply, setReply] = useState(initialReply ?? '')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await saveAdminReply(id, reply)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
      <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#d4a84b' }}>
        개발자 답장
      </p>
      <textarea
        value={reply}
        onChange={e => setReply(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="유저에게 답장을 남겨주세요..."
        className="w-full bg-transparent outline-none text-sm placeholder:opacity-30 resize-none rounded-lg p-3"
        style={{
          color: '#e8dfc8',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: '#6a7a60' }}>{reply.length} / 1000</span>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
          style={{
            background: saved ? 'rgba(138,173,122,0.12)' : 'rgba(184,137,42,0.08)',
            color: saved ? '#8aad7a' : '#d4a84b',
            border: `1px solid ${saved ? 'rgba(138,173,122,0.2)' : 'rgba(184,137,42,0.15)'}`,
          }}
        >
          {isPending ? '저장 중…' : saved ? '저장됨 ✓' : '답장 저장'}
        </button>
      </div>
    </div>
  )
}
