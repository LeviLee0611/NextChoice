import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: '#d4a84b' }}>
            Legal
          </p>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 300,
            color: '#e8dfc8',
            lineHeight: 1.1,
            marginBottom: '0.5rem',
          }}>
            이용약관
          </h1>
          <p className="text-sm" style={{ color: '#6a7a60' }}>최종 업데이트: 2026년 5월</p>
        </div>

        <div className="w-full h-px mb-10" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.4), transparent)' }} />

        <div className="flex flex-col gap-10" style={{ color: '#9aaa8a', fontSize: '0.9rem', lineHeight: '1.8' }}>

          <Section title="1. 서비스 소개">
            <p>
              NextChoice(이하 "서비스")는 사용자의 의사결정 과정을 기록하고 데이터를 기반으로 인사이트를 제공하는
              서비스입니다. 서비스를 이용함으로써 본 약관에 동의하는 것으로 간주됩니다.
            </p>
          </Section>

          <Section title="2. 서비스 범위와 한계">
            <p className="mb-3">
              NextChoice는 사용자의 <strong style={{ color: '#e8dfc8', fontWeight: 500 }}>의사결정을 보조</strong>하는 서비스입니다.
              서비스가 제공하는 모든 정보와 AI 응답은 참고 목적으로만 활용되어야 하며, 다음 사항을 명확히 인지해야 합니다.
            </p>
            <ul className="flex flex-col gap-2 list-none">
              <Li>서비스는 사용자를 대신하여 결정을 내리지 않습니다.</Li>
              <Li>AI 코치의 응답은 전문 의료·법률·금융 조언을 대체하지 않습니다.</Li>
              <Li>중요한 결정에서는 반드시 해당 분야 전문가의 상담을 받으시기 바랍니다.</Li>
              <Li>제공되는 인사이트와 분석은 사용자가 입력한 데이터에 기반하며, 정확성을 보장하지 않습니다.</Li>
            </ul>
          </Section>

          <Section title="3. 계정 및 이용 자격">
            <ul className="flex flex-col gap-2 list-none">
              <Li>서비스는 만 14세 이상만 이용할 수 있습니다.</Li>
              <Li>Google 계정을 통한 소셜 로그인으로만 가입할 수 있습니다.</Li>
              <Li>하나의 Google 계정당 하나의 서비스 계정이 생성됩니다.</Li>
              <Li>타인의 계정을 도용하거나 허위 정보로 가입하는 행위는 금지됩니다.</Li>
            </ul>
          </Section>

          <Section title="4. 사용자 콘텐츠">
            <p>
              사용자가 서비스에 입력한 결정 기록, 리뷰, 채팅 내용의 소유권은 사용자에게 있습니다.
              운영자는 서비스 제공 목적 외에 사용자 콘텐츠를 활용하지 않습니다.
              단, AI 응답 생성을 위해 Anthropic의 API에 채팅 내용이 전달됩니다 (AI 학습에 사용되지 않음).
            </p>
          </Section>

          <Section title="5. 금지 행위">
            <ul className="flex flex-col gap-2 list-none">
              <Li>서비스를 통해 타인을 해치거나 불법적인 목적으로 활용하는 행위</Li>
              <Li>자동화 수단을 통한 대량 요청 또는 API 남용</Li>
              <Li>서비스의 보안 체계를 우회하거나 취약점을 악용하는 행위</Li>
              <Li>다른 사용자의 개인정보에 무단으로 접근하는 행위</Li>
            </ul>
          </Section>

          <Section title="6. 서비스 변경 및 중단">
            <p>
              운영자는 서비스의 전부 또는 일부를 사전 고지 없이 변경하거나 중단할 수 있습니다.
              서비스 중단 시 사용자가 등록한 이메일로 사전 고지를 위해 노력합니다.
            </p>
          </Section>

          <Section title="7. 계정 삭제">
            <p>
              사용자는 언제든지 서비스 내 설정 페이지에서 계정을 삭제할 수 있습니다.
              계정 삭제 시 모든 데이터는 즉시 파기되며 복구할 수 없습니다.
              운영자는 서비스 이용 규정 위반 시 사전 고지 없이 계정을 정지 또는 삭제할 수 있습니다.
            </p>
          </Section>

          <Section title="8. 면책 조항">
            <p className="mb-3">
              서비스는 현재 상태 그대로(as-is) 제공됩니다. 운영자는 다음에 대해 책임을 지지 않습니다.
            </p>
            <ul className="flex flex-col gap-2 list-none">
              <Li>AI 코치의 응답을 기반으로 내린 결정의 결과</Li>
              <Li>서비스 장애, 데이터 손실로 인한 직접·간접적 손해</Li>
              <Li>제3자 서비스(Supabase, Anthropic 등)의 장애로 인한 서비스 중단</Li>
            </ul>
          </Section>

          <Section title="9. 준거법 및 분쟁 해결">
            <p>
              본 약관은 대한민국 법률에 따라 해석됩니다.
              서비스 이용과 관련된 분쟁은 운영자와 협의를 통해 해결하는 것을 원칙으로 합니다.
            </p>
          </Section>

          <Section title="10. 문의">
            <p>
              약관 관련 문의는{' '}
              <a href="mailto:dlrbqls5126@gmail.com" style={{ color: '#d4a84b' }}>dlrbqls5126@gmail.com</a>으로 연락주세요.
            </p>
          </Section>

        </div>

        <div className="mt-16 pt-8 flex gap-4 text-xs" style={{ borderTop: '1px solid rgba(184,137,42,0.08)', color: '#4a5a3a' }}>
          <Link href="/privacy" style={{ color: '#6a7a60' }}>개인정보처리방침</Link>
          <Link href="/" style={{ color: '#6a7a60' }}>홈으로</Link>
        </div>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3 tracking-wide" style={{ color: '#d4a84b' }}>{title}</h2>
      {children}
    </div>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span style={{ color: '#4a5a3a', marginTop: '0.15rem' }}>·</span>
      <span>{children}</span>
    </li>
  )
}
