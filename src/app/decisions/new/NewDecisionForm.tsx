'use client'

import { useState } from 'react'
import { createDecision } from '../actions'
import { IMPORTANCE_LABELS, CATEGORIES, type ImportanceLevel } from '@/types/decision'

function Input({ name, required, placeholder, type = 'text', className = '' }: {
  name: string
  required?: boolean
  placeholder?: string
  type?: string
  className?: string
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors
        bg-[#1e1340] border border-[#3d2470] text-[#e4d9c8] placeholder-[#5b4a7a]
        focus:border-[#7c3aed] ${className}`}
    />
  )
}

function Label({ children, color = '#c4b5fd' }: { children: React.ReactNode; color?: string }) {
  return (
    <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color }}>
      {children}
    </label>
  )
}

export default function NewDecisionForm() {
  const [importance, setImportance] = useState<ImportanceLevel>(3)
  const [confidence, setConfidence] = useState(5)

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: '#7c3aed' }}>
            New Decision
          </p>
          <h1 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-cinzel)', color: '#c4b5fd', letterSpacing: '0.08em' }}>
            결정을 기록하다
          </h1>
          <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(to right, transparent, #7c3aed, #c4903e, transparent)' }} />
        </div>

        {/* Form Card */}
        <form
          action={createDecision}
          className="rounded-2xl p-8 space-y-7 border"
          style={{
            background: '#160e30',
            borderColor: '#3d2470',
            boxShadow: '0 0 60px rgba(124,58,237,0.12)',
          }}
        >

          {/* 제목 */}
          <div>
            <Label>어떤 결정인가요</Label>
            <Input name="title" required placeholder="예: 이직 제안을 수락할까" />
          </div>

          {/* 카테고리 */}
          <div>
            <Label color="#9ab87d">카테고리</Label>
            <select
              name="category"
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors
                bg-[#1e1340] border border-[#3d2470] text-[#e4d9c8]
                focus:border-[#9ab87d]"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 중요도 */}
          <div>
            <Label color="#d47a8a">이 결정, 얼마나 무거운가요</Label>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as ImportanceLevel[]).map(level => {
                const { emoji, label, desc } = IMPORTANCE_LABELS[level]
                const selected = importance === level
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setImportance(level)}
                    className="flex flex-col items-center p-3 rounded-xl border text-center transition-all"
                    style={{
                      background: selected ? 'rgba(124,58,237,0.25)' : '#1e1340',
                      borderColor: selected ? '#a78bfa' : '#3d2470',
                      boxShadow: selected ? '0 0 20px rgba(124,58,237,0.3)' : 'none',
                    }}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-[11px] font-semibold mt-1" style={{ color: selected ? '#c4b5fd' : '#9d8fbc' }}>
                      {label}
                    </span>
                    <span className="text-[9px] mt-0.5 leading-tight" style={{ color: selected ? '#a78bfa' : '#5b4a7a' }}>
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
            <Label color="#7d92c9">선택지</Label>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <Input name="option_a" required placeholder="A — 예: 이직한다" />
              <span className="text-[#3d2d58] text-sm font-medium">vs</span>
              <Input name="option_b" required placeholder="B — 예: 현직 유지" />
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
                  style={{ background: '#1e1340', borderColor: '#3d2470', color: '#c4b5fd' }}
                >
                  <input type="radio" name="chosen_option" value={opt} required className="accent-[#7c3aed]" />
                  선택지 {opt}
                </label>
              ))}
            </div>
          </div>

          {/* 이유 */}
          <div>
            <Label color="#9ab87d">
              선택 이유{' '}
              <span className="normal-case tracking-normal font-normal text-[#5b4a7a]">(선택)</span>
            </Label>
            <textarea
              name="reason"
              rows={3}
              placeholder="지금의 생각을 남겨두세요. 미래의 당신이 읽을 거예요."
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors
                bg-[#1e1340] border border-[#3d2470] text-[#e4d9c8] placeholder-[#5b4a7a]
                focus:border-[#9ab87d]"
            />
          </div>

          {/* 확신도 */}
          <div>
            <Label color="#c4903e">
              확신도{' '}
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', color: '#c4903e' }}>
                {confidence}
              </span>
              <span className="normal-case tracking-normal font-normal text-[#5b4a7a]"> / 10</span>
            </Label>
            <input
              type="range"
              name="confidence"
              min={1}
              max={10}
              value={confidence}
              onChange={e => setConfidence(Number(e.target.value))}
              className="w-full accent-[#c4903e]"
            />
            <div className="flex justify-between text-[11px] mt-1.5 text-[#5b4a7a]">
              <span>반신반의</span>
              <span>완전한 확신</span>
            </div>
          </div>

          {/* 리뷰 날짜 */}
          <div>
            <Label color="#7d92c9">
              결과를 돌아볼 날{' '}
              <span className="normal-case tracking-normal font-normal text-[#5b4a7a]">(선택)</span>
            </Label>
            <Input name="review_date" type="date" />
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #3d2470, transparent)' }} />

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-[0.15em] uppercase transition-colors"
            style={{
              background: '#2a1548',
              border: '1px solid #6b4a8a',
              color: '#c4b5fd',
              fontFamily: 'var(--font-cinzel)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#a78bfa' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6b4a8a' }}
          >
            결정을 새기다
          </button>

        </form>
      </div>
    </div>
  )
}
