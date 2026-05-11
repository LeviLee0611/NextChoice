import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IMPORTANCE_LABELS, CATEGORIES, type Decision, type ImportanceLevel } from '@/types/decision'
import FilterBar from './FilterBar'


const CATEGORY_COLORS: Record<string, string> = {
  '커리어': '#7a9a8a',
  '관계':   '#c47a4a',
  '재정':   '#c4903e',
  '건강':   '#8aad7a',
  '생활':   '#a09060',
  '기타':   '#8a9478',
}

const IMPORTANCE_ACCENT: Record<number, string> = {
  1: '#3d5235',
  2: '#2d5a48',
  3: '#6a4e1a',
  4: '#7a3a1a',
  5: '#8a2020',
}

const PAGE_SIZE = 10

type SearchParams = { category?: string; reviewed?: string; sort?: string; page?: string }

export default async function DecisionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams
  const category = (raw.category && (raw.category === 'all' || CATEGORIES.includes(raw.category as never)))
    ? raw.category : 'all'
  const reviewed = (['all', 'yes', 'no'] as const).includes(raw.reviewed as never)
    ? raw.reviewed as 'all' | 'yes' | 'no' : 'all'
  const sort = (['oldest', 'importance'] as const).includes(raw.sort as never)
    ? raw.sort as 'oldest' | 'importance' : 'newest'
  const page = Math.max(1, parseInt(raw.page ?? '1') || 1)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('decisions')
    .select('*, decision_reviews(id)')
    .eq('user_id', user.id)
    .order(sort === 'importance' ? 'importance_level' : 'created_at', {
      ascending: sort === 'oldest',
    })

  if (category !== 'all') query = query.eq('category', category)

  const { data: queryData } = await query

  let decisions = (queryData ?? []) as (Decision & { decision_reviews: { id: string }[] })[]
  if (reviewed === 'yes') decisions = decisions.filter(d => d.decision_reviews?.length > 0)
  if (reviewed === 'no') decisions = decisions.filter(d => !d.decision_reviews?.length)

  const totalCount = decisions.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = decisions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: '#8a9478' }}>
              Decisions
            </p>
            <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cinzel)', color: '#d4a84b', letterSpacing: '0.08em' }}>
              나의 결정들
            </h1>
          </div>
          <Link
            href="/decisions/new"
            className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors"
            style={{ background: '#141c12', border: '1px solid #6a4e1a', color: '#d4a84b' }}
          >
            + 새 결정
          </Link>
        </div>

        <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(to right, transparent, #b8892a, #6b8f5e, transparent)' }} />

        {/* Filter bar */}
        <Suspense fallback={null}>
          <FilterBar
            activeCategory={category}
            activeReviewed={reviewed}
            activeSort={sort}
            total={totalCount}
          />
        </Suspense>

        {/* Empty state */}
        {decisions.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">✦</p>
            <p className="text-sm mb-1" style={{ color: '#d4c9a8' }}>
              {category !== 'all' || reviewed !== 'all'
                ? '조건에 맞는 결정이 없어요'
                : '아직 기록된 결정이 없어요'}
            </p>
            <p className="text-xs mb-8" style={{ color: '#5a6a50' }}>첫 번째 결정을 기록해보세요</p>
            <Link
              href="/decisions/new"
              className="text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-lg transition-colors"
              style={{ background: '#141c12', border: '1px solid #6a4e1a', color: '#d4a84b' }}
            >
              결정 기록하기
            </Link>
          </div>
        )}

        {/* Decision list */}
        <div className="space-y-3">
          {paged.map(decision => {
            const imp = IMPORTANCE_LABELS[decision.importance_level as ImportanceLevel]
            const catColor = CATEGORY_COLORS[decision.category] ?? '#8a9478'
            const date = new Date(decision.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'short', day: 'numeric',
            })
            const hasReview = decision.decision_reviews?.length > 0
            const reviewOverdue = !hasReview && decision.review_date && new Date(decision.review_date) <= new Date()

            const accentColor = IMPORTANCE_ACCENT[decision.importance_level] ?? '#2d3e28'
            const chosenText = decision.chosen_option === 'A' ? decision.option_a
              : decision.chosen_option === 'B' ? decision.option_b
              : decision.chosen_option === 'C' ? (decision.option_c ?? '')
              : (decision.option_d ?? '')

            return (
              <Link
                key={decision.id}
                href={`/decisions/${decision.id}`}
                className="block rounded-xl border hover:border-[#4a5e3a] transition-colors overflow-hidden"
                style={{ background: '#0f1a0d', borderColor: '#2d3e28' }}
              >
                <div className="flex">
                  {/* 중요도 컬러 액센트 */}
                  <div className="w-1 shrink-0" style={{ background: accentColor }} />

                  <div className="flex-1 p-4">
                    {/* 상단: 카테고리 + 날짜 */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: catColor }}>
                        {decision.category}
                      </span>
                      <span className="text-[11px]" style={{ color: '#4a5a3a' }}>{date}</span>
                    </div>

                    {/* 제목 */}
                    <p className="text-sm font-medium mb-3 leading-snug" style={{ color: '#e8dfc8' }}>
                      {decision.title}
                    </p>

                    {/* 하단: 선택지 + 상태 */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs px-2.5 py-1 rounded-lg truncate max-w-[60%]"
                        style={{ background: '#141c12', border: '1px solid #2d3e28', color: '#a09060' }}
                      >
                        {imp.emoji} {chosenText}
                      </span>
                      {hasReview ? (
                        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#6b8f5e' }}>
                          ✓ 리뷰 완료
                        </span>
                      ) : reviewOverdue ? (
                        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#c4903e' }}>
                          ✦ 리뷰할 시간
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {currentPage > 1 && (
              <Link
                href={`/decisions?category=${category}&reviewed=${reviewed}&sort=${sort}&page=${currentPage - 1}`}
                className="text-xs font-medium tracking-widest uppercase px-3 py-1.5 rounded-lg transition-colors"
                style={{ border: '1px solid #2d3e28', color: '#8a9a78' }}
              >
                ← 이전
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link
                key={p}
                href={`/decisions?category=${category}&reviewed=${reviewed}&sort=${sort}&page=${p}`}
                className="text-xs font-semibold tracking-widest px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  border: `1px solid ${p === currentPage ? '#b8892a' : '#2d3e28'}`,
                  background: p === currentPage ? 'rgba(184,137,42,0.12)' : 'transparent',
                  color: p === currentPage ? '#d4a84b' : '#8a9a78',
                }}
              >
                {p}
              </Link>
            ))}

            {currentPage < totalPages && (
              <Link
                href={`/decisions?category=${category}&reviewed=${reviewed}&sort=${sort}&page=${currentPage + 1}`}
                className="text-xs font-medium tracking-widest uppercase px-3 py-1.5 rounded-lg transition-colors"
                style={{ border: '1px solid #2d3e28', color: '#8a9a78' }}
              >
                다음 →
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
