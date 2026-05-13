/**
 * 합성 유저 200명 생성 스크립트 (ML 학습용)
 * 실행: node --env-file=.env.local scripts/generate-synthetic.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ── .env.local 파싱 ───────────────────────────────────────────
function parseEnvLocal() {
  try {
    const content = readFileSync('.env.local', 'utf-8')
    const env = {}
    for (const line of content.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const idx = t.indexOf('=')
      if (idx === -1) continue
      const key = t.slice(0, idx).trim()
      let val = t.slice(idx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      env[key] = val
    }
    return env
  } catch {
    return {}
  }
}

const env = parseEnvLocal()
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ .env.local에 NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.')
  process.exit(1)
}

if (!process.env.ALLOW_SYNTHETIC_SEED) {
  console.error('❌ 안전 잠금: ALLOW_SYNTHETIC_SEED=1 환경변수가 없습니다.')
  console.error('   실행: ALLOW_SYNTHETIC_SEED=1 node scripts/generate-synthetic.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── 헬퍼 ────────────────────────────────────────────────────
const randInt   = (min, max) => Math.floor(min + Math.random() * (max - min + 1))
const clamp     = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const pick      = (arr) => arr[Math.floor(Math.random() * arr.length)]
const pickN     = (arr, n) => {
  const s = [...arr]; const r = []
  for (let i = 0; i < n; i++) {
    const j = Math.floor(Math.random() * (s.length - i)) + i
    ;[s[i], s[j]] = [s[j], s[i]]
    r.push(s[i])
  }
  return r
}

// ── 10가지 페르소나 타입 ──────────────────────────────────────
// 각 타입은 뚜렷한 패턴을 가짐 → ML이 학습할 수 있는 신호
const PERSONA_TYPES = [
  {
    type: 'cautious_logical',
    label: '신중-논리형',
    glRange:   [3, 5],   // 논리적 성향
    confRange: [3, 6],   // 낮은 확신도
    tpRange:   [1, 2],   // 여유 있는 결정
    reviewRate: 0.85,
    catWeights: { 커리어: 3, 재정: 3, 관계: 2, 건강: 2, 생활: 3, 기타: 2 },
    // 패턴: 논리적(gl>=4) → 높은 만족도 / 직감적 → 낮은 만족도
    satisfFn: (gl, conf, tp, cat) => gl >= 4 ? randInt(7, 10) : randInt(3, 6),
  },
  {
    type: 'bold_intuitive',
    label: '대담-직감형',
    glRange:   [1, 3],   // 직감적 성향
    confRange: [7, 10],  // 높은 확신도
    tpRange:   [1, 3],
    reviewRate: 0.60,
    catWeights: { 커리어: 3, 재정: 2, 관계: 3, 건강: 2, 생활: 2, 기타: 3 },
    // 패턴: 직감적(gl<=2) → 높은 만족도
    satisfFn: (gl, conf, tp, cat) => gl <= 2 ? randInt(7, 10) : randInt(4, 7),
  },
  {
    type: 'anxious_avoidant',
    label: '불안-회피형',
    glRange:   [2, 4],
    confRange: [2, 5],   // 낮은 확신도
    tpRange:   [2, 3],   // 항상 압박감
    reviewRate: 0.50,
    catWeights: { 커리어: 2, 재정: 2, 관계: 3, 건강: 3, 생활: 2, 기타: 3 },
    // 패턴: 시간압박(tp=3) → 낮은 만족도
    satisfFn: (gl, conf, tp, cat) => tp >= 3 ? randInt(2, 5) : randInt(4, 7),
  },
  {
    type: 'confident_optimist',
    label: '자신감-낙관형',
    glRange:   [2, 4],
    confRange: [7, 10],  // 높은 확신도
    tpRange:   [1, 2],
    reviewRate: 0.70,
    catWeights: { 커리어: 3, 재정: 3, 관계: 2, 건강: 2, 생활: 3, 기타: 2 },
    // 패턴: 전반적으로 높은 만족도
    satisfFn: (gl, conf, tp, cat) => conf >= 8 ? randInt(7, 10) : randInt(6, 9),
  },
  {
    type: 'impulsive_regret',
    label: '충동-후회형',
    glRange:   [1, 2],   // 직감적
    confRange: [7, 10],  // 과잉 확신
    tpRange:   [2, 3],   // 급하게 결정
    reviewRate: 0.75,
    catWeights: { 커리어: 2, 재정: 3, 관계: 3, 건강: 2, 생활: 3, 기타: 2 },
    // 패턴: 높은 확신도지만 리뷰 후 후회 (낮은 만족도)
    satisfFn: (gl, conf, tp, cat) => conf >= 8 ? randInt(3, 6) : randInt(4, 7),
  },
  {
    type: 'perfectionist_analytical',
    label: '완벽주의-분석형',
    glRange:   [4, 5],   // 매우 논리적
    confRange: [3, 7],
    tpRange:   [1, 1],   // 절대 급하지 않음
    reviewRate: 0.90,
    catWeights: { 커리어: 4, 재정: 4, 관계: 1, 건강: 2, 생활: 2, 기타: 2 },
    // 패턴: gl=5 AND conf>=5 → 매우 높은 만족도
    satisfFn: (gl, conf, tp, cat) => gl >= 5 && conf >= 5 ? randInt(8, 10) : randInt(5, 8),
  },
  {
    type: 'balanced_reflective',
    label: '균형-성찰형',
    glRange:   [2, 4],
    confRange: [4, 7],
    tpRange:   [1, 2],
    reviewRate: 0.95,   // 거의 항상 리뷰
    catWeights: { 커리어: 2, 재정: 2, 관계: 3, 건강: 2, 생활: 3, 기타: 3 },
    // 패턴: 중간 만족도, 고른 분포
    satisfFn: (gl, conf, tp, cat) => randInt(5, 8),
  },
  {
    type: 'pressure_reactive',
    label: '압박-반응형',
    glRange:   [2, 4],
    confRange: [4, 7],
    tpRange:   [2, 3],   // 항상 압박감
    reviewRate: 0.65,
    catWeights: { 커리어: 3, 재정: 2, 관계: 2, 건강: 2, 생활: 3, 기타: 3 },
    // 패턴: 시간압박 낮을 때 높은 만족도 (tp가 3일 경우 낮음)
    satisfFn: (gl, conf, tp, cat) => tp <= 1 ? randInt(7, 10) : tp === 2 ? randInt(5, 8) : randInt(3, 6),
  },
  {
    type: 'experience_driven',
    label: '경험중시형',
    glRange:   [3, 5],
    confRange: [5, 8],
    tpRange:   [1, 2],
    reviewRate: 0.80,
    catWeights: { 커리어: 5, 재정: 4, 관계: 1, 건강: 2, 생활: 2, 기타: 1 },
    // 패턴: 커리어/재정 → 높은 만족도 (잘 아는 분야)
    satisfFn: (gl, conf, tp, cat) => ['커리어', '재정'].includes(cat) ? randInt(7, 10) : randInt(4, 7),
  },
  {
    type: 'social_relational',
    label: '사회적-관계중시형',
    glRange:   [2, 3],
    confRange: [5, 8],
    tpRange:   [1, 2],
    reviewRate: 0.75,
    catWeights: { 커리어: 2, 재정: 1, 관계: 5, 건강: 2, 생활: 3, 기타: 2 },
    // 패턴: 관계/생활 → 높은 만족도
    satisfFn: (gl, conf, tp, cat) => ['관계', '생활'].includes(cat) ? randInt(7, 10) : randInt(4, 7),
  },
]

// ── 결정 시나리오 풀 ─────────────────────────────────────────
const SCENARIOS = {
  커리어: [
    { title: '이직 제안 수락 여부',   option_a: '현재 직장 유지',    option_b: '이직',              impRange: [4, 5] },
    { title: '대학원 진학 결정',       option_a: '진학',              option_b: '취업 먼저',         impRange: [4, 5] },
    { title: '팀장 직책 수락 여부',    option_a: '수락',              option_b: '거절',              impRange: [3, 4] },
    { title: '연봉 협상 시도',         option_a: '협상 시도',         option_b: '현재 그대로 수락',   impRange: [3, 4] },
    { title: '사이드 프로젝트 착수',   option_a: '지금 시작',         option_b: '나중으로 미루기',    impRange: [2, 3] },
    { title: '해외 취업 기회 지원',    option_a: '지원',              option_b: '국내 유지',         impRange: [4, 5] },
    { title: '프리랜서 전환 여부',     option_a: '전환',              option_b: '정규직 유지',       impRange: [4, 5] },
    { title: '자격증 취득 도전',       option_a: '지금 도전',         option_b: '나중에',            impRange: [2, 3] },
    { title: '부서 이동 요청',         option_a: '요청',              option_b: '현 부서 유지',      impRange: [3, 4] },
    { title: '창업 아이디어 추진',     option_a: '추진',              option_b: '보류',              impRange: [4, 5] },
    { title: '스타트업 합류 제안',     option_a: '합류',              option_b: '거절',              impRange: [4, 5] },
    { title: '온라인 강의 수강',       option_a: '수강',              option_b: '독학',              impRange: [1, 2] },
  ],
  관계: [
    { title: '친구에게 큰돈 빌려주기', option_a: '빌려주기',          option_b: '거절',              impRange: [3, 4] },
    { title: '갈등 팀원과 직접 대화',  option_a: '직접 대화',         option_b: '시간이 해결하길',    impRange: [2, 3] },
    { title: '소개팅 나가기',          option_a: '나가기',            option_b: '거절',              impRange: [1, 2] },
    { title: '장거리 연애 지속 여부',  option_a: '지속',              option_b: '정리',              impRange: [4, 5] },
    { title: '오래된 친구와 거리 두기', option_a: '거리 두기',        option_b: '관계 유지',         impRange: [3, 4] },
    { title: '새로운 커뮤니티 참여',   option_a: '참여',              option_b: '안 함',             impRange: [1, 2] },
    { title: '가족 행사 참석 여부',    option_a: '참석',              option_b: '불참',              impRange: [2, 3] },
    { title: '멘토 관계 먼저 요청',    option_a: '먼저 연락',         option_b: '기회를 기다림',     impRange: [2, 3] },
  ],
  재정: [
    { title: '주식 투자 시작 여부',    option_a: '지금 시작',         option_b: '공부 더 후 시작',   impRange: [3, 4] },
    { title: '월세 vs 전세 선택',      option_a: '월세',              option_b: '전세 대출',         impRange: [4, 5] },
    { title: '보험 플랜 업그레이드',   option_a: '업그레이드',        option_b: '현행 유지',         impRange: [2, 3] },
    { title: '부업 시작 여부',         option_a: '시작',              option_b: '본업에 집중',       impRange: [3, 4] },
    { title: '저축 비율 조정',         option_a: '저축 늘리기',       option_b: '현행 유지',         impRange: [3, 4] },
    { title: '노트북 구매 타이밍',     option_a: '지금 구매',         option_b: '신제품 기다리기',   impRange: [2, 3] },
    { title: '투자 포트폴리오 재조정', option_a: '재조정',            option_b: '현행 유지',         impRange: [3, 4] },
    { title: '주택청약 납입 증액',     option_a: '증액',              option_b: '현행 유지',         impRange: [2, 3] },
  ],
  건강: [
    { title: '새 운동 루틴 시작',      option_a: '헬스장 등록',       option_b: '홈트레이닝',        impRange: [2, 3] },
    { title: '식단 변경 도전',         option_a: '도전',              option_b: '현행 유지',         impRange: [2, 3] },
    { title: '종합 건강검진 받기',     option_a: '종합검진',          option_b: '기본검진',          impRange: [2, 3] },
    { title: '명상 앱 구독',           option_a: '구독',              option_b: '무료로 사용',       impRange: [1, 2] },
    { title: '금주 한 달 도전',        option_a: '도전',              option_b: '현행 유지',         impRange: [2, 3] },
    { title: '수면 루틴 개선 시도',    option_a: '루틴 도입',         option_b: '현행 유지',         impRange: [1, 2] },
  ],
  생활: [
    { title: '이사 여부 결정',         option_a: '이사',              option_b: '현재 집 유지',      impRange: [3, 4] },
    { title: '반려동물 입양',          option_a: '입양',              option_b: '나중으로 미루기',   impRange: [3, 4] },
    { title: '디지털 디톡스 시도',     option_a: '실행',              option_b: '현행 유지',         impRange: [1, 2] },
    { title: '새벽 기상 루틴 도입',    option_a: '6시 기상',          option_b: '기존 시간 유지',    impRange: [1, 2] },
    { title: '주거 인테리어 투자',     option_a: '투자',              option_b: '현상 유지',         impRange: [2, 3] },
    { title: '요리 배우기 시작',       option_a: '시작',              option_b: '외식 유지',         impRange: [1, 2] },
    { title: '구독 서비스 정리',       option_a: '정리',              option_b: '유지',              impRange: [1, 2] },
    { title: '독서 모임 참여',         option_a: '참여',              option_b: '개인 독서 유지',    impRange: [1, 2] },
  ],
  기타: [
    { title: '연말 여행지 선택',       option_a: '해외',              option_b: '국내',              impRange: [2, 3] },
    { title: '혼자 vs 동반 여행',      option_a: '혼자',              option_b: '친구와',            impRange: [1, 2] },
    { title: '연간 목표 설정 방식',    option_a: 'OKR 방식',          option_b: '자유로운 목표',     impRange: [1, 2] },
    { title: '새로운 취미 시작',       option_a: '시작',              option_b: '현재 취미 유지',    impRange: [1, 2] },
    { title: '자원봉사 참여 여부',     option_a: '참여',              option_b: '안 함',             impRange: [1, 2] },
    { title: '블로그/SNS 시작',        option_a: '시작',              option_b: '안 함',             impRange: [2, 3] },
    { title: '취미 활동에 투자',       option_a: '투자',              option_b: '무료 방식 유지',    impRange: [1, 2] },
    { title: '개인 브랜딩 시작',       option_a: '시작',              option_b: '나중에',            impRange: [2, 3] },
  ],
}

const ACTUAL_RESULTS = {
  커리어: [
    '기대보다 좋은 환경이었고 성장 기회가 많았다.',
    '처음엔 어려웠지만 3개월 후 적응했고 만족스럽다.',
    '예상과 달리 팀 문화가 잘 맞지 않았다.',
    '도전적이었지만 결과적으로 올바른 선택이었다.',
    '빠르게 역량이 향상됐고 연봉도 올랐다.',
    '기대했던 것보다는 아쉬운 부분이 있었다.',
    '새로운 인맥이 생기고 커리어가 확장됐다.',
  ],
  관계: [
    '관계가 더 깊어졌고 서로를 더 잘 이해하게 됐다.',
    '처음엔 어색했지만 시간이 지나 자연스러워졌다.',
    '갈등이 해소되고 오히려 더 좋아졌다.',
    '서로 잘 맞지 않아 자연스럽게 멀어졌다.',
    '기대보다 좋은 결과를 얻었다.',
    '아쉬운 부분이 있지만 후회는 없다.',
  ],
  재정: [
    '3개월 후 여유자금이 생겼다.',
    '단기적으로는 부담이었지만 장기적으로 이득이었다.',
    '예상보다 수익이 좋았다.',
    '초반에 어려움이 있었지만 안정화됐다.',
    '목표한 금액을 달성했다.',
    '손실이 있었지만 배운 것도 많았다.',
  ],
  건강: [
    '체력이 눈에 띄게 좋아졌다.',
    '꾸준히 유지하고 있고 컨디션이 좋아졌다.',
    '처음엔 힘들었지만 한 달 후 습관이 됐다.',
    '스트레스가 크게 줄었다.',
    '지속하기 어려웠지만 효과는 있었다.',
  ],
  생활: [
    '삶의 질이 확실히 좋아졌다.',
    '처음엔 적응이 필요했지만 지금은 만족한다.',
    '환경 변화가 긍정적인 영향을 줬다.',
    '시간이 더 풍요롭게 느껴진다.',
    '기대만큼은 아니었지만 괜찮은 선택이었다.',
  ],
  기타: [
    '기대 이상의 경험이었다.',
    '새로운 시각을 얻었다.',
    '좋은 사람들을 만나고 배운 것이 많았다.',
    '계획대로 잘 됐다.',
    '처음엔 어색했지만 결국 좋은 선택이었다.',
  ],
}

// ── 카테고리 가중치 → 15개 카테고리 목록 생성 ───────────────
function sampleCategories(weights, count = 15) {
  const entries = Object.entries(weights)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  const result = []
  for (let i = 0; i < count; i++) {
    let r = Math.random() * total
    for (const [cat, w] of entries) {
      r -= w
      if (r <= 0) { result.push(cat); break }
    }
    if (result.length < i + 1) result.push(pick(Object.keys(weights)))
  }
  return result
}

// ── 날짜 생성 (2024-01 ~ 2025-10 사이에 분산) ───────────────
function sampleDates(count = 15) {
  const start = new Date('2024-01-01').getTime()
  const end   = new Date('2025-10-01').getTime()
  const dates = Array.from({ length: count }, () => new Date(start + Math.random() * (end - start)))
  return dates.sort((a, b) => a - b)
}

// ── 시나리오 선택 (카테고리별로 겹치지 않게) ─────────────────
function pickScenario(category, usedTitles) {
  const pool = SCENARIOS[category] ?? SCENARIOS['기타']
  const available = pool.filter(s => !usedTitles.has(s.title))
  if (available.length === 0) return pick(pool) // 전부 썼으면 재사용
  return pick(available)
}

// ── 페르소나 1명 생성 ─────────────────────────────────────────
function generatePersonaDecisions(pType) {
  const categories = sampleCategories(pType.catWeights, 15)
  const dates = sampleDates(15)
  const usedTitles = new Set()

  return categories.map((cat, i) => {
    const scenario = pickScenario(cat, usedTitles)
    usedTitles.add(scenario.title)

    const gl    = randInt(...pType.glRange)
    const conf  = randInt(...pType.confRange)
    const tp    = randInt(...pType.tpRange)
    const imp   = randInt(...scenario.impRange)
    const chosen = pick(['A', 'B'])
    const satRaw = pType.satisfFn(gl, conf, tp, cat)
    const sat   = clamp(Math.round(satRaw), 1, 10)
    const hasReview = Math.random() < pType.reviewRate

    // 리뷰 날짜: 결정 후 1~5개월
    const reviewDate = new Date(dates[i])
    reviewDate.setMonth(reviewDate.getMonth() + randInt(1, 5))
    const reviewTooRecent = reviewDate > new Date('2026-05-01')

    return {
      decision: {
        title:            scenario.title,
        category:         cat,
        importance_level: imp,
        option_a:         scenario.option_a,
        option_b:         scenario.option_b,
        chosen_option:    chosen,
        confidence:       conf,
        gut_vs_logic:     gl,
        time_pressure:    tp,
        reason:           null,
        created_at:       dates[i].toISOString(),
      },
      review: (hasReview && !reviewTooRecent) ? {
        satisfaction_score:   sat,
        would_choose_again:   sat >= 6,
        actual_result:        pick(ACTUAL_RESULTS[cat] ?? ACTUAL_RESULTS['기타']),
        created_at:           reviewDate.toISOString(),
      } : null,
    }
  })
}

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  // ── 연결 사전 점검 ─────────────────────────────────────────
  console.log('🔍 Supabase 연결 확인 중...')
  const { error: pingErr } = await supabase.from('synthetic_personas').select('id').limit(1)
  if (pingErr) {
    console.error('❌ 테이블 접근 실패:', pingErr.message)
    console.error('')
    console.error('해결 방법:')
    console.error('  1. Supabase Dashboard → SQL Editor에서 synthetic-tables.sql 실행')
    console.error('  2. .env.local에 SUPABASE_SERVICE_ROLE_KEY 있는지 확인')
    return
  }
  console.log('✅ 연결 성공\n')
  console.log('🚀 합성 유저 200명 생성 시작...\n')

  const PERSONAS_PER_TYPE = 20
  let totalPersonas = 0
  let totalDecisions = 0
  let totalReviews = 0

  for (const pType of PERSONA_TYPES) {
    process.stdout.write(`  ${pType.label} (${pType.type}) 생성 중...`)

    for (let idx = 0; idx < PERSONAS_PER_TYPE; idx++) {
      // 1. 페르소나 삽입
      const { data: persona, error: pErr } = await supabase
        .from('synthetic_personas')
        .insert({ persona_type: pType.type, persona_index: idx })
        .select('id')
        .single()

      if (pErr || !persona) {
        console.error(`\n❌ 페르소나 삽입 실패 [${pType.type} #${idx}]:`, pErr?.message ?? '데이터 없음')
        if (idx === 0) {
          console.error('   → 첫 번째 삽입부터 실패. 테이블 구조를 확인하세요.')
          return
        }
        continue
      }

      // 2. 결정 15개 생성 + 삽입
      const rows = generatePersonaDecisions(pType)
      const decisions = rows.map(r => ({ ...r.decision, persona_id: persona.id }))

      const { data: insertedDecisions, error: dErr } = await supabase
        .from('synthetic_decisions')
        .insert(decisions)
        .select('id, created_at')

      if (dErr || !insertedDecisions) {
        console.error(`\n❌ 결정 삽입 실패:`, dErr?.message)
        continue
      }

      totalDecisions += insertedDecisions.length

      // 3. 리뷰 삽입
      const reviews = rows
        .map((r, i) => r.review ? { ...r.review, decision_id: insertedDecisions[i].id, persona_id: persona.id } : null)
        .filter(Boolean)

      if (reviews.length > 0) {
        const { error: rErr } = await supabase.from('synthetic_reviews').insert(reviews)
        if (rErr) console.error(`\n⚠️ 리뷰 삽입 오류:`, rErr.message)
        else totalReviews += reviews.length
      }

      totalPersonas++
    }

    console.log(` ✓ ${PERSONAS_PER_TYPE}명`)
  }

  console.log(`\n✅ 완료!`)
  console.log(`   페르소나: ${totalPersonas}명`)
  console.log(`   결정:     ${totalDecisions}개`)
  console.log(`   리뷰:     ${totalReviews}개`)
}

main().catch(err => {
  console.error('❌ 오류:', err)
  process.exit(1)
})
