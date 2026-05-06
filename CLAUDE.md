@AGENTS.md

## gstack

- **Framework**: Next.js 16.2.4 — App Router, TypeScript, Tailwind CSS v4
- **Database / Auth**: Supabase (PostgreSQL + RLS + Google OAuth)
- **Deployment**: Cloudflare Pages — all dynamic routes require `export const runtime = 'edge'`
- **Fonts**: Cinzel (display/titles), Geist (body)
- **Routing convention**: `src/proxy.ts` (not `middleware.ts`) — Next.js 16 requirement
- **Server Actions**: defined in `src/app/decisions/actions.ts` with `'use server'`
