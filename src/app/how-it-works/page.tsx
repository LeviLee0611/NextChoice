import Link from 'next/link'

const levels = [
  {
    range: '1 – 4개',
    label: '시작',
    color: '#6a7a60',
    description: '기본 통계를 제공합니다. 카테고리별 결정 수, 평균 만족도를 확인할 수 있어요.',
    features: ['결정 기록 및 리뷰', '카테고리별 통계', '만족도 추이'],
  },
  {
    range: '5 – 19개',
    label: '패턴 분석',
    color: '#d4a84b',
    description: 'AI 코치가 활성화됩니다. 리뷰가 달린 결정 중 현재 고민과 가장 비슷한 과거 사례를 찾아 연결해줍니다.',
    features: ['AI 코치 활성화', '유사 결정 검색 (상위 3개)', '결정 스타일 분석 (직감 vs 논리)'],
  },
  {
    range: '20개 이상',
    label: '깊은 인사이트',
    color: '#8aad7a',
    description: '데이터가 충분해질수록 조언의 정밀도가 높아집니다. 더 많은 유사 사례, 더 정교한 패턴 분석이 가능해요.',
    features: ['유사 결정 검색 (상위 5개)', '신뢰도-만족도 상관관계 분석', '기간 비교 분석'],
  },
]

export default function HowItWorksPage() {
  return (
    <div style={{ background: '#111210', minHeight: '100vh', color: '#e8dfc8' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(184,137,42,0.08)' }}>
        <Link href="/" className="text-xl font-light tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-cormorant)', color: '#d4a84b', letterSpacing: '0.15em' }}
        >
          NextChoice
        </Link>
        <Link href="/login"
          className="text-xs font-semibold tracking-widest uppercase px-5 py-2.5 rounded-lg"
          style={{ background: 'rgba(184,137,42,0.1)', border: '1px solid rgba(184,137,42,0.3)', color: '#d4a84b' }}
        >
          시작하기
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="mb-20">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-5" style={{ color: '#d4a84b' }}>
            작동 원리
          </p>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: 300,
            color: '#f5f0e8',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}>
            NextChoice는<br />어떻게 도움을 드리나요?
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#9aaa8a', maxWidth: '520px' }}>
            단순한 기록 앱이 아닙니다. 결정을 쌓아갈수록 AI가 나만의 패턴을 이해하고,
            다음 선택 앞에서 더 구체적인 도움을 드립니다.
          </p>
        </div>

        <Divider />

        {/* Core flow */}
        <section className="py-16">
          <h2 className="text-sm font-semibold tracking-[0.2em] uppercase mb-10" style={{ color: '#d4a84b' }}>
            기본 흐름
          </h2>
          <div className="flex flex-col gap-10">
            {[
              {
                step: '기록',
                title: '결정을 기록하고 나중에 리뷰를 남깁니다',
                body: '선택지, 선택 이유, 확신 수준을 저장합니다. 결정 후 실제 어떤 결과가 있었는지, 무엇을 배웠는지 리뷰로 추가하세요. 이 리뷰가 AI가 학습하는 핵심 데이터입니다.',
              },
              {
                step: '분석',
                title: 'AI가 텍스트의 의미를 이해합니다',
                body: '단순히 카테고리나 숫자만 보는 게 아닙니다. "이직 결정"과 "커리어 전환 고민"이 같은 맥락임을 이해하고, 새 고민이 생겼을 때 의미적으로 가장 가까운 과거 경험을 찾아냅니다.',
              },
              {
                step: '연결',
                title: '과거 경험이 지금 결정에 연결됩니다',
                body: 'AI 코치와 대화할 때, 현재 고민과 비슷한 과거 결정을 자동으로 찾아 그때의 결과와 배운 점을 함께 보여줍니다. "2025년에 비슷한 결정을 했을 때 이런 점을 배우셨어요"처럼요.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <span className="text-[10px] font-semibold tracking-widest px-2 py-1 rounded"
                    style={{ background: 'rgba(184,137,42,0.1)', color: '#d4a84b' }}>
                    {step}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: '#f5f0e8' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#9aaa8a' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Level system */}
        <section className="py-16">
          <h2 className="text-sm font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: '#d4a84b' }}>
            데이터에 따른 레벨
          </h2>
          <p className="text-sm mb-10" style={{ color: '#9aaa8a' }}>
            리뷰가 달린 결정 수에 따라 AI가 제공할 수 있는 도움의 깊이가 달라집니다.
          </p>
          <div className="flex flex-col gap-4">
            {levels.map((level) => (
              <div key={level.range}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(18,24,14,0.7)', border: `1px solid ${level.color}20` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: `${level.color}15`, color: level.color }}>
                    {level.range}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: level.color }}>{level.label}</span>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#9aaa8a' }}>{level.description}</p>
                <ul className="flex flex-col gap-1">
                  {level.features.map(f => (
                    <li key={f} className="text-xs flex items-center gap-2" style={{ color: '#6a7a60' }}>
                      <span style={{ color: level.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Privacy */}
        <section className="py-16">
          <h2 className="text-sm font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: '#d4a84b' }}>
            내 데이터는 안전한가요?
          </h2>
          <div className="flex flex-col gap-4 text-sm leading-relaxed" style={{ color: '#9aaa8a' }}>
            <p>나의 결정 데이터는 오직 나에게만 사용됩니다. 다른 사용자의 AI 학습에 쓰이거나 제3자와 공유되지 않습니다.</p>
            <p>AI 코치는 내 데이터를 기반으로 응답을 생성하며, 대화 내용은 세션 단위로 저장됩니다. 언제든지 계정 삭제로 모든 데이터를 완전히 삭제할 수 있습니다.</p>
          </div>
        </section>

        <Divider />

        {/* CTA */}
        <section className="py-16 text-center">
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 300,
            color: '#f5f0e8',
            marginBottom: '1.5rem',
          }}>
            첫 결정부터 시작하세요
          </h2>
          <p className="text-sm mb-8" style={{ color: '#9aaa8a' }}>
            베타 기간 동안 모든 기능을 무료로 사용할 수 있습니다.
          </p>
          <Link href="/login"
            className="inline-block px-8 py-3.5 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all duration-200"
            style={{ background: 'rgba(184,137,42,0.15)', border: '1px solid rgba(184,137,42,0.4)', color: '#d4a84b' }}
          >
            무료로 시작하기
          </Link>
        </section>

      </div>
    </div>
  )
}

function Divider() {
  return (
    <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.2), transparent)' }} />
  )
}
