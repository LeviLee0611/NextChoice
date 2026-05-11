'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Session = { id: string; created_at: string; updated_at: string }

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function SessionSidebar({ sessionId }: { sessionId: string | null }) {
  const [open, setOpen] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    fetch('/api/chat/sessions')
      .then(r => r.ok ? r.json() : [])
      .then(setSessions)
      .catch(() => {})
  }, [sessionId])

  return (
    <div
      className="fixed left-0 top-14 bottom-0 z-40 flex flex-col transition-all duration-200"
      style={{
        width: open ? '200px' : '36px',
        borderRight: '1px solid #1a2418',
        background: '#0a120a',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-center py-3 transition-colors shrink-0"
        style={{ color: '#5a6a50', borderBottom: '1px solid #1a2418' }}
        onMouseEnter={e => e.currentTarget.style.color = '#d4a84b'}
        onMouseLeave={e => e.currentTarget.style.color = '#5a6a50'}
      >
        <span style={{ fontSize: '0.6rem' }}>{open ? '◀' : '▶'}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-2 px-3 pt-4 overflow-hidden">

          <Link
            href="/insights?tab=chat"
            className="flex items-center justify-center text-[11px] font-semibold tracking-widest uppercase px-2 py-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(184,137,42,0.12)', border: '1px solid #b8892a', color: '#d4a84b' }}
          >
            + 새 대화
          </Link>

          <div className="w-full h-px mt-1" style={{ background: '#1a2418' }} />

          <div className="flex flex-col gap-0.5">
            {sessions.length === 0 && (
              <p className="text-[10px] px-1 py-2 text-center" style={{ color: '#3a4a30' }}>기록 없음</p>
            )}
            {sessions.map(s => {
              const isActive = s.id === sessionId
              return (
                <Link
                  key={s.id}
                  href={`/insights?tab=chat&session=${s.id}`}
                  className="text-[10px] px-2 py-2 rounded-lg transition-colors truncate"
                  style={{
                    background: isActive ? 'rgba(184,137,42,0.12)' : 'transparent',
                    color: isActive ? '#d4a84b' : '#6a7a60',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#a8b898' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#6a7a60' }}
                >
                  {formatDate(s.updated_at)}
                </Link>
              )
            })}
          </div>

        </div>
      )}
    </div>
  )
}
