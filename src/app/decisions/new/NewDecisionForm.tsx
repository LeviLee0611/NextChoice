'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createDecision } from '../actions'
import { IMPORTANCE_LABELS, CATEGORIES, type ImportanceLevel, type Category, type PastDecisionInsight } from '@/types/decision'
import DatePicker from '@/components/DatePicker'
import CategorySelect from '@/components/CategorySelect'

const IMPORTANCE_COLORS: Record<ImportanceLevel, { border: string; bg: string; text: string; glow: string }> = {
  1: { border: 'rgba(61,82,53,0.6)',  bg: 'rgba(61,82,53,0.2)',  text: '#8aad7a', glow: 'rgba(61,82,53,0.3)' },
  2: { border: 'rgba(45,74,62,0.6)',  bg: 'rgba(45,74,62,0.2)',  text: '#5a9078', glow: 'rgba(45,74,62,0.3)' },
  3: { border: 'rgba(184,137,42,0.4)', bg: 'rgba(184,137,42,0.1)', text: '#c4903e', glow: 'rgba(184,137,42,0.25)' },
  4: { border: 'rgba(196,112,64,0.5)', bg: 'rgba(106,53,24,0.2)', text: '#c47040', glow: 'rgba(106,53,24,0.3)' },
  5: { border: 'rgba(196,64,64,0.5)',  bg: 'rgba(106,26,26,0.25)', text: '#c44040', glow: 'rgba(106,26,26,0.35)' },
}

const inputStyle = {
  background: 'rgba(8,12,7,0.8)',
  border: '1px solid rgba(184,137,42,0.12)',
  color: '#e8dfc8',
}

function confidenceColor(value: number): string {
  const t = (value - 1) / 9
  const r = Math.round(112 + t * 72)
  const g = Math.round(80 + t * 57)
  const b = Math.round(176 - t * 134)
  return `rgb(${r},${g},${b})`
}

function Label({ children, color = '#d4c9a8' }: { children: React.ReactNode; color?: string }) {
  return (
    <label className="block text-xs font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: color === '#8a9478' ? '#6a7a60' : color }}>
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
      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
      style={{ ...inputStyle, caretColor: '#d4a84b' }}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(184,137,42,0.45)' }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(184,137,42,0.12)' }}
    />
  )
}

function timePressureColor(value: number): string {
  const t = (value - 1) / 2
  return `rgb(${Math.round(112 + t * 72)},${Math.round(80 + t * 57)},${Math.round(176 - t * 134)})`
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

type InitialValues = {
  title?: string; category?: Category; option_a?: string
  option_b?: string; option_c?: string; importance_level?: 1|2|3|4|5; reason?: string; chatSessionId?: string
}

export default function NewDecisionForm({ initialValues, pastDecisions = [] }: { initialValues?: InitialValues; pastDecisions?: PastDecisionInsight[] }) {
  const [importance, setImportance] = useState<ImportanceLevel>(initialValues?.importance_level ?? 3)
  const [confidence, setConfidence] = useState(5)
  const [optionCount, setOptionCount] = useState<2 | 3 | 4>(initialValues?.option_c ? 3 : 2)
  const [chosenOption, setChosenOption] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialValues?.category ?? CATEGORIES[0])

  const categoryPast = pastDecisions.filter(d => d.category === selectedCategory).slice(0, 3)

  function removeLastOption() {
    const removedLetter = OPTION_LETTERS[optionCount - 1]
    if (chosenOption === removedLetter) setChosenOption('')
    setOptionCount(prev => (prev - 1) as 2 | 3)
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: '#d4a84b' }}>
            New Decision
          </p>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 300,
            color: '#e8dfc8',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}>
            결정을 기록하다
          </h1>
          <div className="w-20 h-px mx-auto mb-6" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.5), rgba(107,143,94,0.2), transparent)' }} />
          <p className="text-sm italic leading-relaxed" style={{ color: '#5a6a50' }}>
            모든 선택은 미래의 나에게 보내는 편지입니다.<br />훗날의 내게 밑거름이 되는 지금의 현명한 결정을..
          </p>
        </div>

        {/* Form Card */}
        <form
          action={createDecision}
          className="rounded-2xl p-8 space-y-7"
          style={{
            background: 'rgba(18,24,14,0.7)',
            border: '1px solid rgba(184,137,42,0.12)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 60px rgba(184,137,42,0.05), 0 20px 60px rgba(0,0,0,0.3)',
          }}
        >

          {/* 제목 */}
          <div>
            <Label>어떤 결정인가요</Label>
            <TextInput name="title" required placeholder="예: 이직 제안을 수락할까" defaultValue={initialValues?.title} />
          </div>

          {/* 카테고리 */}
          <div>
            <Label color="#8a9478">카테고리</Label>
            <CategorySelect defaultValue={initialValues?.category} onChange={setSelectedCategory} />
          </div>

          {/* 카테고리 인사이트 */}
          {categoryPast.length > 0 && (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(184,137,42,0.08)', background: 'rgba(8,12,7,0.4)' }}
            >
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase px-4 pt-3 pb-2" style={{ color: '#5a6a50' }}>
                {selectedCategory} 카테고리의 지난 결정들
              </p>
              {categoryPast.map((d, i) => (
                <Link
                  key={d.id}
                  href={`/decisions/${d.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[rgba(184,137,42,0.04)]"
                  style={{ borderTop: i === 0 ? '1px solid rgba(184,137,42,0.06)' : '1px solid rgba(184,137,42,0.04)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: '#c8bc98' }}>{d.title}</p>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: '#4a5a3a' }}>
                      {d.chosen_option}안 — {d.chosen_text}
                    </p>
                  </div>
                  {d.satisfaction !== null ? (
                    <span
                      className="text-xs font-semibold shrink-0"
                      style={{ color: d.satisfaction >= 7 ? '#8aad7a' : d.satisfaction >= 4 ? '#c4903e' : '#c44040' }}
                    >
                      {d.satisfaction}/10
                    </span>
                  ) : (
                    <span className="text-[10px] shrink-0" style={{ color: '#3a4a30' }}>리뷰 전</span>
                  )}
                </Link>
              ))}
            </div>
          )}

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
                    className="flex flex-col items-center p-3 rounded-xl border text-center transition-all duration-200"
                    style={{
                      background: selected ? col.bg : 'rgba(8,12,7,0.5)',
                      borderColor: selected ? col.border : 'rgba(184,137,42,0.08)',
                      boxShadow: selected ? `0 0 18px ${col.glow}` : 'none',
                    }}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-[11px] font-semibold mt-1" style={{ color: selected ? col.text : '#4a5a3a' }}>
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
              {(['A', 'B'] as const).map(letter => (
                <div key={letter} className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-4 shrink-0" style={{ color: '#4a5a3a' }}>{letter}</span>
                  <TextInput name={`option_${letter.toLowerCase()}`} required placeholder={letter === 'A' ? '예: 이직한다' : '예: 현직 유지'} defaultValue={letter === 'A' ? initialValues?.option_a : initialValues?.option_b} />
                </div>
              ))}
              {optionCount >= 3 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-4 shrink-0" style={{ color: '#4a5a3a' }}>C</span>
                  <TextInput name="option_c" placeholder="예: 6개월 후 재검토" defaultValue={initialValues?.option_c} />
                  {optionCount === 3 && (
                    <button type="button" onClick={removeLastOption} className="shrink-0 text-sm px-2 py-1 rounded-lg transition-colors" style={{ color: '#4a5a3a' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#c44040' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#4a5a3a' }}>×</button>
                  )}
                </div>
              )}
              {optionCount >= 4 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-4 shrink-0" style={{ color: '#4a5a3a' }}>D</span>
                  <TextInput name="option_d" placeholder="또 다른 선택지" />
                  <button type="button" onClick={removeLastOption} className="shrink-0 text-sm px-2 py-1 rounded-lg transition-colors" style={{ color: '#4a5a3a' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#c44040' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#4a5a3a' }}>×</button>
                </div>
              )}
            </div>
            {optionCount < 4 && (
              <button
                type="button"
                onClick={() => setOptionCount(prev => (prev + 1) as 3 | 4)}
                className="mt-2 text-xs tracking-[0.15em] uppercase transition-colors"
                style={{ color: '#6a7a60' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#d4a84b' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6a7a60' }}
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
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 cursor-pointer transition-all duration-200 text-sm font-medium"
                  style={{
                    background: chosenOption === opt ? 'rgba(184,137,42,0.1)' : 'rgba(8,12,7,0.5)',
                    borderColor: chosenOption === opt ? 'rgba(184,137,42,0.45)' : 'rgba(184,137,42,0.08)',
                    color: chosenOption === opt ? '#d4a84b' : '#6a7a60',
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
                <span className="normal-case tracking-normal font-normal" style={{ color: '#3a4a30' }}>(선택)</span>
              </Label>
              <textarea
                name="reason"
                rows={3}
                placeholder="왜 이 선택을 했나요?"
                defaultValue={initialValues?.reason}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-all duration-200"
                style={{ ...inputStyle, caretColor: '#d4a84b' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(184,137,42,0.4)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(184,137,42,0.12)' }}
              />
            </div>
            <div>
              <Label color="#8a9478">
                선택 안 한 이유{' '}
                <span className="normal-case tracking-normal font-normal" style={{ color: '#3a4a30' }}>(선택)</span>
              </Label>
              <textarea
                name="reason_not_chosen"
                rows={3}
                placeholder="왜 다른 선택을 하지 않았나요?"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-all duration-200"
                style={{ ...inputStyle, caretColor: '#d4a84b' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(184,137,42,0.4)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(184,137,42,0.12)' }}
              />
            </div>
          </div>

          {/* 확신도 */}
          <div>
            <Label color="#8a9478">
              확신도{' '}
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem', color: confidenceColor(confidence) }}>
                {confidence}
              </span>
              <span className="normal-case tracking-normal font-normal" style={{ color: '#3a4a30' }}> / 10</span>
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
              <span style={{ color: '#5a6a50' }}>반신반의</span>
              <span style={{ color: confidenceColor(10) }}>확신</span>
            </div>
          </div>

          {/* 직감 vs 논리 */}
          <div>
            <Label color="#8a9478">
              이 선택, 어떻게 내렸나요{' '}
              <span className="normal-case tracking-normal font-normal" style={{ color: '#3a4a30' }}>(선택)</span>
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
              <span style={{ color: '#5a6a50' }}>반반</span>
              <span style={{ color: '#b8892a' }}>논리</span>
            </div>
          </div>

          {/* 시간 압박 */}
          <div>
            <Label color="#8a9478">
              결정할 시간이 얼마나 있었나요{' '}
              <span className="normal-case tracking-normal font-normal" style={{ color: '#3a4a30' }}>(선택)</span>
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
              <span style={{ color: '#5a6a50' }}>적당함</span>
              <span style={{ color: timePressureColor(3) }}>빠듯함</span>
            </div>
          </div>

          {/* 리뷰 날짜 */}
          <div>
            <Label color="#8a9478">
              리뷰해야 하는 날{' '}
              <span className="normal-case tracking-normal font-normal" style={{ color: '#3a4a30' }}>(선택)</span>
            </Label>
            <DatePicker name="review_date" />
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.2), transparent)' }} />

          {initialValues?.chatSessionId && (
            <input type="hidden" name="chat_session_id" value={initialValues.chatSessionId} />
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl py-4 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 50%, #b8892a 100%)',
              backgroundSize: '200% 100%',
              color: '#0d1008',
              boxShadow: '0 0 40px rgba(184,137,42,0.3), 0 4px 20px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 60px rgba(184,137,42,0.5), 0 4px 20px rgba(0,0,0,0.4)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(184,137,42,0.3), 0 4px 20px rgba(0,0,0,0.4)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            결정을 새기다
          </button>

        </form>
      </div>
    </div>
  )
}
