export type Category = '커리어' | '관계' | '재정' | '건강' | '생활' | '기타'

export type ImportanceLevel = 1 | 2 | 3 | 4 | 5

export const IMPORTANCE_LABELS: Record<ImportanceLevel, { emoji: string; label: string; desc: string }> = {
  1: { emoji: '🌱', label: '잔물결', desc: '내일이면 잊을 것' },
  2: { emoji: '💭', label: '고민됨', desc: '며칠은 생각날 것' },
  3: { emoji: '😤', label: '진지함', desc: '몇 주는 영향 받을 것' },
  4: { emoji: '😰', label: '무거움', desc: '몇 달은 영향 받을 것' },
  5: { emoji: '🔥', label: '인생결정', desc: '평생 기억할 것' },
}

export const CATEGORIES: Category[] = ['커리어', '관계', '재정', '건강', '생활', '기타']

export const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const
export type OptionKey = typeof OPTION_KEYS[number]

export interface Decision {
  id: string
  user_id: string
  title: string
  category: Category
  importance_level: ImportanceLevel
  option_a: string
  option_b: string
  option_c: string | null
  option_d: string | null
  chosen_option: OptionKey
  reason: string | null
  reason_not_chosen: string | null
  confidence: number
  review_date: string | null
  created_at: string
}
