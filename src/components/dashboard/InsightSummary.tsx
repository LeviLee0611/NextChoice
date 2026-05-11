'use client'

import { useState } from 'react'

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

export default function InsightSummary({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const { summary, bullets } = parseInsight(content)

  return (
    <div className="flex flex-col gap-3">
      {summary && (
        <p className="text-sm font-medium leading-relaxed" style={{ color: '#d4c9a8' }}>
          {summary}
        </p>
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
            style={{ color: '#5a6a50' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#8aad7a' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#5a6a50' }}
          >
            {expanded ? '접기 ▴' : '펼치기 ▾'}
          </button>
        </>
      )}
    </div>
  )
}
