import Link from 'next/link'

const FEATURE_ROWS = [
  { label: '결정 기록', free: '무제한', pro: '무제한', early: '무제한' },
  { label: '기본 대시보드 · 통계', free: '✓', pro: '✓', early: '✓' },
  { label: '기간 비교 분석', free: '✓', pro: '✓', early: '✓' },
  { label: 'AI Choice 코치', free: '10턴/일', pro: '50턴/일', early: '50턴/일' },
  { label: 'AI 인사이트 생성', free: '3회/일', pro: '15회/일', early: '15회/일' },
  { label: '유저 맞춤형 AI 코치', free: null, pro: '✓', early: '✓' },
  { label: 'ML 기반 패턴 인사이트', free: null, pro: '✓', early: '✓' },
  { label: '우선 지원', free: null, pro: '✓', early: '✓' },
  { label: '신규 기능 우선 체험', free: null, pro: null, early: '✓' },
]

const PRO_HIGHLIGHTS = [
  {
    icon: '◈',
    title: '유저 맞춤형 AI 코치',
    desc: '내 과거 결정 히스토리를 학습한 AI가 맥락을 이해하고 조언합니다. "지난번 커리어 결정에서 당신은 안정성을 우선했는데, 이번엔 어떤가요?" 처음 만나는 AI가 아닌, 나를 아는 AI 코치.',
  },
  {
    icon: '⬡',
    title: 'ML 기반 패턴 인사이트',
    desc: '수십 개의 결정이 쌓이면 AI가 숨겨진 경향성을 발견합니다. "당신은 감정적으로 스트레스를 받을 때 후회할 선택을 하는 경향이 있습니다." 스스로 보지 못했던 패턴을 데이터로.',
  },
]

export default function PricingPage() {
  return (
    <div style={{ background: '#111210', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-50 w-full flex items-center justify-between px-6 h-14"
        style={{
          background: 'rgba(17,18,16,0.92)',
          borderBottom: '1px solid rgba(184,137,42,0.15)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Link
          href="/"
          className="text-3xl font-light tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, letterSpacing: '0.15em', color: '#d4a84b' }}
        >
          NextChoice
        </Link>
        <Link
          href="/login"
          className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-lg transition-all"
          style={{ background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 100%)', color: '#0d1008' }}
        >
          시작하기
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-20">

        {/* Hero */}
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-5" style={{ color: '#d4a84b' }}>요금제</p>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 300,
            color: '#f5f0e8',
            lineHeight: 1.1,
          }}>
            나를 아는 AI와 함께<br />
            <em style={{ fontStyle: 'italic', color: '#d4a84b' }}>더 나은 선택을</em>
          </h1>
          <p className="mt-4 text-base" style={{ color: '#c8d5bc' }}>
            결정을 기록하고, 결과를 돌아보고, 최고의 선택을 하게 됩니다.
          </p>
        </div>

        {/* Early bird banner */}
        <div className="flex justify-center mb-16">
          <div
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full text-sm"
            style={{
              background: 'rgba(184,137,42,0.08)',
              border: '1px solid rgba(184,137,42,0.3)',
              color: '#d4a84b',
            }}
          >
            <span style={{ fontSize: '0.75rem' }}>✦</span>
            <span>선착순 <strong>100명</strong> 한정 — ₩99,000 일시불로 평생 Pro</span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {/* Free */}
          <div
            className="rounded-2xl p-8 flex flex-col gap-6"
            style={{
              background: 'rgba(18,24,14,0.7)',
              border: '1px solid rgba(184,137,42,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: '#9aaa8a' }}>Free</p>
              <div className="flex items-end gap-2">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', fontWeight: 300, color: '#f5f0e8', lineHeight: 1 }}>₩0</span>
                <span className="text-sm mb-1" style={{ color: '#9aaa8a' }}>/월</span>
              </div>
              <p className="text-xs mt-2" style={{ color: '#8a9a80' }}>영원히 무료</p>
            </div>
            <div className="flex flex-col gap-3">
              {FEATURE_ROWS.map(f => (
                <div key={f.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm" style={{ color: f.free ? '#c8d5bc' : '#4a5a40' }}>{f.label}</span>
                  {f.free ? (
                    <span className="text-sm font-medium shrink-0" style={{ color: f.free === '✓' ? '#7aad6a' : '#d4a84b' }}>{f.free}</span>
                  ) : (
                    <span className="text-sm shrink-0" style={{ color: '#3a4a30' }}>—</span>
                  )}
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="mt-auto block text-center py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#9aaa8a', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              무료로 시작하기
            </Link>
          </div>

          {/* Pro */}
          <div
            className="relative rounded-2xl p-8 flex flex-col gap-6"
            style={{
              background: 'rgba(20,26,16,0.9)',
              border: '1px solid rgba(184,137,42,0.4)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 60px rgba(184,137,42,0.07)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.7), transparent)' }}
            />
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: '#d4a84b' }}>Pro</p>
              <div className="flex items-end gap-2">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', fontWeight: 300, color: '#f5f0e8', lineHeight: 1 }}>₩3,900</span>
                <span className="text-sm mb-1" style={{ color: '#9aaa8a' }}>/월</span>
              </div>
              <p className="text-xs mt-2" style={{ color: '#8a9a80' }}>매월 결제</p>
            </div>
            <div className="flex flex-col gap-3">
              {FEATURE_ROWS.map(f => (
                <div key={f.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm" style={{ color: f.pro ? '#d8e8c8' : '#4a5a40' }}>{f.label}</span>
                  {f.pro ? (
                    <span className="text-sm font-medium shrink-0" style={{ color: f.pro === '✓' ? '#d4a84b' : '#d4a84b' }}>{f.pro}</span>
                  ) : (
                    <span className="text-sm shrink-0" style={{ color: '#3a4a30' }}>—</span>
                  )}
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="mt-auto block text-center py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 100%)',
                color: '#0d1008',
                boxShadow: '0 4px 20px rgba(184,137,42,0.3)',
              }}
            >
              Pro 시작하기
            </Link>
          </div>

          {/* Early Bird */}
          <div
            className="relative rounded-2xl p-8 flex flex-col gap-6"
            style={{
              background: 'rgba(22,20,10,0.95)',
              border: '1px solid rgba(212,168,75,0.6)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 60px rgba(184,137,42,0.14)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{ background: 'linear-gradient(to right, transparent, rgba(212,168,75,0.9), transparent)' }}
            />
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase"
                style={{ background: 'linear-gradient(135deg, #b8892a, #f0cc70)', color: '#0d1008' }}>
                선착순 100명
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: '#f0cc70' }}>Early Bird</p>
              <div className="flex items-end gap-2">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem', fontWeight: 300, color: '#f5f0e8', lineHeight: 1 }}>₩99,000</span>
              </div>
              <p className="text-xs mt-2" style={{ color: '#c4903e' }}>일시불 · 평생 Pro 이용</p>
            </div>
            <div className="flex flex-col gap-3">
              {FEATURE_ROWS.map(f => (
                <div key={f.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm" style={{ color: f.early ? '#f0e8c8' : '#4a5a40' }}>{f.label}</span>
                  {f.early ? (
                    <span className="text-sm font-medium shrink-0" style={{ color: f.early === '✓' ? '#f0cc70' : '#f0cc70' }}>{f.early}</span>
                  ) : (
                    <span className="text-sm shrink-0" style={{ color: '#3a4a30' }}>—</span>
                  )}
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="mt-auto block text-center py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #c4903e 0%, #f0cc70 100%)',
                color: '#0d1008',
                boxShadow: '0 4px 20px rgba(240,204,112,0.3)',
              }}
            >
              얼리버드 참여하기
            </Link>
          </div>
        </div>

        {/* Pro 기능 상세 */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: '#d4a84b' }}>Pro 전용</p>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 300,
              color: '#f5f0e8',
              lineHeight: 1.15,
            }}>
              나를 아는 AI가<br />
              <em style={{ fontStyle: 'italic', color: '#d4a84b' }}>다음 선택을 바꿉니다</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PRO_HIGHLIGHTS.map(h => (
              <div
                key={h.title}
                className="rounded-2xl p-8 flex flex-col gap-4"
                style={{
                  background: 'rgba(18,24,14,0.7)',
                  border: '1px solid rgba(184,137,42,0.15)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <span style={{ fontSize: '1.6rem', color: '#d4a84b' }}>{h.icon}</span>
                <h3 className="text-lg font-semibold" style={{ color: '#f5f0e8' }}>{h.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c8d5bc' }}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-10 text-center" style={{ color: '#d4a84b' }}>
            자주 묻는 질문
          </p>
          {[
            {
              q: 'Early Bird는 무엇인가요?',
              a: '₩99,000을 일시불로 결제하면 Pro 기능을 평생 이용할 수 있는 특별 요금제입니다. 선착순 100명에게만 제공되며, 마감 이후 Pro는 월 ₩3,900으로 전환됩니다.',
            },
            {
              q: 'ML 기반 인사이트는 언제부터 작동하나요?',
              a: '결정이 10개 이상 쌓이면 AI가 패턴 분석을 시작합니다. 데이터가 많을수록 더 정확하고 개인화된 인사이트를 제공합니다.',
            },
            {
              q: 'Free와 Pro는 어떻게 다른가요?',
              a: 'Free는 기본 결정 기록과 대시보드, AI 코치를 제공합니다. Pro는 사용량이 5배 늘어나고, 내 히스토리를 학습한 맞춤형 AI 코치와 ML 기반 패턴 인사이트를 추가로 제공합니다.',
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="mb-4 rounded-2xl p-6"
              style={{ background: 'rgba(18,24,14,0.5)', border: '1px solid rgba(184,137,42,0.08)' }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: '#f5f0e8' }}>{q}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#c8d5bc' }}>{a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 50%, #b8892a 100%)',
              color: '#0d1008',
              boxShadow: '0 0 50px rgba(184,137,42,0.3), 0 8px 30px rgba(0,0,0,0.5)',
            }}
          >
            지금 무료로 시작하기
            <span style={{ fontSize: '1.1rem' }}>✦</span>
          </Link>
          <p className="mt-4 text-xs" style={{ color: '#7a8a70' }}>
            Google 로그인 · 얼리버드 100명 ₩99,000 일시불로 평생 Pro
          </p>
        </div>

      </div>

      {/* Footer */}
      <footer className="py-10 px-8 text-center" style={{ borderTop: '1px solid rgba(184,137,42,0.08)' }}>
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link href="/" className="footer-link">홈</Link>
          <span style={{ color: '#5a6a50' }}>·</span>
          <Link href="/privacy" className="footer-link">개인정보처리방침</Link>
          <span style={{ color: '#5a6a50' }}>·</span>
          <Link href="/terms" className="footer-link">이용약관</Link>
        </div>
      </footer>
    </div>
  )
}
