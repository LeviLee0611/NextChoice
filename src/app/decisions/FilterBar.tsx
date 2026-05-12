'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/types/decision'

type Props = {
  activeCategory: string
  activeReviewed: string
  activeSort: string
  total: number
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-[11px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-lg whitespace-nowrap"
      style={{
        background: active ? 'rgba(184,137,42,0.12)' : hovered ? 'rgba(184,137,42,0.06)' : 'transparent',
        border: `1px solid ${active ? '#b8892a' : hovered ? 'rgba(184,137,42,0.25)' : 'rgba(184,137,42,0.12)'}`,
        color: active ? '#d4a84b' : hovered ? '#b8c8a8' : '#6a7a60',
        transform: hovered && !active ? 'translateY(-1px)' : 'none',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

export default function FilterBar({ activeCategory, activeReviewed, activeSort, total }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`/decisions?${params.toString()}`)
  }

  return (
    <div className="space-y-3 mb-8">
      {/* 카테고리 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Pill label="전체" active={activeCategory === 'all'} onClick={() => update('category', 'all')} />
        {CATEGORIES.map(c => (
          <Pill key={c} label={c} active={activeCategory === c} onClick={() => update('category', c)} />
        ))}
      </div>

      {/* 리뷰 여부 + 정렬 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill label="전체" active={activeReviewed === 'all'} onClick={() => update('reviewed', 'all')} />
          <Pill label="리뷰 완료" active={activeReviewed === 'yes'} onClick={() => update('reviewed', 'yes')} />
          <Pill label="리뷰 미완료" active={activeReviewed === 'no'} onClick={() => update('reviewed', 'no')} />
        </div>
        <div className="flex items-center gap-2">
          <Pill label="최신순" active={activeSort === 'newest'} onClick={() => update('sort', 'newest')} />
          <Pill label="오래된순" active={activeSort === 'oldest'} onClick={() => update('sort', 'oldest')} />
          <Pill label="중요순" active={activeSort === 'importance'} onClick={() => update('sort', 'importance')} />
        </div>
      </div>

      {/* 결과 수 */}
      <p className="text-[11px]" style={{ color: '#5a6a50' }}>
        {total}개의 결정
      </p>
    </div>
  )
}
