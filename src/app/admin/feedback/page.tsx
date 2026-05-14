import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StatusButton from './StatusButton'
import ReplyForm from './ReplyForm'
import ExportButton from './ExportButton'

type Feedback = {
  id: string
  user_email: string | null
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
  new: { label: '신규', color: '#c44040', bg: 'rgba(196,64,64,0.1)' },
  in_progress: { label: '처리중', color: '#c4903e', bg: 'rgba(196,144,62,0.1)' },
  resolved: { label: '완료', color: '#8aad7a', bg: 'rgba(138,173,122,0.1)' },
}

export default async function AdminFeedbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  const admin = createAdminClient()
  const { data: feedbacks } = await admin
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  const items = (feedbacks ?? []) as Feedback[]
  const newCount = items.filter(f => f.status === 'new').length

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: '#d4a84b' }}>
            Admin
          </p>
          <div className="flex items-end gap-4">
            <h1 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 300,
              color: '#e8dfc8',
              lineHeight: 1.1,
            }}>
              피드백 관리
            </h1>
            {newCount > 0 && (
              <span
                className="mb-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(196,64,64,0.15)', color: '#c44040' }}
              >
                신규 {newCount}건
              </span>
            )}
          </div>
          {items.length > 0 && (
            <div className="mt-4">
              <ExportButton items={items} />
            </div>
          )}
        </div>

        <div className="w-full h-px mb-10" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.4), transparent)' }} />

        {items.length === 0 ? (
          <p className="text-sm text-center" style={{ color: '#6a7a60' }}>아직 피드백이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map(item => {
              const st = STATUS_STYLE[item.status]
              return (
                <div
                  key={item.id}
                  className="rounded-2xl p-6 flex flex-col gap-3"
                  style={{
                    background: 'rgba(18,24,14,0.7)',
                    border: `1px solid ${item.status === 'new' ? 'rgba(196,64,64,0.2)' : 'rgba(184,137,42,0.1)'}`,
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase"
                        style={{ background: 'rgba(184,137,42,0.1)', color: '#c4903e' }}
                      >
                        {CATEGORY_LABEL[item.category]}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <span className="text-[11px] shrink-0" style={{ color: '#6a7a60' }}>
                      {new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-sm font-medium" style={{ color: '#e8dfc8' }}>{item.title}</p>

                  {/* Body */}
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#9aaa8a' }}>{item.body}</p>

                  {/* Status + email */}
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-[11px]" style={{ color: '#6a7a60' }}>{item.user_email ?? '알 수 없음'}</span>
                    <StatusButton id={item.id} currentStatus={item.status} />
                  </div>

                  {/* Reply form */}
                  <ReplyForm id={item.id} initialReply={item.admin_reply} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
