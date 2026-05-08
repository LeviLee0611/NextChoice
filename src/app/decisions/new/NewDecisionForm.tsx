'use client'

import { useState } from 'react'
import { createDecision } from '../actions'
import { IMPORTANCE_LABELS, CATEGORIES, type ImportanceLevel, type Category } from '@/types/decision'
import DatePicker from '@/components/DatePicker'

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

// 1=violet(신비), 10=amber gold(확신) — smooth interpolation
function confidenceColor(value: number): string {
  const t = (value - 1) / 9
  const r = Math.round(112 + t * 72)  // 112 → 184
  const g = Math.round(80 + t * 57)   // 80  → 137
  const b = Math.round(176 - t * 134) // 176 → 42
  return `rgb(${r},${g},${b})`
}

function Label({ children, color = '#d4c9a8' }: { children: React.ReactNode; color?: string }) {
  return (
    <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color }}>
      {children}
    </label>
  )
}

function TextInput({ name, required, placeholder, type = 'text' }: {
  name: string; required?: boolean; placeholder?: string; type?: string
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
      style={{ ...inputStyle, caretColor: '#d4a84b' }}
      onFocus={e => { e.currentTarget.style.borderColor = '#b8892a' }}
      onBlur={e => { e.currentTarget.style.borderColor = '#2d3e28' }}
    />
  )
}

function timePressureColor(value: number): string {
  const t = (value - 1) / 2
  return `rgb(${Math.round(112 + t * 72)},${Math.round(80 + t * 57)},${Math.round(176 - t * 134)})`
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

export default function NewDecisionForm() {
  const [importance, setImportance] = useState<ImportanceLevel>(3)
  const [confidence, setConfidence] = useState(5)
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [optionCount, setOptionCount] = useState<2 | 3 | 4>(2)
  const [chosenOption, setChosenOption] = useState<string>('')

  function removeLastOption() {
    const removedLetter = OPTION_LETTERS[optionCount - 1]
    if (chosenOption === removedLetter) setChosenOption('')
    setOptionCount(prev => (prev - 1) as 2 | 3)
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: '#8a9478' }}>
            New Decision
          </p>
          <h1 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-cinzel)', color: '#d4a84b', letterSpacing: '0.08em' }}>
            결정을 기록하다
          </h1>
          <div className="w-20 h-px mx-auto mb-5" style={{ background: 'linear-gradient(to right, transparent, #b8892a, #6b8f5e, transparent)' }} />
          <p className="text-sm italic leading-relaxed" style={{ color: '#a8b898' }}>
            모든 선택은 미래의 나에게 보내는 편지입니다.<br />훗날의 내게 밑거름이 되는 지금의 현명한 결정을..
          </p>
        </div>

        {/* Form Card */}
        <form
          action={createDecision}
          className="rounded-2xl p-8 space-y-7 border"
          style={{
            background: '#0f1a0d',
            borderColor: '#2d3e28',
            boxShadow: '0 0 60px rgba(184,137,42,0.08)',
          }}
        >

          {/* 제목 */}
          <div>
            <Label>어떤 결정인가요</Label>
            <TextInput name="title" required placeholder="예: 이직 제안을 수락할까" />
          </div>

          {/* 카테고리 */}
          <div>
            <Label color="#8a9478">카테고리</Label>
            <select
              name="category"
              required
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
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
            <Label color="#8a9478">이 결정, 얼마나 무거운가요</Label>
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

          {/* 선택지 */}
          <div>
            <Label color="#8a9478">선택지</Label>
            <div className="space-y-2">
              {/* A, B — 항상 표시 */}
              {(['A', 'B'] as const).map(letter => (
                <div key={letter} className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-4 shrink-0" style={{ color: '#5a6a50' }}>{letter}</span>
                  <TextInput name={`option_${letter.toLowerCase()}`} required placeholder={letter === 'A' ? '예: 이직한다' : '예: 현직 유지'} />
                </div>
              ))}
              {/* C — 선택적 */}
              {optionCount >= 3 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-4 shrink-0" style={{ color: '#5a6a50' }}>C</span>
                  <TextInput name="option_c" placeholder="예: 6개월 후 재검토" />
                  {optionCount === 3 && (
                    <button type="button" onClick={removeLastOption} className="shrink-0 text-sm px-2 py-1 rounded-lg transition-colors" style={{ color: '#5a6a50' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#c44040' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#5a6a50' }}>×</button>
                  )}
                </div>
              )}
              {/* D — 선택적 */}
              {optionCount >= 4 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-4 shrink-0" style={{ color: '#5a6a50' }}>D</span>
                  <TextInput name="option_d" placeholder="또 다른 선택지" />
                  <button type="button" onClick={removeLastOption} className="shrink-0 text-sm px-2 py-1 rounded-lg transition-colors" style={{ color: '#5a6a50' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#c44040' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#5a6a50' }}>×</button>
                </div>
              )}
            </div>
            {optionCount < 4 && (
              <button
                type="button"
                onClick={() => setOptionCount(prev => (prev + 1) as 3 | 4)}
                className="mt-2 text-xs tracking-widest uppercase transition-colors"
                style={{ color: '#5a6a50' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#8a9478' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#5a6a50' }}
              >
                + 선택지 추가
              </button>
            )}
          </div>

          {/* 나의 선택 */}
          <div>
            <Label>나의 선택</Label>
            <div className="flex gap-3 flex-wrap">
              {OPTION_LETTERS.slice(0, optionCount).map(opt => (
                <label
                  key={opt}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 cursor-pointer transition-colors text-sm font-medium"
                  style={{
                    background: chosenOption === opt ? 'rgba(184,137,42,0.1)' : '#141c12',
                    borderColor: chosenOption === opt ? '#b8892a' : '#2d3e28',
                    color: chosenOption === opt ? '#d4a84b' : '#d4c9a8',
                  }}
                >
                  <input
                    type="radio"
                    name="chosen_option"
                    value={opt}
                    required
                    checked={chosenOption === opt}
                    onChange={() => setChosenOption(opt)}
                    className="sr-only"
                  />
                  선택지 {opt}
                </label>
              ))}
            </div>
          </div>

          {/* 이유 */}
          <div className="space-y-4">
            <div>
              <Label color="#8a9478">
                선택 이유{' '}
                <span className="normal-case tracking-normal font-normal" style={{ color: '#5a6a50' }}>(선택)</span>
              </Label>
              <textarea
                name="reason"
                rows={3}
                placeholder="왜 이 선택을 했나요?"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors"
                style={{ ...inputStyle, caretColor: '#d4a84b' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#6b8f5e' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#2d3e28' }}
              />
            </div>
            <div>
              <Label color="#8a9478">
                선택 안 한 이유{' '}
                <span className="normal-case tracking-normal font-normal" style={{ color: '#5a6a50' }}>(선택)</span>
              </Label>
              <textarea
                name="reason_not_chosen"
                rows={3}
                placeholder="왜 다른 선택을 하지 않았나요?"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors"
                style={{ ...inputStyle, caretColor: '#d4a84b' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#b8892a' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#2d3e28' }}
              />
            </div>
          </div>

          {/* 확신도 */}
          <div>
            <Label color="#8a9478">
              확신도{' '}
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', color: confidenceColor(confidence) }}>
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
              className="w-full"
              style={{
                '--progress': `${((confidence - 1) / 9) * 100}%`,
                '--fill-color': confidenceColor(confidence),
                '--thumb-color': confidenceColor(confidence),
              } as React.CSSProperties}
            />
            <div className="flex justify-between text-xs mt-1.5 font-medium">
              <span style={{ color: confidenceColor(1) }}>불확실</span>
              <span style={{ color: '#8a9478' }}>반신반의</span>
              <span style={{ color: confidenceColor(10) }}>확신</span>
            </div>
          </div>

          {/* 직감 vs 논리 */}
          <div>
            <Label color="#8a9478">
              이 선택, 어떻게 내렸나요{' '}
              <span className="normal-case tracking-normal font-normal" style={{ color: '#5a6a50' }}>(선택)</span>
            </Label>
            <input
              type="range"
              name="gut_vs_logic"
              min={1}
              max={5}
              defaultValue={3}
              className="w-full"
              style={{ '--progress': '50%', '--fill-color': '#8a9478', '--thumb-color': '#8a9478' } as React.CSSProperties}
              onChange={e => {
                const t = (Number(e.target.value) - 1) / 4
                const color = `rgb(${Math.round(112 + t * 72)},${Math.round(144 - t * 16)},${Math.round(160 - t * 118)})`
                e.currentTarget.style.setProperty('--progress', `${t * 100}%`)
                e.currentTarget.style.setProperty('--fill-color', color)
                e.currentTarget.style.setProperty('--thumb-color', color)
              }}
            />
            <div className="flex justify-between text-xs mt-1.5 font-medium">
              <span style={{ color: '#7050b0' }}>직감</span>
              <span style={{ color: '#8a9478' }}>반반</span>
              <span style={{ color: '#b8892a' }}>논리</span>
            </div>
          </div>

          {/* 시간 압박 */}
          <div>
            <Label color="#8a9478">
              결정할 시간이 얼마나 있었나요{' '}
              <span className="normal-case tracking-normal font-normal" style={{ color: '#5a6a50' }}>(선택)</span>
            </Label>
            <input
              type="range"
              name="time_pressure"
              min={1}
              max={3}
              defaultValue={1}
              className="w-full"
              style={{
                '--progress': '0%',
                '--fill-color': timePressureColor(1),
                '--thumb-color': timePressureColor(1),
              } as React.CSSProperties}
              onChange={e => {
                const v = Number(e.target.value)
                const color = timePressureColor(v)
                e.currentTarget.style.setProperty('--progress', `${((v - 1) / 2) * 100}%`)
                e.currentTarget.style.setProperty('--fill-color', color)
                e.currentTarget.style.setProperty('--thumb-color', color)
              }}
            />
            <div className="flex justify-between text-xs mt-1.5 font-medium">
              <span style={{ color: timePressureColor(1) }}>여유로움</span>
              <span style={{ color: '#8a9478' }}>적당함</span>
              <span style={{ color: timePressureColor(3) }}>빠듯함</span>
            </div>
          </div>

          {/* 리뷰 날짜 */}
          <div>
            <Label color="#8a9478">
              리뷰해야 하는 날{' '}
              <span className="normal-case tracking-normal font-normal" style={{ color: '#5a6a50' }}>(선택)</span>
            </Label>
            <DatePicker name="review_date" />
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #2d3e28, transparent)' }} />

          {/* Submit */}
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
            결정을 새기다
          </button>

        </form>
      </div>
    </div>
  )
}
