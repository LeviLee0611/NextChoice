import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FeedbackForm from './FeedbackForm'

type FeedbackItem = {
  id: string
  category: 'bug' | 'feature' | 'other'
  title: string
  body: string
  status: 'new' | 'in_progress' | 'resolved'
  admin_reply: string | null
  replied_at: string | null
  created_at: string
}

const CATEGORY_LABEL: Record<string, string> = {
  bug: '버그',
  feature: '기능 제안',
  other: '기타',
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: '검토 중', color: '#c4903e', bg: 'rgba(196,144,62,0.1)' },
  in_progress: { label: '처리중', color: '#7ab0d4', bg: 'rgba(122,176,212,0.1)' },
  resolved: { label: '완료', color: '#8aad7a', bg: 'rgba(138,173,122,0.1)' },
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { sent } = await searchParams

  const { data } = await supabase
    .from('feedback')
    .select('id, category, title, body, status, admin_reply, replied_at, created_at')
    .order('created_at', { ascending: false })

  const items = (data ?? []) as FeedbackItem[]

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-xl mx-auto">

        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: '#d4a84b' }}>
            Feedback
          </p>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 300,
            color: '#e8dfc8',
            lineHeight: 1.1,
          }}>
            피드백
          </h1>
          <p className="mt-3 text-sm" style={{ color: '#6a7a60' }}>
            버그, 기능 제안, 개선점 등 무엇이든 남겨주세요. 직접 읽고 반영합니다.
          </p>
        </div>

        <div className="w-full h-px mb-10" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.4), transparent)' }} />

        {/* 제출 성공 배너 */}
        {sent === '1' && (
          <div
            className="rounded-2xl p-5 mb-6 flex items-center gap-3"
            style={{
              background: 'rgba(138,173,122,0.08)',
              border: '1px solid rgba(138,173,122,0.2)',
            }}
          >
            <span style={{ color: '#8aad7a' }}>✓</span>
            <p className="text-sm" style={{ color: '#8aad7a' }}>피드백이 전달됐습니다. 꼼꼼히 읽겠습니다.</p>
          </div>
        )}

        {/* 내 피드백 내역 */}
        {items.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: '#6a7a60' }}>
              내가 보낸 피드백
            </p>
            <div className="flex flex-col gap-3">
              {items.map(item => {
                const st = STATUS_STYLE[item.status]
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl p-5 flex flex-col gap-2.5"
                    style={{
                      background: 'rgba(18,24,14,0.7)',
                      border: `1px solid ${item.admin_reply ? 'rgba(184,137,42,0.2)' : 'rgba(184,137,42,0.08)'}`,
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase"
                          style={{ background: 'rgba(184,137,42,0.08)', color: '#c4903e' }}
                        >
                          {CATEGORY_LABEL[item.category]}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                        {item.admin_reply && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{ background: 'rgba(184,137,42,0.1)', color: '#d4a84b' }}
                          >
                            답장 있음
                          </span>
                        )}
                      </div>
                      <span className="text-[11px]" style={{ color: '#6a7a60' }}>
                        {new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-medium" style={{ color: '#e8dfc8' }}>{item.title}</p>

                    {/* Admin reply */}
                    {item.admin_reply && (
                      <div
                        className="rounded-xl p-3 mt-1"
                        style={{ background: 'rgba(184,137,42,0.06)', border: '1px solid rgba(184,137,42,0.12)' }}
                      >
                        <p className="text-[10px] font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#d4a84b' }}>
                          개발자 답장
                        </p>
                        <p className="text-sm whitespace-pre-wrap" style={{ color: '#c8d8b8' }}>{item.admin_reply}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 새 피드백 폼 */}
        <div>
          {items.length > 0 && (
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: '#6a7a60' }}>
              새 피드백 보내기
            </p>
          )}
          <FeedbackForm />
        </div>

      </div>
    </div>
  )
}
