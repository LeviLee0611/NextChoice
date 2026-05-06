'use client'

import { useState, useTransition } from 'react'
import { deleteDecision } from '../actions'

export default function DeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteDecision(id)
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: '#5a6a50' }}>정말 삭제할까요?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs tracking-widest uppercase transition-colors disabled:opacity-40"
          style={{ color: '#c44040' }}
        >
          {isPending ? '삭제 중…' : '삭제'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs tracking-widest uppercase transition-colors"
          style={{ color: '#3a4a30' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#8a9478' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3a4a30' }}
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs tracking-widest uppercase transition-colors"
      style={{ color: '#3a4a30' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#c44040' }}
      onMouseLeave={e => { e.currentTarget.style.color = '#3a4a30' }}
    >
      삭제
    </button>
  )
}
