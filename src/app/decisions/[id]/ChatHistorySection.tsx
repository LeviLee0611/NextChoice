'use client'

import { useState } from 'react'
import Link from 'next/link'

type Message = { role: string; content: string }

export default function ChatHistorySection({
  messages,
  sessionId,
}: {
  messages: Message[]
  sessionId: string
}) {
  const [expanded, setExpanded] = useState(false)

  if (messages.length === 0) return null

  return (
    <div
      className="rounded-2xl overflow-hidden mt-6"
      style={{
        background: 'rgba(18,24,14,0.7)',
        border: '1px solid rgba(184,137,42,0.1)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 transition-colors"
        style={{ borderBottom: expanded ? '1px solid rgba(184,137,42,0.08)' : 'none' }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: '#d4a84b', fontSize: '0.7rem' }}>✦</span>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#d4a84b' }}>
            AI 코치 대화
          </p>
          <span
            className="text-[10px] px-2 py-0.5 rounded"
            style={{ background: 'rgba(184,137,42,0.08)', color: '#9aaa88' }}
          >
            {messages.length}개 메시지
          </span>
        </div>
        <span className="text-xs" style={{ color: '#6a7a58' }}>
          {expanded ? '▴ 접기' : '▾ 펼치기'}
        </span>
      </button>

      {/* Messages */}
      {expanded && (
        <div className="flex flex-col gap-3 px-6 py-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap"
                style={m.role === 'user'
                  ? {
                      background: 'rgba(184,137,42,0.1)',
                      border: '1px solid rgba(184,137,42,0.2)',
                      color: '#f0e8d0',
                    }
                  : {
                      background: 'rgba(8,12,7,0.6)',
                      border: '1px solid rgba(184,137,42,0.07)',
                      color: '#c8d8b8',
                    }
                }
              >
                {m.content}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Link
              href={`/insights?tab=chat&session=${sessionId}`}
              className="text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 rounded-lg transition-colors"
              style={{ border: '1px solid rgba(184,137,42,0.2)', color: '#9aaa88' }}
            >
              전체 대화 보기 →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
