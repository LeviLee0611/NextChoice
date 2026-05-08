@AGENTS.md

## gstack

- **Framework**: Next.js 16.2.4 — App Router, TypeScript, Tailwind CSS v4
- **Database / Auth**: Supabase (PostgreSQL + RLS + Google OAuth)
- **Deployment**: Cloudflare Pages — all dynamic routes require `export const runtime = 'edge'`
- **Fonts**: Cormorant Garamond (display/titles/logo), Geist (body)
- **Routing convention**: 각 page/action의 `getUser()` + `redirect('/login')` — proxy.ts 없음
- **Server Actions**: defined in `src/app/decisions/actions.ts` with `'use server'`

## workflow

코드 작업은 아래 순서를 따른다.

1. **Claude** — 기능 구현 + 빌드 확인
2. **사용자** — 로컬(`npm run dev`)에서 직접 확인
3. **사용자가 push 요청 시** — Claude가 git push (명시적으로 요청할 때만)
4. **Codex** — 1차 검토 (보안, 로직 오류, 개선점)
5. **Claude** — Codex 피드백 반영 여부 판단 + 2차 검토

**배포 룰:**
- push ≠ 배포. push는 코드 공유, 배포는 별도 수동 트리거
- 배포는 GitHub Actions → `workflow_dispatch` 수동 실행으로만 (자동 배포 없음)
- 배포 타이밍: 기능 단위로 완성됐을 때, 사용자가 배포 요청할 때

**Codex 검토 시점** (이때만 돌린다):
- 새 페이지/기능 완성됐을 때
- DB 스키마, 인증, Server Action 코드 변경 시
- 배포 전

**Codex 검토 생략** (굳이 안 해도 됨):
- UI 색상/텍스트 수정
- 단순 버그 픽스
- 타입 정의 변경

**Codex에 쓸 프롬프트 템플릿:**
```
[폴더 또는 파일] 코드 검토해줘. 보안, 로직 오류, 개선점 위주로.
```

## web-app portability

이 프로젝트는 **웹과 앱을 병행 운영**한다. 코드를 짤 때 항상 이 기준을 따른다.

### 전환 계획
- 웹: Next.js (현재) → 계속 유지
- 앱: Expo + React Native (추후 별도 프로젝트로 시작)
- 두 플랫폼이 **같은 Supabase 프로젝트**를 공유 — 백엔드 변경 없음

### 재사용 가능한 것 (지금부터 이 구조를 지킨다)
- `src/types/` — TypeScript 타입 (웹/앱 공통 사용 가능하게 유지)
- `src/lib/` — Supabase 클라이언트, 순수 유틸 함수
- 비즈니스 로직 / 유효성 검사 — UI와 분리된 순수 함수로 작성
- 색상/디자인 토큰 — JS 상수 파일(`src/lib/theme.ts`)로 분리 지향

### 코드 작성 원칙 (항상 지킬 것)

**1. 비즈니스 로직은 UI 밖에**
Supabase 쿼리, 유효성 검사, 데이터 변환은 컴포넌트 안에 쓰지 않는다.
`src/lib/` 또는 커스텀 훅으로 분리. 앱에서도 그대로 가져다 쓸 수 있어야 한다.

**2. 색상/테마는 JS 상수로**
인라인 `'#d4a84b'` 대신 `theme.AMBER` 방식으로 점진적으로 이동.
CSS 변수는 웹 전용이라 앱에서 쓸 수 없다.

**3. Server Actions는 웹 전용임을 인지**
`actions.ts`의 Server Actions는 Next.js에서만 동작한다.
내부의 유효성 검사 로직(`parseDecisionFields` 등)은 분리해서 앱에서도 재사용 가능하게 둔다.
앱에서는 Supabase 클라이언트를 직접 호출 (RLS가 보안을 담당).

**4. 타입은 반드시 `src/types/`에**
인라인 타입 정의 금지. 언제든 공통 패키지로 분리할 수 있도록.

### 하지 말 것
- Supabase 쿼리를 컴포넌트 안에 직접 작성하기
- 색상값을 여러 파일에 중복 하드코딩하기
- Next.js 전용 API에 비즈니스 로직 결합하기

## guardrails

이 프로젝트가 길을 잃지 않기 위한 기준.

**핵심 질문 — 기능 추가 전 항상 물어볼 것:**
> "이게 사용자의 다음 선택을 더 낫게 만드는가?"
> NO면 지금 당장은 만들지 않는다.

**하지 말 것:**
- AI 기능을 데이터 없이 먼저 넣기 (데이터가 먼저다)
- 기능을 한 번에 여러 개 추가하기
- DB 필드를 "나중에 쓸 수도 있으니까" 이유로 추가하기
- 일기/메모 앱처럼 만들기 (기록이 목적이 아니라 개선이 목적)

**개발 순서 — 이 순서를 지킨다:**
1. ✅ 결정 생성 / 리스트 / 상세
2. ✅ 리뷰 입력
3. → 대시보드 (통계: 평균 만족도, 카테고리별)
4. → 다음 결정 화면에 인사이트 표시
5. → AI 분류 + 성향 분석 + 조언 (데이터 충분히 쌓인 후)

**성공 기준:**
> "이 앱을 쓰고 나서 다음 선택이 더 쉬워졌는가?"
