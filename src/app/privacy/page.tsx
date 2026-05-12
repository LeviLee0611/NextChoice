import Link from 'next/link'

export default function PrivacyPage() {
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
            개인정보처리방침
          </h1>
          <p className="text-sm" style={{ color: '#6a7a60' }}>최종 업데이트: 2026년 5월</p>
        </div>

        <div className="w-full h-px mb-10" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.4), transparent)' }} />

        <div className="flex flex-col gap-10" style={{ color: '#9aaa8a', fontSize: '0.9rem', lineHeight: '1.8' }}>

          <Section title="1. 개요">
            <p>
              NextChoice(이하 "서비스")는 사용자의 의사결정을 보조하는 목적으로 운영됩니다.
              본 방침은 서비스 이용 과정에서 수집되는 개인정보의 처리 방법을 설명합니다.
              서비스를 이용함으로써 본 방침에 동의하는 것으로 간주됩니다.
            </p>
            <p className="mt-3">
              운영자 이메일: <a href="mailto:dlrbqls5126@gmail.com" style={{ color: '#d4a84b' }}>dlrbqls5126@gmail.com</a>
            </p>
          </Section>

          <Section title="2. 수집하는 개인정보 항목">
            <ul className="flex flex-col gap-2 list-none">
              <Li>이메일 주소 (Google 소셜 로그인을 통해 자동 수집)</Li>
              <Li>결정 제목, 선택지, 배경 설명, 중요도</Li>
              <Li>리뷰 데이터: 만족도 점수, 재선택 의향, 배운 점</Li>
              <Li>AI 코치 채팅 내역</Li>
              <Li>서비스 이용 기록 (API 호출 횟수 등)</Li>
            </ul>
          </Section>

          <Section title="3. 수집 목적">
            <ul className="flex flex-col gap-2 list-none">
              <Li>서비스 제공 및 회원 식별</Li>
              <Li>AI 결정 코치 기능 제공 (과거 결정 패턴 분석)</Li>
              <Li>기간별 결정 분석 및 인사이트 제공</Li>
              <Li>서비스 남용 방지 (API 요청 제한)</Li>
            </ul>
          </Section>

          <Section title="4. 보유 및 이용 기간">
            <p>
              수집된 개인정보는 회원 탈퇴 또는 계정 삭제 요청 시까지 보유합니다.
              계정 삭제 시 모든 개인정보 및 결정 데이터는 즉시 파기됩니다.
            </p>
          </Section>

          <Section title="5. 개인정보의 제3자 제공 및 국외 이전">
            <p className="mb-4">서비스는 다음 외부 서비스를 사용하며, 이에 따라 개인정보가 국외로 이전될 수 있습니다.</p>
            <div className="flex flex-col gap-3">
              <ThirdParty
                name="Supabase Inc."
                purpose="데이터베이스 및 인증 서비스"
                country="미국"
                privacy="https://supabase.com/privacy"
              />
              <ThirdParty
                name="Anthropic PBC"
                purpose="AI 코치 응답 생성 (채팅 내용 처리)"
                country="미국"
                privacy="https://www.anthropic.com/privacy"
                note="입력된 데이터는 AI 모델 학습에 사용되지 않습니다."
              />
              <ThirdParty
                name="Google LLC"
                purpose="소셜 로그인 인증"
                country="미국"
                privacy="https://policies.google.com/privacy"
              />
              <ThirdParty
                name="Cloudflare Inc."
                purpose="웹 호스팅 및 CDN"
                country="미국"
                privacy="https://www.cloudflare.com/privacypolicy/"
              />
            </div>
          </Section>

          <Section title="6. 사용자의 권리">
            <p className="mb-3">사용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
            <ul className="flex flex-col gap-2 list-none">
              <Li>개인정보 열람 요청</Li>
              <Li>개인정보 정정 요청</Li>
              <Li>개인정보 삭제 요청 (계정 삭제)</Li>
              <Li>개인정보 처리 정지 요청</Li>
            </ul>
            <p className="mt-4">
              권리 행사는 서비스 내 설정 페이지에서 직접 계정을 삭제하거나,{' '}
              <a href="mailto:dlrbqls5126@gmail.com" style={{ color: '#d4a84b' }}>dlrbqls5126@gmail.com</a>으로 요청하실 수 있습니다.
              요청 접수 후 5영업일 이내에 처리합니다.
            </p>
          </Section>

          <Section title="7. 만 14세 미만 이용 제한">
            <p>
              본 서비스는 만 14세 미만 아동의 이용을 허용하지 않습니다.
              만 14세 미만임을 인지한 경우 즉시 해당 계정을 삭제합니다.
            </p>
          </Section>

          <Section title="8. 방침 변경">
            <p>
              본 방침이 변경될 경우 서비스 내 공지 또는 이메일을 통해 사전 고지합니다.
              변경된 방침은 공지 후 7일 뒤 효력이 발생합니다.
            </p>
          </Section>

        </div>

        <div className="mt-16 pt-8 flex gap-4 text-xs" style={{ borderTop: '1px solid rgba(184,137,42,0.08)', color: '#4a5a3a' }}>
          <Link href="/terms" style={{ color: '#6a7a60' }}>이용약관</Link>
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

function ThirdParty({ name, purpose, country, privacy, note }: {
  name: string; purpose: string; country: string; privacy: string; note?: string
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(18,24,14,0.5)', border: '1px solid rgba(184,137,42,0.08)' }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color: '#c8d8b0' }}>{name}</span>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(184,137,42,0.08)', color: '#b8892a' }}>{country}</span>
      </div>
      <p className="text-xs" style={{ color: '#6a7a60' }}>{purpose}</p>
      {note && <p className="text-xs mt-1" style={{ color: '#5a6a50' }}>{note}</p>}
      <a href={privacy} target="_blank" rel="noopener noreferrer" className="text-[10px] mt-2 inline-block" style={{ color: '#4a5a3a' }}>
        개인정보처리방침 보기 →
      </a>
    </div>
  )
}
