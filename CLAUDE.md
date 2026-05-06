@AGENTS.md

## gstack

- **Framework**: Next.js 16.2.4 — App Router, TypeScript, Tailwind CSS v4
- **Database / Auth**: Supabase (PostgreSQL + RLS + Google OAuth)
- **Deployment**: Cloudflare Pages — all dynamic routes require `export const runtime = 'edge'`
- **Fonts**: Cinzel (display/titles), Geist (body)
- **Routing convention**: `src/proxy.ts` (not `middleware.ts`) — Next.js 16 requirement
- **Server Actions**: defined in `src/app/decisions/actions.ts` with `'use server'`

## workflow

코드 작업은 아래 순서를 따른다.

1. **Claude** — 기능 구현 + 빌드 확인 + git push
2. **Codex** — 1차 검토 (보안, 로직 오류, 개선점)
3. **Claude** — Codex 피드백 반영 여부 판단 + 2차 검토

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
