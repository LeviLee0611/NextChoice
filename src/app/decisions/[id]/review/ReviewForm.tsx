'use client'

import { useState } from 'react'
import { createReview } from '../../actions'
import type { Decision, ImportanceLevel } from '@/types/decision'
import { IMPORTANCE_LABELS } from '@/types/decision'
import type { ExistingReview } from './page'

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

function satisfactionColor(score: number) {
  if (score <= 3) return '#c44040'
  if (score <= 6) return '#c4903e'
  return '#8aad7a'
}

export default function ReviewForm({ decision, existing }: { decision: Decision; existing: ExistingReview | null }) {
  const [satisfaction, setSatisfaction] = useState(existing?.satisfaction_score ?? 7)
  const [wouldChooseAgain, setWouldChooseAgain] = useState<boolean | null>(existing?.would_choose_again ?? null)

  const imp = IMPORTANCE_LABELS[decision.importance_level as ImportanceLevel]
  const action = createReview.bind(null, decision.id)

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: '#8a9478' }}>
            Review
          </p>
          <h1 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-cinzel)', color: '#d4a84b', letterSpacing: '0.08em' }}>
            {existing ? '기록을 수정하다' : '결과를 돌아보다'}
          </h1>
          <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(to right, transparent, #b8892a, #6b8f5e, transparent)' }} />
        </div>

        {/* Decision context */}
        <div
          className="rounded-xl border p-4 mb-8"
          style={{ background: '#0e1410', borderColor: '#2d3e28' }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#4a5a3a' }}>
            기록한 결정
          </p>
          <p className="text-sm font-medium mb-2" style={{ color: '#e8dfc8' }}>{decision.title}</p>
          <div className="flex items-center gap-3 text-xs" style={{ color: '#8a9478' }}>
            <span>{imp.emoji} {imp.label}</span>
            <span style={{ color: '#2d3e28' }}>·</span>
            <span>
              선택:{' '}
              <span style={{ color: '#d4a84b' }}>
                {decision.chosen_option === 'A' ? decision.option_a : decision.option_b}
              </span>
            </span>
          </div>
        </div>

        {/* Form */}
        <form
          action={action}
          className="rounded-2xl p-8 space-y-7 border"
          style={{
            background: 'linear-gradient(to right, #1a2016, #0a0e08)',
            borderColor: '#2d3e28',
            boxShadow: '0 0 60px rgba(184,137,42,0.08)',
          }}
        >

          {/* 실제 결과 */}
          <div>
            <Label>실제로 어떻게 됐나요</Label>
            <textarea
              name="actual_result"
              required
              rows={3}
              placeholder="그 선택 이후 실제로 일어난 일을 적어주세요"
              defaultValue={existing?.actual_result ?? ''}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors"
              style={{ ...inputStyle, caretColor: '#d4a84b' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#b8892a' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#2d3e28' }}
            />
          </div>

          {/* 만족도 */}
          <div>
            <Label color="#c4903e">
              만족도{' '}
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', color: satisfactionColor(satisfaction) }}>
                {satisfaction}
              </span>
              <span className="normal-case tracking-normal font-normal" style={{ color: '#3a4a30' }}> / 10</span>
            </Label>
            <input
              type="range"
              name="satisfaction_score"
              min={1}
              max={10}
              value={satisfaction}
              onChange={e => setSatisfaction(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: satisfactionColor(satisfaction) }}
            />
            <div className="flex justify-between text-[11px] mt-1.5" style={{ color: '#3a4a30' }}>
              <span>후회된다</span>
              <span>그럭저럭</span>
              <span>잘했다</span>
            </div>
          </div>

          {/* 다시 선택할지 */}
          <div>
            <Label color="#7a9a8a">
              다시 선택한다면
            </Label>
            <div className="flex gap-3">
              {([true, false] as const).map(val => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setWouldChooseAgain(val)}
                  className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    background: wouldChooseAgain === val
                      ? val ? 'rgba(138,173,122,0.2)' : 'rgba(196,64,64,0.2)'
                      : '#141c12',
                    borderColor: wouldChooseAgain === val
                      ? val ? '#6b8f5e' : '#8a3a3a'
                      : '#2d3e28',
                    color: wouldChooseAgain === val
                      ? val ? '#8aad7a' : '#c47a7a'
                      : '#5a6a50',
                  }}
                >
                  {val ? '같은 선택을 할 것이다' : '다른 선택을 할 것이다'}
                </button>
              ))}
            </div>
            <input
              type="hidden"
              name="would_choose_again"
              value={wouldChooseAgain === null ? '' : String(wouldChooseAgain)}
            />
          </div>

          {/* 예상과 달랐던 점 */}
          <div>
            <Label color="#8aad7a">
              예상과 달랐던 점{' '}
              <span className="normal-case tracking-normal font-normal" style={{ color: '#3a4a30' }}>(선택)</span>
            </Label>
            <textarea
              name="unexpected_things"
              rows={2}
              placeholder="생각과 다르게 흘러간 부분이 있었나요?"
              defaultValue={existing?.unexpected_things ?? ''}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors"
              style={{ ...inputStyle, caretColor: '#d4a84b' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#6b8f5e' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#2d3e28' }}
            />
          </div>

          {/* 배운 점 */}
          <div>
            <Label color="#8aad7a">
              배운 점{' '}
              <span className="normal-case tracking-normal font-normal" style={{ color: '#3a4a30' }}>(선택)</span>
            </Label>
            <textarea
              name="lesson_learned"
              rows={2}
              placeholder="이 경험에서 얻은 것이 있다면"
              defaultValue={existing?.lesson_learned ?? ''}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors"
              style={{ ...inputStyle, caretColor: '#d4a84b' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#6b8f5e' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#2d3e28' }}
            />
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #2d3e28, transparent)' }} />

          {/* Submit */}
          <button
            type="submit"
            disabled={wouldChooseAgain === null}
            className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-[0.15em] uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: '#141c12',
              border: '1px solid #6a4e1a',
              color: '#d4a84b',
              fontFamily: 'var(--font-cinzel)',
            }}
            onMouseEnter={e => {
              if (wouldChooseAgain !== null) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#b8892a'
                ;(e.currentTarget as HTMLButtonElement).style.background = '#1a2416'
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#6a4e1a'
              ;(e.currentTarget as HTMLButtonElement).style.background = '#141c12'
            }}
          >
            {existing ? '수정을 마치다' : '기록을 마치다'}
          </button>

        </form>
      </div>
    </div>
  )
}
