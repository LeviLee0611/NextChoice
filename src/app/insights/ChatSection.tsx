'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Message = { role: 'user' | 'assistant'; content: string }

type Draft = {
  title: string
  category: string
  option_a: string
  option_b: string
  option_c: string | null
  context: string
  importance_level: number
}

function renderContent(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} style={{ color: '#d4a84b', fontWeight: 600 }}>{part}</span>
      : part
  )
}

function parseDraft(text: string): Draft | null {
  try {
    const match = text.match(/\{[\s\S]*"draft"\s*:\s*true[\s\S]*\}/)
    if (!match) return null
    const json = JSON.parse(match[0])
    if (!json.draft || !json.title || !json.option_a || !json.option_b) return null
    return json as Draft
  } catch {
    return null
  }
}

function DraftCard({ draft, onConfirm, onCancel }: { draft: Draft; onConfirm: () => void; onCancel: () => void }) {
  const impLabels: Record<number, string> = { 1: '낮음', 2: '보통', 3: '중간', 4: '높음', 5: '매우 높음' }
  return (
    <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'rgba(184,137,42,0.06)', border: '1px solid rgba(184,137,42,0.3)' }}>
      <div className="flex items-center gap-2">
        <span style={{ color: '#d4a84b', fontSize: '0.75rem' }}>✦</span>
        <p className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: '#d4a84b' }}>결정 초안</p>
      </div>
      <div className="flex flex-col gap-2.5">
        <p className="text-sm font-medium leading-snug" style={{ color: '#e8dfc8' }}>{draft.title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: 'rgba(138,173,122,0.1)', color: '#8aad7a', border: '1px solid rgba(138,173,122,0.2)' }}>{draft.category}</span>
          <span className="text-[10px]" style={{ color: '#8a9a78' }}>중요도: {impLabels[draft.importance_level] ?? '중간'}</span>
        </div>
        {draft.context && (
          <p className="text-xs leading-relaxed" style={{ color: '#9aaa8a' }}>{draft.context}</p>
        )}
        <div className="flex flex-col gap-1.5 pt-1">
          {[{ label: 'A', text: draft.option_a }, { label: 'B', text: draft.option_b }, ...(draft.option_c ? [{ label: 'C', text: draft.option_c }] : [])].map(o => (
            <div key={o.label} className="flex items-start gap-2.5">
              <span className="text-[10px] font-semibold w-4 shrink-0 mt-0.5" style={{ color: '#b8892a' }}>{o.label}</span>
              <span className="text-xs leading-relaxed" style={{ color: '#d8e8c8' }}>{o.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-200" style={{ background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 100%)', color: '#0d1008' }}>
          결정 생성하기
        </button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-xl text-xs font-semibold tracking-[0.15em] uppercase transition-colors" style={{ border: '1px solid rgba(184,137,42,0.2)', color: '#9aaa8a' }}>
          취소
        </button>
      </div>
    </div>
  )
}

export default function ChatSection({ sessionId }: { sessionId: string | null }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeSessionRef = useRef<string | null>(sessionId)
  const router = useRouter()

  useEffect(() => {
    function handleNewChat() {
      setMessages([])
      setDraft(null)
      activeSessionRef.current = null
    }
    window.addEventListener('new-chat', handleNewChat)
    return () => window.removeEventListener('new-chat', handleNewChat)
  }, [])

  useEffect(() => {
    if (!sessionId) {
      setMessages([])
      setDraft(null)
      activeSessionRef.current = null
      return
    }
    if (sessionId === activeSessionRef.current) return
    setDraft(null)
    activeSessionRef.current = sessionId
    setLoading(true)
    fetch(`/api/chat/messages?session_id=${sessionId}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { role: string; content: string }[]) => {
        setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })))
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming, draft])

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text || streaming) return

    let sid = activeSessionRef.current
    if (!sid) {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text.slice(0, 60) }),
      })
      if (res.ok) {
        const { id } = await res.json()
        sid = id
        activeSessionRef.current = id
        router.replace(`/insights?tab=chat&session=${id}`)
      }
    }

    setDraft(null)
    const userMsg: Message = { role: 'user', content: text }
    const next: Message[] = [...messages, userMsg]
    setMessages(next)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setStreaming(true)

    try {
      const res = await fetch('/api/insights/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, message: text }),
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

      const parsed = parseDraft(assistantText)
      const savedAssistantContent = parsed ? '결정 초안을 만들었어요. 확인해보세요!' : assistantText

      if (sid) {
        fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sid,
            messages: [userMsg, { role: 'assistant', content: savedAssistantContent }],
          }),
        }).then(() => {
          window.dispatchEvent(new CustomEvent('sessions-changed'))
        }).catch(() => {})
      }

      if (parsed) {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: '결정 초안을 만들었어요. 확인해보세요!' }
          return updated
        })
        setDraft(parsed)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '오류가 발생했어요. 다시 시도해주세요.' }])
    } finally {
      setStreaming(false)
    }
  }

  function confirmDraft() {
    if (!draft) return
    const params = new URLSearchParams({
      title: draft.title,
      category: draft.category,
      option_a: draft.option_a,
      option_b: draft.option_b,
      importance_level: String(draft.importance_level),
    })
    if (draft.option_c) params.set('option_c', draft.option_c)
    if (draft.context) params.set('reason', draft.context)
    if (activeSessionRef.current) params.set('chat_session_id', activeSessionRef.current)
    router.push(`/decisions/new?${params}`)
  }

  const lastMsg = messages.at(-1)
  const showRecordBtn = !streaming && !draft && lastMsg?.role === 'assistant'

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: '#6a7a60' }}>대화 불러오는 중…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Messages area ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <p style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '2.5rem',
                fontWeight: 300,
                color: '#d4a84b',
                lineHeight: 1,
                marginBottom: '1rem',
              }}>✦</p>
              <p className="text-base font-medium mb-2" style={{ color: '#e8dfc8' }}>결정 코치</p>
              <p className="text-sm leading-relaxed" style={{ color: '#8a9a78' }}>
                지금 어떤 결정 앞에 서 있나요?<br />
                상황을 이야기해주시면 같이 생각해드릴게요.
              </p>
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex flex-col gap-4 px-6 py-6 max-w-3xl mx-auto w-full">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[80%] whitespace-pre-wrap"
                  style={m.role === 'user'
                    ? {
                        background: 'rgba(184,137,42,0.12)',
                        border: '1px solid rgba(184,137,42,0.25)',
                        color: '#f0e8d0',
                      }
                    : {
                        background: 'rgba(18,24,14,0.8)',
                        border: '1px solid rgba(184,137,42,0.1)',
                        color: '#e8dfc8',
                        backdropFilter: 'blur(10px)',
                      }
                  }
                >
                  {renderContent(m.content)}
                  {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                    <span style={{ display: 'inline-block', width: '2px', height: '12px', background: '#d4a84b', marginLeft: '2px', verticalAlign: 'text-bottom', opacity: 0.8 }} />
                  )}
                </div>
              </div>
            ))}

            {showRecordBtn && (
              <div className="flex justify-start">
                <button
                  onClick={() => send('네')}
                  className="text-xs font-semibold tracking-[0.15em] uppercase px-5 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 100%)',
                    color: '#0d1008',
                  }}
                >
                  ✦ 계획 만들기
                </button>
              </div>
            )}

            {draft && !streaming && (
              <DraftCard draft={draft} onConfirm={confirmDraft} onCancel={() => setDraft(null)} />
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ─────────────────────────────────────── */}
      <div className="shrink-0 px-6 pb-6 pt-3">
        <div className="max-w-3xl mx-auto">
          <div
            className="relative rounded-2xl transition-all duration-200"
            style={{
              background: 'rgba(18,24,14,0.7)',
              border: '1px solid rgba(184,137,42,0.15)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="어떤 결정을 앞두고 있나요?"
              disabled={streaming}
              rows={1}
              className="w-full px-5 pt-4 text-sm outline-none resize-none disabled:opacity-40"
              style={{
                background: 'transparent',
                color: '#e8dfc8',
                lineHeight: '1.7',
                caretColor: '#d4a84b',
                paddingBottom: '3rem',
                minHeight: '60px',
                maxHeight: '200px',
              }}
              onFocus={e => {
                const wrap = e.currentTarget.parentElement
                if (wrap) wrap.style.borderColor = 'rgba(184,137,42,0.4)'
              }}
              onBlur={e => {
                const wrap = e.currentTarget.parentElement
                if (wrap) wrap.style.borderColor = 'rgba(184,137,42,0.15)'
              }}
            />

            {/* Bottom bar inside textarea box */}
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 pb-3">
              <p className="text-[10px]" style={{ color: '#4a5a3a' }}>
                Shift + Enter 줄바꿈
              </p>
              <button
                onClick={() => send()}
                disabled={streaming || !input.trim()}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-25"
                style={{
                  background: input.trim() && !streaming
                    ? 'linear-gradient(135deg, #b8892a 0%, #d4a84b 100%)'
                    : 'rgba(184,137,42,0.1)',
                  color: input.trim() && !streaming ? '#0d1008' : '#6a7a60',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
