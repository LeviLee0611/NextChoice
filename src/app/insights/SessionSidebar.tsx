'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Session = { id: string; created_at: string; updated_at: string; title: string | null }

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function PanelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
      <rect x="1.75" y="1.75" width="14.5" height="14.5" rx="2.75" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="6.5" y1="1.75" x2="6.5" y2="16.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function SessionSidebar({
  sessionId,
  onToggle,
}: {
  sessionId: string | null
  onToggle: () => void
}) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [menuId, setMenuId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function fetchSessions() {
    fetch('/api/chat/sessions')
      .then(r => r.ok ? r.json() : [])
      .then(setSessions)
      .catch(() => {})
  }

  useEffect(() => { fetchSessions() }, [sessionId])

  useEffect(() => {
    window.addEventListener('sessions-changed', fetchSessions)
    return () => window.removeEventListener('sessions-changed', fetchSessions)
  }, [])

  useEffect(() => {
    if (!menuId) return
    function close(e: MouseEvent) {
      if (!(e.target as Element).closest('[data-session-menu]')) setMenuId(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuId])

  useEffect(() => {
    if (renamingId) renameRef.current?.focus()
  }, [renamingId])

  function startRename(s: Session) {
    setMenuId(null)
    setRenameValue(s.title || formatDate(s.updated_at))
    setRenamingId(s.id)
  }

  async function saveRename(id: string) {
    const title = renameValue.trim()
    setRenamingId(null)
    if (!title) return
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s))
    await fetch('/api/chat/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title }),
    })
  }

  async function deleteSession(id: string) {
    setMenuId(null)
    setSessions(prev => prev.filter(s => s.id !== id))
    await fetch('/api/chat/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (sessionId === id) router.push('/insights?tab=chat')
  }

  return (
    <div
      className="flex flex-col w-full h-full"
      style={{
        borderRight: '1px solid rgba(184,137,42,0.1)',
        background: 'rgba(13,16,11,0.85)',
      }}
    >
      {/* Header: new chat + toggle (toggle on the right) */}
      <div className="px-2 pt-3 pb-2 flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('new-chat'))
            router.push('/insights?tab=chat')
          }}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold tracking-[0.12em] uppercase px-3 py-2 rounded-lg transition-all duration-150"
          style={{
            background: 'rgba(184,137,42,0.08)',
            border: '1px solid rgba(184,137,42,0.2)',
            color: '#d4a84b',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,137,42,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,137,42,0.08)' }}
        >
          <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>+</span>
          새 대화
        </button>

        {/* Toggle — right side, attached to sidebar edge */}
        <button
          onClick={onToggle}
          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-all duration-150"
          style={{ color: '#6a7a60' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(184,137,42,0.1)'
            e.currentTarget.style.color = '#d4a84b'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#6a7a60'
          }}
          title="사이드바 접기"
        >
          <PanelIcon />
        </button>
      </div>

      <div className="mx-3 mb-1.5 h-px shrink-0" style={{ background: 'rgba(184,137,42,0.07)' }} />

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {sessions.length === 0 && (
          <p className="text-[10px] px-2 py-3 text-center" style={{ color: '#5a6a50' }}>대화 없음</p>
        )}

        {sessions.map(s => {
          const isActive = s.id === sessionId
          const label = s.title || formatDate(s.updated_at)

          return (
            <div key={s.id} className="relative group flex items-center rounded-lg" data-session-menu>

              {renamingId === s.id ? (
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => saveRename(s.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveRename(s.id)
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                  className="w-full text-xs px-2 py-1.5 rounded-lg outline-none mx-1"
                  style={{
                    background: 'rgba(8,12,7,0.8)',
                    border: '1px solid rgba(184,137,42,0.4)',
                    color: '#e8dfc8',
                  }}
                />
              ) : (
                <Link
                  href={`/insights?tab=chat&session=${s.id}`}
                  className="flex-1 text-sm px-3 py-2 rounded-lg transition-colors truncate min-w-0 pr-7"
                  style={{
                    background: isActive ? 'rgba(184,137,42,0.1)' : 'transparent',
                    color: isActive ? '#d4a84b' : '#9aaa8a',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#c8d8b0' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#9aaa8a' }}
                >
                  {label}
                </Link>
              )}

              {renamingId !== s.id && (
                <button
                  onClick={e => { e.preventDefault(); setMenuId(menuId === s.id ? null : s.id) }}
                  className="absolute right-1 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded transition-opacity"
                  style={{ color: '#6a7a60' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#d4a84b' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6a7a60' }}
                >
                  <span style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>···</span>
                </button>
              )}

              {menuId === s.id && (
                <div
                  className="absolute left-0 top-full z-50 flex flex-col rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(13,18,11,0.97)',
                    border: '1px solid rgba(184,137,42,0.2)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    minWidth: '140px',
                  }}
                >
                  <button
                    onClick={() => startRename(s)}
                    className="text-xs px-3 py-2.5 text-left transition-colors"
                    style={{ color: '#9aaa8a' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,137,42,0.06)'; e.currentTarget.style.color = '#d4a84b' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9aaa8a' }}
                  >
                    이름 바꾸기
                  </button>
                  <button
                    onClick={() => deleteSession(s.id)}
                    className="text-xs px-3 py-2.5 text-left transition-colors"
                    style={{ color: '#e05a5a' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,64,64,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    삭제하기
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
