# NextChoice 보안 현황

영상 "친구가 바이브코딩으로 만든 서비스 5분만에 털었습니다" 체크리스트 기준으로 정리.

---

## 체크리스트 5가지

### ① 어드민 페이지 URL 직접 접근
**상태: ✅ 보호됨**
- `/admin/feedback/page.tsx` + `actions.ts` — `user.email !== process.env.ADMIN_EMAIL` 체크 후 `/`로 redirect
- `ADMIN_EMAIL`은 GitHub Secret → 빌드 주입, 클라이언트에 노출 없음

### ② Supabase RLS
**상태: ✅ 전체 활성화**
- `decisions`, `decision_reviews`, `chat_sessions`, `chat_messages`, `user_insight_cache`, `feedback`, `api_usage` 테이블 전부 RLS 켜져 있음
- 관리자 전용 작업(계정 삭제, 피드백 관리)은 `service_role` 키를 서버에서만 사용하는 Admin 클라이언트로 처리

### ③ 환경변수 노출
**상태: ✅ 안전**
- `NEXT_PUBLIC_` 접두어: `SUPABASE_URL`, `SUPABASE_ANON_KEY`만 — 둘 다 클라이언트 공개 설계된 키
- 서버 전용 (절대 클라이언트 노출 안 됨): `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`

### ④ 결제 금액 서버 검증
**상태: N/A (결제 미구현)**
- 결제 시스템 구현 시 반드시 서버에서 금액 재검증 필요 (토스페이먼츠/PortOne webhook 기준)

### ⑤ 에러 메시지 노출
**상태: ✅ 보호됨 (2026-05-15 수정)**
- 모든 Server Action의 `throw new Error(error.message)` → 일반 메시지로 교체
- Supabase DB 에러, 테이블명, 스키마 정보가 클라이언트에 노출되지 않음

---

## 추가 보안 조치

### 인증 & 인가
- 모든 API 라우트에서 `supabase.auth.getUser()` 인증 체크
- decisions, reviews, chat_sessions — DB 쿼리에 `eq('user_id', user.id)` 소유권 검증
- 계정 삭제 API — `confirm_phrase: '계정삭제하기'` 입력 필수 (CSRF + 실수 방지)

### 입력 유효성 검사
- 모든 Server Action — 타입, 길이, 허용 값 범위 서버사이드 검증
- 채팅 메시지 — 2000자 제한, 이력 40개 제한

### Rate Limiting
- AI 채팅: 30회/일 (DB RPC 기반)
- 인사이트 호출: 5회/일 (캐시 히트는 카운트 안 됨)
- **미적용**: 결정 생성, 피드백 제출 (추후 추가 예정)

### 보안 헤더 (2026-05-15 추가)
`next.config.ts`에 전체 라우트 적용:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### AI 프롬프트 인젝션 방지
- 사용자 입력 텍스트(lesson_learned 등)는 프롬프트에서 `[사용자 입력 끝]` 구분자로 격리

### 시드 데이터 라우트
- `/api/seed` — `NODE_ENV !== 'development'` 체크, 프로덕션에서 403 반환

---

## 남은 보안 과제

| 항목 | 우선순위 | 메모 |
|------|---------|------|
| 결정 생성 / 피드백 제출 rate limit | 중간 | 스팸 방지 |
| 결제 구현 시 금액 서버 검증 | 높음 | 토스페이먼츠/PortOne webhook |
| `/api/seed` 라우트 프로덕션 배포 전 삭제 또는 어드민 인증 추가 | 낮음 | 현재 NODE_ENV 체크로 막혀 있음 |
