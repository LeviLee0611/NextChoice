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
    <div className="rounded-xl border p-5 flex flex-col gap-4" style={{ background: '#0d1a0b', borderColor: '#b8892a' }}>
      <div className="flex items-center gap-2">
        <span style={{ color: '#d4a84b', fontSize: '0.75rem' }}>✦</span>
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#d4a84b' }}>결정 초안</p>
      </div>
      <div className="flex flex-col gap-2.5">
        <p className="text-sm font-medium leading-snug" style={{ color: '#e8dfc8' }}>{draft.title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: '#1a2818', color: '#8aad7a', border: '1px solid #2d4028' }}>{draft.category}</span>
          <span className="text-[10px]" style={{ color: '#5a6a50' }}>중요도: {impLabels[draft.importance_level] ?? '중간'}</span>
        </div>
        {draft.context && (
          <p className="text-xs leading-relaxed" style={{ color: '#8a9a78' }}>{draft.context}</p>
        )}
        <div className="flex flex-col gap-1.5 pt-1">
          {[{ label: 'A', text: draft.option_a }, { label: 'B', text: draft.option_b }, ...(draft.option_c ? [{ label: 'C', text: draft.option_c }] : [])].map(o => (
            <div key={o.label} className="flex items-start gap-2.5">
              <span className="text-[10px] font-semibold w-4 shrink-0 mt-0.5" style={{ color: '#b8892a' }}>{o.label}</span>
              <span className="text-xs leading-relaxed" style={{ color: '#c8d8b0' }}>{o.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-widest uppercase transition-colors" style={{ background: 'rgba(184,137,42,0.12)', border: '1px solid #b8892a', color: '#d4a84b' }}>
          결정 생성하기
        </button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-xl text-xs font-semibold tracking-widest uppercase transition-colors" style={{ border: '1px solid #2d3e28', color: '#5a6a50' }}>
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
  // Track active session via ref (avoids state→prop anti-pattern and useEffect re-trigger)
  const activeSessionRef = useRef<string | null>(sessionId)
  // Track session we just created so useEffect skips reloading it
  const justCreatedRef = useRef<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setDraft(null)

    if (!sessionId) {
      setMessages([])
      activeSessionRef.current = null
      return
    }

    // Skip reload for sessions we just created — messages are already in state
    if (sessionId === justCreatedRef.current) {
      justCreatedRef.current = null
      activeSessionRef.current = sessionId
      return
    }

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
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text || streaming) return

    // Create session on first message if none exists
    let sid = activeSessionRef.current
    if (!sid) {
      const res = await fetch('/api/chat/sessions', { method: 'POST' })
      if (res.ok) {
        const { id } = await res.json()
        sid = id
        activeSessionRef.current = id
        justCreatedRef.current = id
        router.replace(`/insights?tab=chat&session=${id}`)
      }
    }

    setDraft(null)
    const userMsg: Message = { role: 'user', content: text }
    const next: Message[] = [...messages, userMsg]
    setMessages(next)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
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

      const parsed = parseDraft(assistantText)
      // Save display message (not raw JSON) so reloading the session shows clean text
      const savedAssistantContent = parsed ? '결정 초안을 만들었어요. 확인해보세요!' : assistantText

      if (sid) {
        fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sid,
            messages: [userMsg, { role: 'assistant', content: savedAssistantContent }],
          }),
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
      <div className="flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: '#5a6a50' }}>대화 불러오는 중…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">

      {messages.length === 0 && (
        <div className="rounded-xl border px-6 py-10 text-center" style={{ background: '#1a2416', borderColor: '#3d5235' }}>
          <p className="text-2xl mb-3">✦</p>
          <p className="text-sm font-medium mb-2" style={{ color: '#d4c9a8' }}>결정 코치</p>
          <p className="text-sm leading-relaxed" style={{ color: '#8a9a78' }}>
            지금 어떤 결정 앞에 서 있나요?<br />
            상황을 이야기해주시면 같이 생각해드릴게요.<br />
            원하시면 결정 초안도 바로 만들어드려요.
          </p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="rounded-xl px-4 py-3 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap"
                style={m.role === 'user'
                  ? { background: 'rgba(184,137,42,0.20)', border: '1px solid #8a6828', color: '#f0e8d0' }
                  : { background: '#1a2416', border: '1px solid #3a4a30', color: '#d0e0c0' }
                }
              >
                {renderContent(m.content)}
                {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                  <span style={{ display: 'inline-block', width: '2px', height: '12px', background: '#d4a84b', marginLeft: '2px', verticalAlign: 'text-bottom', opacity: 0.8 }} />
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {showRecordBtn && (
        <div className="flex justify-start">
          <button
            onClick={() => send('네')}
            className="text-xs font-semibold tracking-widest uppercase px-5 py-2.5 rounded-xl transition-colors"
            style={{ background: '#b8892a', border: '1px solid #d4a84b', color: '#0d1a0b' }}
          >
            ✦ 계획 만들기
          </button>
        </div>
      )}

      {draft && !streaming && (
        <DraftCard draft={draft} onConfirm={confirmDraft} onCancel={() => setDraft(null)} />
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="어떤 결정을 앞두고 있나요? (Shift + Enter 로 줄바꿈)"
          disabled={streaming}
          rows={1}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-40 resize-none overflow-hidden"
          style={{ background: '#1a2416', border: '1px solid #3a4a30', color: '#e8dfc8', lineHeight: '1.6' }}
          onFocus={e => e.currentTarget.style.borderColor = '#b8892a'}
          onBlur={e => e.currentTarget.style.borderColor = '#3a4a30'}
        />
        <button
          onClick={() => send()}
          disabled={streaming || !input.trim()}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold tracking-widest uppercase transition-colors disabled:opacity-30 shrink-0"
          style={{ background: '#1a2416', border: '1px solid #8a6828', color: '#d4a84b' }}
        >
          전송
        </button>
      </div>

    </div>
  )
}
