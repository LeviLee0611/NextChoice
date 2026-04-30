# NextChoice 개발일지

---

## 2026.04.30

### 오늘 한 것

**환경 세팅**
- GitHub 레포 생성 (Public) — github.com/LeviLee0611/NextChoice
- Git 초기화 및 원격 연결
- Next.js 16 프로젝트 생성 (TypeScript + Tailwind + App Router)

**Supabase 연결**
- Supabase 새 organization/프로젝트 생성
- DB 스키마 직접 작성 (decisions, decision_reviews 테이블, RLS 정책, 통계 View)
- .env.local에 URL/Anon Key 연결
- @supabase/supabase-js, @supabase/ssr 설치
- 브라우저용/서버용 Supabase 클라이언트 분리 구성

**Google OAuth 로그인**
- Google Cloud Console에서 OAuth 앱 생성
- Supabase Authentication에 Google provider 연결
- 로그인 페이지 (/login) 제작 — Google 로그인 버튼
- 인증 콜백 라우트 (/auth/callback) 구현
- 미들웨어로 비로그인 시 /login 자동 리다이렉트

**첫 커밋 & 푸시 완료**

### 확인된 것
- Google 로그인 → 콜백 → /dashboard 리다이렉트 정상 작동

### 다음에 할 것
- 결정 생성 (/decisions/new)
- 결정 리스트 (/decisions)
- 결정 상세 (/decisions/[id])
