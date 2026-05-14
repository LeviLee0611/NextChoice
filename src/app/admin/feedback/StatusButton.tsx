'use client'

import { useTransition } from 'react'
import { updateFeedbackStatus } from './actions'

const NEXT_STATUS: Record<string, { value: string; label: string }> = {
  new: { value: 'in_progress', label: '처리중으로 →' },
  in_progress: { value: 'resolved', label: '완료로 →' },
  resolved: { value: 'new', label: '신규로 되돌리기' },
}

export default function StatusButton({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  const next = NEXT_STATUS[currentStatus]
  if (!next) return null

  return (
    <button
      onClick={() => startTransition(() => updateFeedbackStatus(id, next.value))}
      disabled={isPending}
      className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
      style={{
        background: 'rgba(184,137,42,0.08)',
        color: '#d4a84b',
        border: '1px solid rgba(184,137,42,0.15)',
      }}
    >
      {isPending ? '…' : next.label}
    </button>
  )
}
