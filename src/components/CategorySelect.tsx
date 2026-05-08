'use client'

import { useState, useRef, useEffect } from 'react'
import { CATEGORIES, type Category } from '@/types/decision'

const CATEGORY_COLORS: Record<Category, string> = {
  '커리어': '#7a9a8a',
  '관계':   '#c47a4a',
  '재정':   '#c4903e',
  '건강':   '#8aad7a',
  '생활':   '#a09060',
  '기타':   '#8a9478',
}

export default function CategorySelect({ defaultValue }: { defaultValue?: Category }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Category>(defaultValue ?? CATEGORIES[0])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full rounded-xl px-4 py-2.5 text-sm flex items-center justify-between transition-colors"
        style={{
          background: '#141c12',
          border: `1px solid ${open ? '#b8892a' : '#2d3e28'}`,
          color: '#e8dfc8',
        }}
      >
        <span className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[selected] }} />
          {selected}
        </span>
        <span style={{ color: '#5a6a50', fontSize: '0.6rem', transition: 'transform 0.15s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
          style={{
            background: '#0d1a0b',
            border: '1px solid #2d3e28',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          }}
        >
          {CATEGORIES.map((cat, i) => {
            const isSelected = selected === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => { setSelected(cat); setOpen(false) }}
                className="w-full px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors"
                style={{
                  background: isSelected ? 'rgba(184,137,42,0.1)' : 'transparent',
                  color: isSelected ? '#d4a84b' : '#a89c7a',
                  borderTop: i > 0 ? '1px solid #1a2418' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[cat] }} />
                <span>{cat}</span>
                {isSelected && <span className="ml-auto text-[10px]" style={{ color: '#b8892a' }}>✓</span>}
              </button>
            )
          })}
        </div>
      )}

      <input type="hidden" name="category" value={selected} />
    </div>
  )
}
