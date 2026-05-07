'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/types/decision'

type Props = {
  activeCategory: string
  activeReviewed: string
  activeSort: string
  total: number
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      style={{
        background: active ? 'rgba(184,137,42,0.12)' : 'transparent',
        border: `1px solid ${active ? '#b8892a' : '#2d3e28'}`,
        color: active ? '#d4a84b' : '#6a7a60',
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
        </div>
      </div>

      {/* 결과 수 */}
      <p className="text-[11px]" style={{ color: '#5a6a50' }}>
        {total}개의 결정
      </p>
    </div>
  )
}
