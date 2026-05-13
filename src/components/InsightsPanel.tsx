'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'insufficient' | 'error'

function parseInsight(content: string) {
  const lines = content
    .split('\n')
    .map(l => l.trim().replace(/\*\*/g, '').replace(/^#+\s*/, ''))
    .filter(Boolean)
    .filter(l => !/당신의\s*의사결정\s*인사이트/i.test(l))
  const summary = lines.find(l => !/^[-•*▸]|^\d+\./.test(l)) ?? null
  const bullets = lines
    .filter(l => /^[-•*▸]|^\d+\./.test(l))
    .map(l => l.replace(/^[-•*▸]\s*|\d+\.\s*/, ''))
  return { summary, bullets }
}

function InsightCollapsible({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const { summary, bullets } = parseInsight(text)

  return (
    <div className="flex flex-col gap-3">
      {summary && (
        <p className="text-sm font-medium leading-relaxed" style={{ color: '#d4c9a8' }}>{summary}</p>
      )}
      {bullets.length > 0 && (
        <>
          {expanded && (
            <ul className="flex flex-col gap-2 pt-1" style={{ borderTop: '1px solid #1e2a1a' }}>
              {bullets.map((text, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-[7px] w-1 h-1 rounded-full shrink-0" style={{ background: '#b8892a' }} />
                  <span className="text-xs leading-relaxed" style={{ color: '#a8b898' }}>{text}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="self-start text-[10px] font-medium tracking-widest uppercase flex items-center gap-1 transition-colors"
            style={{ color: '#8a9a78' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#8aad7a' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8a9a78' }}
          >
            {expanded ? '접기 ▴' : '펼치기 ▾'}
          </button>
        </>
      )}
    </div>
  )
}

export default function InsightsPanel({ compact = false, period = 'all' }: { compact?: boolean; period?: string }) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    if (compact) fetchInsights()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact, period])

  async function fetchInsights() {
    setStatus('loading')
    setText('')
    try {
      const res = await fetch(`/api/insights?period=${period}`)
      if (!res.ok) { setStatus('error'); return }

      const contentType = res.headers.get('content-type') ?? ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        setStatus(data.insufficient ? 'insufficient' : 'error')
        return
      }

      setStatus('streaming')
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setText(prev => prev + decoder.decode(value, { stream: true }))
      }
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  // compact: 부모 SectionCard 안에서 콘텐츠만 렌더
  if (compact) {
    return (
      <div>
        {(status === 'loading' || status === 'streaming') && (
          <p className="text-xs" style={{ color: '#8a9a78' }}>분석 중…</p>
        )}
        {status === 'done' && text.length > 0 && (
          <InsightCollapsible text={text} />
        )}
        {status === 'insufficient' && (
          <p className="text-xs" style={{ color: '#9aaa88' }}>
            이 기간에 <span style={{ color: '#d4a84b' }}>리뷰 완료된 결정이 3개 이상</span> 필요해요.
          </p>
        )}
        {status === 'error' && (
          <p className="text-xs" style={{ color: '#8a9a78' }}>인사이트를 불러올 수 없어요</p>
        )}
      </div>
    )
  }

  // 전체 패널 (insights 페이지용)
  return (
    <div className="rounded-xl border p-5" style={{ background: '#0f1a0d', borderColor: '#2d3e28' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span style={{ color: '#d4a84b', fontSize: '0.7rem' }}>✦</span>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#9aaa88' }}>AI 인사이트</p>
        </div>
        <div className="flex items-center gap-2">
          {(status === 'idle' || status === 'error' || status === 'done') && (
            <button
              onClick={fetchInsights}
              className="text-[10px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-lg transition-colors"
              style={{ color: '#9aaa88', border: '1px solid #2d3e28' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6a5020'; e.currentTarget.style.color = '#d4a84b' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2d3e28'; e.currentTarget.style.color = '#9aaa88' }}
            >
              {status === 'done' ? '새로고침' : '분석하기'}
            </button>
          )}
          {(status === 'loading' || status === 'streaming') && (
            <span className="text-[10px]" style={{ color: '#8a9a78' }}>분석 중…</span>
          )}
        </div>
      </div>

      {status === 'idle' && (
        <p className="text-xs" style={{ color: '#8a9a78' }}>리뷰가 쌓이면 내 결정 패턴을 분석해드려요</p>
      )}
      {status === 'insufficient' && (
        <div>
          <p className="text-xs mb-3" style={{ color: '#9aaa88' }}>
            인사이트를 보려면 <span style={{ color: '#d4a84b' }}>리뷰 완료된 결정이 3개 이상</span> 필요해요.
          </p>
          <Link href="/decisions" className="text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-lg inline-block" style={{ border: '1px solid #2d3e28', color: '#9aaa88' }}>
            결정 목록 보기 →
          </Link>
        </div>
      )}
      {status === 'loading' && (
        <p className="text-xs" style={{ color: '#8a9a78' }}>데이터를 불러오는 중…</p>
      )}
      {(status === 'streaming' || status === 'done') && text.length > 0 && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#c8d8b8' }}>
          {text}
          {status === 'streaming' && (
            <span style={{ display: 'inline-block', width: '2px', height: '13px', background: '#d4a84b', marginLeft: '2px', verticalAlign: 'text-bottom', opacity: 0.8 }} />
          )}
        </p>
      )}
      {status === 'error' && (
        <p className="text-xs" style={{ color: '#8a9a78' }}>인사이트를 불러올 수 없어요</p>
      )}
    </div>
  )
}
