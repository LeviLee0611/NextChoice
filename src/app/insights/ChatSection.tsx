'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Message = { role: 'user' | 'assistant'; content: string }

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function send() {
    const text = input.trim()
    if (!text || streaming) return

    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setStreaming(true)

    try {
      const res = await fetch('/api/insights/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      if (!res.ok || !res.body) {
        setMessages(prev => [...prev, { role: 'assistant', content: '응답을 받지 못했어요. 다시 시도해주세요.' }])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantText }
          return updated
        })
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '오류가 발생했어요. 다시 시도해주세요.' }])
    } finally {
      setStreaming(false)
    }
  }

  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === 'assistant'

  return (
    <div className="flex flex-col gap-4">

      {/* Conversation */}
      {messages.length === 0 ? (
        <div className="rounded-xl border px-5 py-8 text-center" style={{ background: '#0f1a0d', borderColor: '#2d3e28' }}>
          <p className="text-2xl mb-3">✦</p>
          <p className="text-sm mb-1" style={{ color: '#d4c9a8' }}>결정 코치</p>
          <p className="text-xs leading-relaxed" style={{ color: '#5a6a50' }}>
            고민 중인 결정을 알려주세요.<br />과거 패턴을 바탕으로 도움을 드릴게요.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#0f1a0d', borderColor: '#2d3e28' }}>
          <div className="flex flex-col gap-0 max-h-[480px] overflow-y-auto p-4 gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="rounded-xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap"
                  style={m.role === 'user'
                    ? { background: 'rgba(184,137,42,0.12)', border: '1px solid #6a5020', color: '#e8dfc8' }
                    : { background: '#141c12', border: '1px solid #2d3e28', color: '#c8d8b8' }
                  }
                >
                  {m.content}
                  {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                    <span style={{ display: 'inline-block', width: '2px', height: '12px', background: '#d4a84b', marginLeft: '2px', verticalAlign: 'text-bottom', opacity: 0.8 }} />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* CTA after assistant response */}
      {lastIsAssistant && !streaming && (
        <div className="flex justify-end">
          <Link
            href="/decisions/new"
            className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors"
            style={{ background: '#141c12', border: '1px solid #6a4e1a', color: '#d4a84b' }}
          >
            이 결정 기록하기 →
          </Link>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="어떤 결정을 고민 중이에요?"
          disabled={streaming}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-40"
          style={{ background: '#141c12', border: '1px solid #2d3e28', color: '#e8dfc8' }}
          onFocus={e => e.currentTarget.style.borderColor = '#b8892a'}
          onBlur={e => e.currentTarget.style.borderColor = '#2d3e28'}
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold tracking-widest uppercase transition-colors disabled:opacity-30"
          style={{ background: '#141c12', border: '1px solid #6a4e1a', color: '#d4a84b' }}
        >
          전송
        </button>
      </div>

    </div>
  )
}
