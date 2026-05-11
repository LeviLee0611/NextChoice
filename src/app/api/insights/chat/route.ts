export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aggregateInsightContext, buildInsightPrompt } from '@/lib/insights/aggregate'

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return new Response('AI not configured', { status: 503 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const messages: Message[] = body?.messages
  if (!Array.isArray(messages) || messages.length === 0) return new Response('No messages', { status: 400 })
  if (messages.length > 20) return new Response('Too many messages', { status: 400 })
  const validRoles = new Set(['user', 'assistant'])
  for (const m of messages) {
    if (!validRoles.has(m.role)) return new Response('Invalid role', { status: 400 })
    if (typeof m.content !== 'string' || m.content.length > 2000) return new Response('Message too long', { status: 400 })
  }
  if (messages[messages.length - 1].role !== 'user') return new Response('Last message must be user', { status: 400 })

  const ctx = await aggregateInsightContext(supabase, user.id)
  const ctxStr = ctx
    ? `이 사용자의 과거 의사결정 데이터:\n${buildInsightPrompt(ctx)}`
    : '아직 충분한 결정 데이터가 없습니다.'

  const systemPrompt = `당신은 NextChoice의 결정 코치입니다. 사용자가 중요한 결정을 앞두고 있을 때 도움을 줍니다.

${ctxStr}

역할:
- 사용자의 고민을 듣고 구체적인 시각과 선택지를 제시해주세요
- 과거 데이터가 있다면 연결해서 언급하세요 ("이전에 커리어 결정에서 만족도가 높았으니...")
- 딱딱한 분석보다 친구처럼 솔직하게 이야기해주세요
- 답변 마지막에는 항상 이렇게 제안하세요: "이 결정을 NextChoice에 기록해볼까요? '네'라고 하시면 초안을 만들어드릴게요."

형식 규칙:
- ** ** 같은 마크다운 절대 사용 금지
- 강조는 문장 구조나 줄바꿈으로 표현하세요
- 자연스러운 대화체로만 작성하세요

사용자가 '네', '응', '좋아', 'yes' 등 긍정 응답을 하면:
반드시 아래 형식의 JSON만 출력하고 다른 텍스트는 절대 붙이지 마세요:
{"draft":true,"title":"결정 제목","category":"커리어|관계|재정|건강|생활|기타","option_a":"선택지 A","option_b":"선택지 B","option_c":"선택지 C(없으면 null)","context":"배경 설명","importance_level":3}

JSON 외 텍스트 금지. 카테고리는 반드시 위 6개 중 하나.`

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      stream: true,
      system: systemPrompt,
      messages,
    }),
  })

  if (!anthropicRes.ok) return new Response('AI error', { status: 502 })

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  const reader = anthropicRes.body!.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  ;(async () => {
    let buf = ''
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
          if (!raw) continue
          try {
            const evt = JSON.parse(raw)
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              await writer.write(encoder.encode(evt.delta.text))
            }
          } catch {}
        }
      }
    } finally {
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
