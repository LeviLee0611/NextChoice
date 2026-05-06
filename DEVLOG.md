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

---

## 2026.05.06

### 오늘 한 것

**디자인 시스템 (오래된 잉크 테마)**
- 전체 색 팔레트 확정: 짙은 올리브 블랙 배경 + 앰버/골드 메인 액센트 + 세이지 그린 서브
- Cinzel 폰트 추가 (타이틀/숫자용)
- 카드 좌→우 그라데이션 (#1a2016 → #0a0e08)
- 레이블별 역할 색 분리: 제목(크림), 카테고리(세이지), 중요도(코퍼), 선택지(틸), 확신도(앰버)
- 배경 radial gradient (앰버+올리브 glow)

**결정 타입 정의** (`src/types/decision.ts`)
- Decision 인터페이스
- ImportanceLevel (1~5), 이모지+레이블+설명 매핑
- Category 타입, CATEGORIES 배열
- 이후 `reason_not_chosen` 필드 추가

**`/decisions/new` — 결정 생성 폼**
- Server Action `createDecision` (`src/app/decisions/actions.ts`)
- NewDecisionForm 클라이언트 컴포넌트
- 중요도 선택: 레벨별 고유 색 (녹→틸→앰버→코퍼→크림슨), glow 효과
- 선택지 A vs B 구조
- 확신도 슬라이더 (앰버 강조)
- "결정을 새기다" 제출 버튼

**`/decisions` — 결정 리스트**
- Supabase에서 전체 결정 fetch, 최신순 정렬
- 카드에 제목/카테고리/중요도/날짜/선택한 옵션 표시
- 리뷰 날짜 지난 결정 "✦ 리뷰할 시간이에요" 앰버 표시
- 빈 상태 화면

**`/decisions/[id]` — 결정 상세**
- 중요도/선택지(선택한 쪽 강조)/확신도/이유/선택 안 한 이유/리뷰 날짜
- 리뷰 작성 후에는 리뷰 내용 표시 + "수정하기" 링크
- 리뷰 없으면 "리뷰 작성하기" 버튼

**`/decisions/[id]/review` — 리뷰 작성/수정**
- Server Action `createReview` (check-then-insert/update 패턴)
- 실제 결과 / 만족도(점수에 따라 색 변화) / 다시 선택 여부 / 예상 외 점 / 배운 점
- 기존 리뷰 있으면 폼에 값 미리 채워줌
- 제목 "결과를 돌아보다" / 수정 시 "기록을 수정하다"

**`/dashboard` — 통계 대시보드**
- 총 결정 수 / 리뷰 완료 비율 / 평균 만족도 (색상 자동 변화)
- 카테고리별 결정 수 + 평균 만족도
- 최근 결정 3개 + 리뷰 완료/미완료 표시

**`Navbar`** (`src/components/Navbar.tsx`)
- 상단 고정, 블러 배경
- 로고(NC) / 대시보드 / 결정 목록 / + 새 결정
- 현재 페이지 앰버 활성 표시
- /login 페이지에서 자동 숨김

**워크플로우 / 가드레일 정립**
- CLAUDE.md에 gstack / workflow / guardrails 섹션 추가
- Claude(구현) → Codex(1차 검토) → Claude(2차 검토) 확립
- Codex 검토 후 dashboard 보안/로직 5개 항목 수정

### 수정된 버그 및 이슈

| 문제 | 원인 | 해결 |
|------|------|------|
| Cloudflare 배포 실패 | `middleware.ts` deprecated + edge runtime 누락 | `proxy.ts`로 이름 변경, 함수명 `proxy`로, 동적 route에 `export const runtime = 'edge'` 추가 |
| Server Component 런타임 에러 | `onMouseEnter/Leave`를 Server Component에 사용 | Tailwind `hover:` 클래스로 교체 |
| `decision_reviews` 테이블 없음 | 초기 스키마 누락 | Supabase SQL Editor에서 직접 생성 |
| 리뷰 upsert 실패 | `onConflict` constraint 미인식 | check-then-insert/update 패턴으로 교체 |
| Hydration mismatch 경고 | Night Eye 브라우저 확장이 `<html>` 태그 수정 | `suppressHydrationWarning` 추가 |
| `.next` 캐시 TypeScript 오류 | stale 캐시 | `rm -rf .next` 후 재빌드 |

### 코딩 규칙 (이후에도 지킬 것)

- **동적 route**는 반드시 `export const runtime = 'edge'` 추가 (Cloudflare 필수)
- **Server Component**에 `onMouseEnter/Leave` 금지 → Tailwind `hover:` 사용
- **페이지마다** `supabase.auth.getUser()` + `redirect('/login')` 인증 확인
- **Supabase 쿼리**는 `{ data, error }` 둘 다 받고 error 처리
- **hover 효과**는 Client Component에서만 인라인 스타일로 처리
- **`.next` 캐시 오류** 나면 `rm -rf .next` 후 재빌드

### DB 현황

```
decisions
  id, user_id, title, category, importance_level,
  option_a, option_b, chosen_option,
  reason, reason_not_chosen,
  confidence, review_date, created_at

decision_reviews
  id, decision_id (unique), actual_result,
  satisfaction_score (1~10), unexpected_things,
  lesson_learned, would_choose_again, created_at
```

### 다음에 할 것
- 새 결정 작성 시 과거 인사이트 표시 (같은 카테고리 평균 만족도, 확신도 패턴) ✅

---

## 2026.05.06 (이어서)

### 오늘 추가한 것

**카테고리 인사이트 패널** (`/decisions/new`)
- `page.tsx`에서 서버사이드로 유저의 전체 decisions + reviews 조인 fetch
- 카테고리별 통계 계산: 결정 수, 리뷰 수, 평균 만족도, 재선택 비율, 확신도별 평균 만족도
- `CategoryInsightPanel` 컴포넌트: 카테고리 선택 즉시 과거 기록 표시
  - 결정 N회 · 리뷰 N회 완료
  - 평균 만족도 X/10 (색상 자동: 빨강/주황/초록)
  - 재선택 N%
  - 확신도 높을 때 만족도 X · 낮을 때 Y (둘 다 있을 때만 표시)
- 데이터 없으면 패널 미표시
- `page.tsx`에 `export const runtime = 'edge'` + auth check 추가

### 다음에 할 것
- 아직 미정 (유저에게 확인)
