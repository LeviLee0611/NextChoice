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

  const systemPrompt = `당신은 NextChoice의 개인 결정 코치입니다.

${ctxStr}

역할:
- 사용자가 고민하는 결정에 과거 패턴을 연결해 구체적인 조언을 해주세요
- 수치를 언급할 때는 실제 데이터를 인용하세요 (예: "커리어 결정에서 평균 만족도가 8.1이었으니...")
- 결정을 내릴 때 고려할 점과 주의할 점을 짚어주세요
- 답변은 2-3문단, 한국어로

마지막 답변에서는 자연스럽게 이 결정을 NextChoice에 기록해보길 권유하세요.`

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
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
