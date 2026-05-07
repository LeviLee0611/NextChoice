'use client'

import { useState } from 'react'
import { updateDecision } from '../../actions'
import { IMPORTANCE_LABELS, CATEGORIES, type ImportanceLevel, type Category, type Decision } from '@/types/decision'

const IMPORTANCE_COLORS: Record<ImportanceLevel, { border: string; bg: string; text: string; glow: string }> = {
  1: { border: '#3d5235', bg: 'rgba(61,82,53,0.25)',  text: '#8aad7a', glow: 'rgba(61,82,53,0.3)' },
  2: { border: '#2d4a3e', bg: 'rgba(45,74,62,0.25)',  text: '#5a9078', glow: 'rgba(45,74,62,0.3)' },
  3: { border: '#6a4e1a', bg: 'rgba(106,78,26,0.25)', text: '#c4903e', glow: 'rgba(106,78,26,0.35)' },
  4: { border: '#6a3518', bg: 'rgba(106,53,24,0.25)', text: '#c47040', glow: 'rgba(106,53,24,0.35)' },
  5: { border: '#6a1a1a', bg: 'rgba(106,26,26,0.3)',  text: '#c44040', glow: 'rgba(106,26,26,0.4)' },
}

const inputStyle = {
  background: '#141c12',
  border: '1px solid #2d3e28',
  color: '#e8dfc8',
}

function Label({ children, color = '#d4c9a8' }: { children: React.ReactNode; color?: string }) {
  return (
    <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color }}>
      {children}
    </label>
  )
}

function TextInput({ name, required, placeholder, type = 'text', defaultValue }: {
  name: string; required?: boolean; placeholder?: string; type?: string; defaultValue?: string
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
      style={{ ...inputStyle, caretColor: '#d4a84b' }}
      onFocus={e => { e.currentTarget.style.borderColor = '#b8892a' }}
      onBlur={e => { e.currentTarget.style.borderColor = '#2d3e28' }}
    />
  )
}

export default function EditDecisionForm({ decision }: { decision: Decision }) {
  const [importance, setImportance] = useState<ImportanceLevel>(decision.importance_level)
  const [confidence, setConfidence] = useState(decision.confidence)
  const action = updateDecision.bind(null, decision.id)

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: '#8a9478' }}>
            Edit Decision
          </p>
          <h1 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-cinzel)', color: '#d4a84b', letterSpacing: '0.08em' }}>
            기록을 고치다
          </h1>
          <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(to right, transparent, #b8892a, #6b8f5e, transparent)' }} />
        </div>

        <form
          action={action}
          className="rounded-2xl p-8 space-y-7 border"
          style={{
            background: 'linear-gradient(to right, #1a2016, #0a0e08)',
            borderColor: '#2d3e28',
            boxShadow: '0 0 60px rgba(184,137,42,0.08)',
          }}
        >
          {/* 제목 */}
          <div>
            <Label>어떤 결정인가요</Label>
            <TextInput name="title" required defaultValue={decision.title} />
          </div>

          {/* 카테고리 */}
          <div>
            <Label color="#8aad7a">카테고리</Label>
            <select
              name="category"
              required
              defaultValue={decision.category}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = '#6b8f5e' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#2d3e28' }}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 중요도 */}
          <div>
            <Label color="#c47a4a">이 결정, 얼마나 무거운가요</Label>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as ImportanceLevel[]).map(level => {
                const { emoji, label, desc } = IMPORTANCE_LABELS[level]
                const col = IMPORTANCE_COLORS[level]
                const selected = importance === level
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setImportance(level)}
                    className="flex flex-col items-center p-3 rounded-xl border text-center transition-all"
                    style={{
                      background: selected ? col.bg : '#141c12',
                      borderColor: selected ? col.border : '#2d3e28',
                      boxShadow: selected ? `0 0 18px ${col.glow}` : 'none',
                    }}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-[11px] font-semibold mt-1" style={{ color: selected ? col.text : '#5a6a50' }}>
                      {label}
                    </span>
                    <span className="text-[9px] mt-0.5 leading-tight" style={{ color: selected ? col.text : '#3a4a30', opacity: selected ? 0.85 : 1 }}>
                      {desc}
                    </span>
                  </button>
                )
              })}
            </div>
            <input type="hidden" name="importance_level" value={importance} />
          </div>

          {/* 선택지 A / B */}
          <div>
            <Label color="#7a9a8a">선택지</Label>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <TextInput name="option_a" required defaultValue={decision.option_a} placeholder="A" />
              <span className="text-sm font-medium" style={{ color: '#2d3e28' }}>vs</span>
              <TextInput name="option_b" required defaultValue={decision.option_b} placeholder="B" />
            </div>
          </div>

          {/* 내 선택 */}
          <div>
            <Label>나의 선택</Label>
            <div className="flex gap-3">
              {(['A', 'B'] as const).map(opt => (
                <label
                  key={opt}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 cursor-pointer transition-colors text-sm font-medium"
                  style={{ background: '#141c12', borderColor: '#2d3e28', color: '#d4c9a8' }}
                >
                  <input
                    type="radio"
                    name="chosen_option"
                    value={opt}
                    required
                    defaultChecked={decision.chosen_option === opt}
                    className="accent-[#b8892a]"
                  />
                  선택지 {opt}
                </label>
              ))}
            </div>
          </div>

          {/* 이유 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label color="#8aad7a">
                선택 이유{' '}
                <span className="normal-case tracking-normal font-normal" style={{ color: '#5a6a50' }}>(선택)</span>
              </Label>
              <textarea
                name="reason"
                rows={3}
                defaultValue={decision.reason ?? ''}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors"
                style={{ ...inputStyle, caretColor: '#d4a84b' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#6b8f5e' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#2d3e28' }}
              />
            </div>
            <div>
              <Label color="#c47a4a">
                선택 안 한 이유{' '}
                <span className="normal-case tracking-normal font-normal" style={{ color: '#5a6a50' }}>(선택)</span>
              </Label>
              <textarea
                name="reason_not_chosen"
                rows={3}
                defaultValue={decision.reason_not_chosen ?? ''}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors"
                style={{ ...inputStyle, caretColor: '#d4a84b' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#b8892a' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#2d3e28' }}
              />
            </div>
          </div>

          {/* 확신도 */}
          <div>
            <Label color="#c4903e">
              확신도{' '}
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', color: '#d4a84b' }}>
                {confidence}
              </span>
              <span className="normal-case tracking-normal font-normal" style={{ color: '#5a6a50' }}> / 10</span>
            </Label>
            <input
              type="range"
              name="confidence"
              min={1}
              max={10}
              value={confidence}
              onChange={e => setConfidence(Number(e.target.value))}
              className="w-full accent-[#b8892a]"
            />
            <div className="flex justify-between text-[11px] mt-1.5" style={{ color: '#5a6a50' }}>
              <span>반신반의</span>
              <span>완전한 확신</span>
            </div>
          </div>

          {/* 리뷰 날짜 */}
          <div>
            <Label color="#7a9a8a">
              결과를 돌아볼 날{' '}
              <span className="normal-case tracking-normal font-normal" style={{ color: '#5a6a50' }}>(선택)</span>
            </Label>
            <TextInput name="review_date" type="date" defaultValue={decision.review_date ?? ''} />
          </div>

          <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #2d3e28, transparent)' }} />

          <button
            type="submit"
            className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-[0.15em] uppercase transition-colors"
            style={{
              background: '#141c12',
              border: '1px solid #6a4e1a',
              color: '#d4a84b',
              fontFamily: 'var(--font-cinzel)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#b8892a'
              ;(e.currentTarget as HTMLButtonElement).style.background = '#1a2416'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#6a4e1a'
              ;(e.currentTarget as HTMLButtonElement).style.background = '#141c12'
            }}
          >
            수정을 저장하다
          </button>
        </form>
      </div>
    </div>
  )
}
