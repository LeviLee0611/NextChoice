export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aggregateInsightContext, buildInsightPrompt } from '@/lib/insights/aggregate'

const SYSTEM_PROMPT = `사용자의 결정 데이터를 보고 짧고 솔직하게 한국어로 피드백을 써주세요. 리포트나 분석 보고서가 아니라, 데이터를 같이 본 친구가 건네는 말처럼요.

출력 형식 (반드시 이 순서):
첫째 줄: 이 기간을 한 마디로 — 어떤 결정이 잘 됐는지, 어떤 패턴이 보이는지 핵심만. 수치 하나 포함. (마침표로 끝)
빈 줄
• 잘 됐던 부분 — 구체적으로 어떤 상황이나 카테고리, 왜 그랬을 것 같은지
• 아쉬웠던 부분 — 다음엔 어떻게 하면 좋을지 한 줄로
• 눈에 띄는 패턴 한 가지 (데이터에 명확히 보일 때만, 없으면 생략)

규칙:
- 마크다운 절대 금지 (#, **, ## 등 모두)
- 불릿은 • 기호만
- "~되었습니다", "분석 결과", "패턴이 관찰됩니다" 같은 AI 투 표현 금지
- 쉬운 말로, 짧게. 한 문장이 두 줄 넘으면 안 됨
- 총 280자 이내`

function periodToSince(period: string): string | undefined {
  const d = new Date()
  if (period === '1m') { d.setMonth(d.getMonth() - 1); return d.toISOString() }
  if (period === '3m') { d.setMonth(d.getMonth() - 3); return d.toISOString() }
  if (period === '6m') { d.setMonth(d.getMonth() - 6); return d.toISOString() }
  if (period === '1y') { d.setFullYear(d.getFullYear() - 1); return d.toISOString() }
  return undefined
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return new Response('AI not configured', { status: 503 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'all'
  const since = periodToSince(period)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const ctx = await aggregateInsightContext(supabase, user.id, since)
  if (!ctx) return Response.json({ insufficient: true })

  // Check cache
  const { data: cache } = await supabase
    .from('user_insight_cache')
    .select('content, decision_count, review_count')
    .eq('user_id', user.id)
    .eq('period', period)
    .maybeSingle()

  if (cache && cache.decision_count === ctx.total && cache.review_count === ctx.reviewed) {
    return new Response(cache.content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  // Cache miss — call Claude
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `내 결정 데이터:\n${buildInsightPrompt(ctx)}` }],
    }),
  })

  if (!anthropicRes.ok) return new Response('AI error', { status: 502 })

  // Stream to client + accumulate for cache
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  const reader = anthropicRes.body!.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  ;(async () => {
    let buf = ''
    let fullText = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw || raw === '[DONE]') continue
          try {
            const evt = JSON.parse(raw)
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              fullText += evt.delta.text
              await writer.write(encoder.encode(evt.delta.text))
            }
          } catch {}
        }
      }

      // Save to cache after stream completes
      if (fullText) {
        await supabase.from('user_insight_cache').upsert({
          user_id: user.id,
          period,
          content: fullText,
          decision_count: ctx.total,
          review_count: ctx.reviewed,
          computed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,period' })
      }
    } finally {
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  })
}
