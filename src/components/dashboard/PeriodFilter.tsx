'use client'

import { useRouter } from 'next/navigation'

const PERIODS = [
  { key: 'all', label: '전체' },
  { key: '1m',  label: '1개월' },
  { key: '3m',  label: '3개월' },
  { key: '6m',  label: '6개월' },
  { key: '1y',  label: '1년' },
]

export default function PeriodFilter({ active }: { active: string }) {
  const router = useRouter()

  return (
    <div className="flex gap-1.5 flex-wrap">
      {PERIODS.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => router.push(`/dashboard${key === 'all' ? '' : `?period=${key}`}`)}
            className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: isActive ? 'rgba(184,137,42,0.12)' : 'transparent',
              border: `1px solid ${isActive ? '#b8892a' : '#2d3e28'}`,
              color: isActive ? '#d4a84b' : '#5a6a50',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
