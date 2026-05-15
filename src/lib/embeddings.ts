export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000),
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data[0].embedding as number[]
  } catch (err) {
    console.error('[embeddings] generateEmbedding failed', err)
    return null
  }
}

export function buildDecisionText(params: {
  title: string
  category: string
  chosenOption: string
  reason?: string | null
  actualResult?: string | null
  lessonLearned?: string | null
}): string {
  const parts = [
    `결정: ${params.title}`,
    `카테고리: ${params.category}`,
  ]
  if (params.reason) parts.push(`선택 이유: ${params.reason}`)
  if (params.actualResult) parts.push(`실제 결과: ${params.actualResult}`)
  if (params.lessonLearned) parts.push(`배운 점: ${params.lessonLearned}`)
  return parts.join('\n')
}
