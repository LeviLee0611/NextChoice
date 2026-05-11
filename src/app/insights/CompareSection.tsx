'use client'

import { useState } from 'react'

type PeriodStats = {
  total: number
  reviewed: number
  avgSatisfaction: number | null
  wouldChoosePct: number | null
  topCategory: string | null
}

function satisfactionColor(s: number) {
  if (s >= 7) return '#8aad7a'
  if (s >= 4) return '#c4903e'
  return '#c44040'
}

function Delta({ a, b, unit = '' }: { a: number | null; b: number | null; unit?: string }) {
  if (a == null || b == null) return <span style={{ color: '#3a4a30' }}>—</span>
  const diff = Math.round((b - a) * 10) / 10
  if (diff === 0) return <span style={{ color: '#5a6a50' }}>±0{unit}</span>
  return <span style={{ color: diff > 0 ? '#8aad7a' : '#c44040' }}>{diff > 0 ? '+' : ''}{diff}{unit}</span>
}

function Row({ label, aVal, bVal, unit = '', isSatisfaction = false }: {
  label: string
  aVal: number | null
  bVal: number | null
  unit?: string
  isSatisfaction?: boolean
}) {
  const aColor = aVal != null && isSatisfaction ? satisfactionColor(aVal) : '#5a6a50'
  const bColor = bVal != null && isSatisfaction ? satisfactionColor(bVal) : '#d4a84b'
  return (
    <div className="flex items-center px-5 py-3.5" style={{ borderBottom: '1px solid #1a2418' }}>
      <span className="text-xs w-24 shrink-0 font-semibold tracking-widest uppercase" style={{ color: '#4a5a3a' }}>{label}</span>
      <span className="flex-1 text-sm font-semibold text-right" style={{ fontFamily: 'var(--font-cinzel)', color: aColor }}>
        {aVal != null ? `${aVal}${unit}` : '—'}
      </span>
      <span className="w-16 text-center text-xs"><Delta a={aVal} b={bVal} unit={unit} /></span>
      <span className="flex-1 text-sm font-semibold text-left" style={{ fontFamily: 'var(--font-cinzel)', color: bColor }}>
        {bVal != null ? `${bVal}${unit}` : '—'}
      </span>
    </div>
  )
}

function getInitialRanges() {
  const today = new Date().toISOString().slice(0, 10)
  const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10)
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)
  return { today, sixMonthsAgo, oneYearAgo }
}

export default function CompareSection() {
  const [aFrom, setAFrom] = useState(() => getInitialRanges().oneYearAgo)
  const [aTo, setATo] = useState(() => getInitialRanges().sixMonthsAgo)
  const [bFrom, setBFrom] = useState(() => getInitialRanges().sixMonthsAgo)
  const [bTo, setBTo] = useState(() => getInitialRanges().today)

  const [result, setResult] = useState<{ a: PeriodStats; b: PeriodStats } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function compare() {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({ aFrom, aTo: aTo + 'T23:59:59Z', bFrom, bTo: bTo + 'T23:59:59Z' })
      const res = await fetch(`/api/insights/compare?${params}`)
      if (!res.ok) throw new Error()
      setResult(await res.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: '#141c12',
    border: '1px solid #2d3e28',
    color: '#e8dfc8',
    borderRadius: '0.75rem',
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
    outline: 'none',
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Date range inputs */}
      <div className="rounded-xl border p-5" style={{ background: '#0f1a0d', borderColor: '#2d3e28' }}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#4a5a3a' }}>기간 A (이전)</p>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="date" value={aFrom} onChange={e => setAFrom(e.target.value)} style={inputStyle} />
              <span style={{ color: '#3a4a30', fontSize: '0.75rem' }}>~</span>
              <input type="date" value={aTo} onChange={e => setATo(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#8a9478' }}>기간 B (현재)</p>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="date" value={bFrom} onChange={e => setBFrom(e.target.value)} style={inputStyle} />
              <span style={{ color: '#3a4a30', fontSize: '0.75rem' }}>~</span>
              <input type="date" value={bTo} onChange={e => setBTo(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        <button
          onClick={compare}
          disabled={loading}
          className="text-[10px] font-semibold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
          style={{ background: 'rgba(184,137,42,0.1)', border: '1px solid #b8892a', color: '#d4a84b' }}
        >
          {loading ? '비교 중…' : '비교하기'}
        </button>
      </div>

      {/* Results */}
      {error && <p className="text-xs text-center" style={{ color: '#5a6a50' }}>비교 데이터를 불러올 수 없어요</p>}

      {result && (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#0f1a0d', borderColor: '#2d3e28' }}>
          {/* Header */}
          <div className="flex items-center px-5 py-3 border-b" style={{ borderColor: '#1a2418' }}>
            <span className="text-[10px] font-semibold tracking-widest uppercase w-24 shrink-0" style={{ color: '#3a4a30' }}>항목</span>
            <span className="flex-1 text-[10px] font-semibold tracking-widest uppercase text-right" style={{ color: '#5a6a50' }}>기간 A</span>
            <span className="w-16 text-center text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#3a4a30' }}>변화</span>
            <span className="flex-1 text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#8a9478' }}>기간 B</span>
          </div>

          <Row label="결정 수" aVal={result.a.total} bVal={result.b.total} />
          <Row label="리뷰 완료" aVal={result.a.reviewed} bVal={result.b.reviewed} />
          <Row label="평균 만족도" aVal={result.a.avgSatisfaction} bVal={result.b.avgSatisfaction} isSatisfaction />
          <Row label="재선택" aVal={result.a.wouldChoosePct} bVal={result.b.wouldChoosePct} unit="%" />

          {/* Top category row */}
          <div className="flex items-center px-5 py-3.5">
            <span className="text-xs w-24 shrink-0 font-semibold tracking-widest uppercase" style={{ color: '#4a5a3a' }}>주요 카테고리</span>
            <span className="flex-1 text-sm text-right" style={{ color: '#5a6a50' }}>{result.a.topCategory ?? '—'}</span>
            <span className="w-16 text-center text-xs" style={{ color: '#3a4a30' }}>→</span>
            <span className="flex-1 text-sm font-medium" style={{ color: '#d4a84b' }}>{result.b.topCategory ?? '—'}</span>
          </div>
        </div>
      )}

    </div>
  )
}
