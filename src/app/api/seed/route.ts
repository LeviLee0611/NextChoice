// DEV-ONLY: 테스트용 시드 데이터. 배포 전 삭제할 것.
export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type SeedItem = {
  title: string; category: string; importance_level: number
  option_a: string; option_b: string; chosen_option: 'A' | 'B'
  confidence: number; gut_vs_logic: number; time_pressure: number
  created_at: string
  review?: { satisfaction_score: number; would_choose_again: boolean; actual_result: string; lesson_learned?: string }
}

// 50개 결정 — 2025-01 ~ 2026-05 분산, 만족도 트렌드: 초반 낮음→후반 높음
const DECISIONS: SeedItem[] = [
  // ── 2025-01 ──────────────────────────────────────────
  { title: '이직 제안 수락 여부', category: '커리어', importance_level: 5, option_a: '현재 직장 유지', option_b: '이직', chosen_option: 'B', confidence: 5, gut_vs_logic: 3, time_pressure: 2, created_at: '2025-01-10T09:00:00Z', review: { satisfaction_score: 5, would_choose_again: false, actual_result: '새 회사 문화가 기대와 달랐다', lesson_learned: '면접 때 팀 문화를 더 꼼꼼히 확인했어야 했다' } },
  { title: '대학원 진학 결정', category: '커리어', importance_level: 5, option_a: '진학', option_b: '취업', chosen_option: 'B', confidence: 6, gut_vs_logic: 5, time_pressure: 3, created_at: '2025-01-22T09:00:00Z', review: { satisfaction_score: 6, would_choose_again: true, actual_result: '실무 경험을 먼저 쌓는 게 맞았다', lesson_learned: '이론보다 경험이 먼저다' } },
  // ── 2025-02 ──────────────────────────────────────────
  { title: '친구에게 큰돈 빌려주기', category: '관계', importance_level: 4, option_a: '빌려주기', option_b: '거절', chosen_option: 'A', confidence: 4, gut_vs_logic: 2, time_pressure: 2, created_at: '2025-02-05T09:00:00Z', review: { satisfaction_score: 3, would_choose_again: false, actual_result: '관계가 불편해졌고 돈도 늦게 돌려받았다', lesson_learned: '돈과 인간관계는 분리해야 한다' } },
  { title: '운동 루틴 시작', category: '건강', importance_level: 2, option_a: '헬스장 등록', option_b: '홈트레이닝', chosen_option: 'A', confidence: 7, gut_vs_logic: 3, time_pressure: 1, created_at: '2025-02-18T09:00:00Z', review: { satisfaction_score: 7, would_choose_again: true, actual_result: '꾸준히 가고 있고 체력이 좋아졌다' } },
  // ── 2025-03 ──────────────────────────────────────────
  { title: '주식 투자 시작 여부', category: '재정', importance_level: 3, option_a: '지금 시작', option_b: '공부 더 하고 시작', chosen_option: 'A', confidence: 5, gut_vs_logic: 3, time_pressure: 2, created_at: '2025-03-08T09:00:00Z', review: { satisfaction_score: 5, would_choose_again: false, actual_result: '준비 없이 시작해서 초반에 손실이 있었다', lesson_learned: '투자는 공부가 먼저다' } },
  { title: '부모님 선물 예산 결정', category: '관계', importance_level: 2, option_a: '예산 늘리기', option_b: '현재 예산 유지', chosen_option: 'A', confidence: 8, gut_vs_logic: 2, time_pressure: 1, created_at: '2025-03-20T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '부모님이 많이 기뻐하셨다', lesson_learned: '소중한 사람에게 쓰는 돈은 아깝지 않다' } },
  { title: '새 노트북 구매 타이밍', category: '재정', importance_level: 3, option_a: '지금 구매', option_b: '신제품 출시 기다리기', chosen_option: 'B', confidence: 6, gut_vs_logic: 5, time_pressure: 1, created_at: '2025-03-28T09:00:00Z', review: { satisfaction_score: 6, would_choose_again: true, actual_result: '3개월 기다렸지만 가격 차이가 크지 않았다' } },
  // ── 2025-04 ──────────────────────────────────────────
  { title: '팀장 직책 수락 여부', category: '커리어', importance_level: 4, option_a: '수락', option_b: '거절', chosen_option: 'A', confidence: 6, gut_vs_logic: 4, time_pressure: 2, created_at: '2025-04-10T09:00:00Z', review: { satisfaction_score: 7, would_choose_again: true, actual_result: '힘들지만 성장하는 느낌이 있다', lesson_learned: '불편한 역할이 더 크게 성장시킨다' } },
  { title: '이사 여부 결정', category: '생활', importance_level: 4, option_a: '이사', option_b: '현재 집 유지', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 2, created_at: '2025-04-22T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '새 동네가 훨씬 좋다', lesson_learned: '환경 변화가 삶의 질을 높인다' } },
  // ── 2025-05 ──────────────────────────────────────────
  { title: '사이드 프로젝트 착수', category: '커리어', importance_level: 3, option_a: '시작', option_b: '나중에', chosen_option: 'A', confidence: 6, gut_vs_logic: 3, time_pressure: 1, created_at: '2025-05-05T09:00:00Z', review: { satisfaction_score: 7, would_choose_again: true, actual_result: '느리지만 계속 진행 중이다', lesson_learned: '언제나 지금이 시작하기 좋은 때다' } },
  { title: '비건 식단 한 달 도전', category: '건강', importance_level: 2, option_a: '도전', option_b: '안 함', chosen_option: 'A', confidence: 7, gut_vs_logic: 3, time_pressure: 1, created_at: '2025-05-15T09:00:00Z', review: { satisfaction_score: 6, would_choose_again: false, actual_result: '체중은 줄었지만 지속하기 어려웠다' } },
  { title: '여행 동반자 결정', category: '관계', importance_level: 2, option_a: '친구 A와 가기', option_b: '혼자 가기', chosen_option: 'B', confidence: 7, gut_vs_logic: 3, time_pressure: 2, created_at: '2025-05-28T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '혼자 여행이 생각보다 훨씬 좋았다', lesson_learned: '혼자만의 시간은 자기 자신을 더 잘 알게 해준다' } },
  // ── 2025-06 ──────────────────────────────────────────
  { title: '월세 vs 전세 선택', category: '재정', importance_level: 5, option_a: '월세', option_b: '전세 대출', chosen_option: 'B', confidence: 7, gut_vs_logic: 5, time_pressure: 3, created_at: '2025-06-12T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '장기적으로 더 유리했다', lesson_learned: '단기 비용보다 장기 관점으로 재정 결정을 해야 한다' } },
  { title: '클라이언트 계약 수락', category: '커리어', importance_level: 3, option_a: '수락', option_b: '거절', chosen_option: 'A', confidence: 6, gut_vs_logic: 4, time_pressure: 2, created_at: '2025-06-25T09:00:00Z', review: { satisfaction_score: 7, would_choose_again: true, actual_result: '예상보다 좋은 협업이었다' } },
  // ── 2025-07 ──────────────────────────────────────────
  { title: '반려식물 키우기 시작', category: '생활', importance_level: 1, option_a: '시작', option_b: '안 함', chosen_option: 'A', confidence: 8, gut_vs_logic: 2, time_pressure: 1, created_at: '2025-07-08T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '집이 훨씬 포근해졌다' } },
  { title: '소개팅 나가기', category: '관계', importance_level: 2, option_a: '나가기', option_b: '거절', chosen_option: 'A', confidence: 5, gut_vs_logic: 2, time_pressure: 1, created_at: '2025-07-18T09:00:00Z', review: { satisfaction_score: 5, would_choose_again: false, actual_result: '서로 잘 맞지 않았다' } },
  { title: '온라인 강의 수강 결정', category: '커리어', importance_level: 2, option_a: '수강', option_b: '독학', chosen_option: 'A', confidence: 8, gut_vs_logic: 4, time_pressure: 1, created_at: '2025-07-28T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '체계적으로 배울 수 있었다', lesson_learned: '구조화된 학습이 독학보다 효율적이다' } },
  // ── 2025-08 ──────────────────────────────────────────
  { title: '개인 브랜딩 시작 여부', category: '커리어', importance_level: 3, option_a: '블로그/SNS 시작', option_b: '안 함', chosen_option: 'A', confidence: 6, gut_vs_logic: 3, time_pressure: 1, created_at: '2025-08-05T09:00:00Z', review: { satisfaction_score: 7, would_choose_again: true, actual_result: '기회가 늘어났다', lesson_learned: '꾸준히 기록하는 사람이 이긴다' } },
  { title: '명상 앱 구독', category: '건강', importance_level: 1, option_a: '구독', option_b: '유튜브로 무료 사용', chosen_option: 'A', confidence: 7, gut_vs_logic: 3, time_pressure: 1, created_at: '2025-08-18T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '스트레스 관리에 실제로 도움이 됐다' } },
  { title: '팀원과의 갈등 해결 방식', category: '관계', importance_level: 3, option_a: '직접 대화', option_b: '시간이 해결해주길 기다림', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 2, created_at: '2025-08-28T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '오히려 관계가 더 좋아졌다', lesson_learned: '갈등은 빨리 해결할수록 좋다' } },
  // ── 2025-09 ──────────────────────────────────────────
  { title: '해외 컨퍼런스 참석', category: '커리어', importance_level: 3, option_a: '참석', option_b: '불참', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 2, created_at: '2025-09-10T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '새로운 인맥과 인사이트를 얻었다', lesson_learned: '네트워킹 기회는 놓치지 말자' } },
  { title: '저축 비율 조정', category: '재정', importance_level: 3, option_a: '저축 늘리기', option_b: '현행 유지', chosen_option: 'A', confidence: 8, gut_vs_logic: 5, time_pressure: 1, created_at: '2025-09-22T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '3개월 후 여유자금이 생겼다' } },
  // ── 2025-10 ──────────────────────────────────────────
  { title: '고양이 입양', category: '생활', importance_level: 3, option_a: '입양', option_b: '나중에', chosen_option: 'A', confidence: 9, gut_vs_logic: 2, time_pressure: 2, created_at: '2025-10-05T09:00:00Z', review: { satisfaction_score: 10, would_choose_again: true, actual_result: '삶이 훨씬 풍요로워졌다', lesson_learned: '마음이 이미 답을 알고 있을 때는 고민하지 말자' } },
  { title: '부업 시작 여부', category: '재정', importance_level: 3, option_a: '시작', option_b: '본업에 집중', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 1, created_at: '2025-10-18T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '소득이 늘어났고 새로운 스킬도 생겼다' } },
  { title: '친구 창업 합류 제안', category: '커리어', importance_level: 5, option_a: '합류', option_b: '거절', chosen_option: 'B', confidence: 7, gut_vs_logic: 5, time_pressure: 3, created_at: '2025-10-28T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '회사가 6개월 후 어려움을 겪었다', lesson_learned: '좋은 아이디어보다 팀이 더 중요하다' } },
  // ── 2025-11 ──────────────────────────────────────────
  { title: '연말 여행지 선택', category: '생활', importance_level: 2, option_a: '유럽', option_b: '동남아', chosen_option: 'B', confidence: 7, gut_vs_logic: 3, time_pressure: 2, created_at: '2025-11-10T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '비용 대비 만족도가 훨씬 높았다' } },
  { title: '연봉 협상 시도 여부', category: '커리어', importance_level: 4, option_a: '협상 시도', option_b: '그냥 받아들이기', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 2, created_at: '2025-11-22T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '10% 인상 성공', lesson_learned: '요구하지 않으면 아무것도 바뀌지 않는다' } },
  // ── 2025-12 ──────────────────────────────────────────
  { title: '내년 목표 설정 방식', category: '기타', importance_level: 2, option_a: 'OKR 방식', option_b: '자유로운 목표', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 1, created_at: '2025-12-05T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '목표 달성률이 높아졌다' } },
  { title: '건강검진 종합 받기', category: '건강', importance_level: 3, option_a: '종합검진', option_b: '기본검진', chosen_option: 'A', confidence: 8, gut_vs_logic: 5, time_pressure: 1, created_at: '2025-12-15T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '조기에 작은 문제를 발견했다', lesson_learned: '건강은 예방이 치료보다 낫다' } },
  { title: '연말 지출 계획', category: '재정', importance_level: 2, option_a: '예산 엄격히 지키기', option_b: '유연하게 쓰기', chosen_option: 'A', confidence: 8, gut_vs_logic: 5, time_pressure: 2, created_at: '2025-12-26T09:00:00Z', review: { satisfaction_score: 7, would_choose_again: true, actual_result: '새해에 여유 자금이 있었다' } },
  // ── 2026-01 ──────────────────────────────────────────
  { title: '팀 확장 채용 결정', category: '커리어', importance_level: 4, option_a: '지금 채용', option_b: '6개월 후로 미루기', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 2, created_at: '2026-01-08T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '팀 역량이 크게 올라갔다' } },
  { title: '주거 환경 개선 투자', category: '생활', importance_level: 3, option_a: '인테리어 투자', option_b: '현상 유지', chosen_option: 'A', confidence: 8, gut_vs_logic: 3, time_pressure: 1, created_at: '2026-01-20T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '집에 있는 시간이 더 즐거워졌다', lesson_learned: '매일 쓰는 공간에 투자하는 건 좋은 선택이다' } },
  // ── 2026-02 ──────────────────────────────────────────
  { title: '멘토 관계 시작 요청', category: '관계', importance_level: 3, option_a: '먼저 연락', option_b: '기회를 기다림', chosen_option: 'A', confidence: 7, gut_vs_logic: 3, time_pressure: 1, created_at: '2026-02-05T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '큰 도움을 받고 있다', lesson_learned: '먼저 손을 내밀면 대부분 긍정적으로 반응한다' } },
  { title: '새 업무 툴 도입', category: '커리어', importance_level: 2, option_a: '도입', option_b: '기존 방식 유지', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 1, created_at: '2026-02-18T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '업무 효율이 20% 올랐다' } },
  { title: '재정 목표 재설정', category: '재정', importance_level: 4, option_a: '더 공격적인 목표', option_b: '현실적인 목표', chosen_option: 'B', confidence: 8, gut_vs_logic: 5, time_pressure: 1, created_at: '2026-02-26T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '달성 가능한 목표가 동기부여에 더 효과적이었다' } },
  // ── 2026-03 ──────────────────────────────────────────
  { title: '스타트업 고문 역할 수락', category: '커리어', importance_level: 4, option_a: '수락', option_b: '거절', chosen_option: 'A', confidence: 8, gut_vs_logic: 4, time_pressure: 2, created_at: '2026-03-10T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '다양한 관점을 갖게 됐다' } },
  { title: '저탄수화물 식단 도전', category: '건강', importance_level: 2, option_a: '도전', option_b: '현행 유지', chosen_option: 'A', confidence: 6, gut_vs_logic: 3, time_pressure: 1, created_at: '2026-03-22T09:00:00Z', review: { satisfaction_score: 7, would_choose_again: true, actual_result: '에너지 레벨이 높아졌다' } },
  // ── 2026-04 ──────────────────────────────────────────
  { title: '장기 투자 포트폴리오 재조정', category: '재정', importance_level: 4, option_a: '재조정', option_b: '현행 유지', chosen_option: 'A', confidence: 8, gut_vs_logic: 5, time_pressure: 1, created_at: '2026-04-05T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '리스크가 줄었다', lesson_learned: '정기적인 포트폴리오 점검은 필수다' } },
  { title: '주말 디지털 디톡스', category: '생활', importance_level: 2, option_a: '실행', option_b: '안 함', chosen_option: 'A', confidence: 8, gut_vs_logic: 3, time_pressure: 1, created_at: '2026-04-15T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '주말이 훨씬 풍요로워졌다', lesson_learned: '연결 해제가 오히려 더 많은 것을 준다' } },
  { title: '중요한 협상 전략 결정', category: '커리어', importance_level: 4, option_a: '강경 전략', option_b: '협력적 접근', chosen_option: 'B', confidence: 8, gut_vs_logic: 4, time_pressure: 2, created_at: '2026-04-25T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '양쪽 모두 만족하는 결과', lesson_learned: 'win-win이 항상 더 지속가능하다' } },
  // ── 2026-05 (리뷰 없음 — 최근 결정) ──────────────────
  { title: '새 팀원 온보딩 방식', category: '커리어', importance_level: 3, option_a: '집중 교육 1주일', option_b: '점진적 적응', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 2, created_at: '2026-05-02T09:00:00Z' },
  { title: '건강보험 플랜 업그레이드', category: '건강', importance_level: 3, option_a: '업그레이드', option_b: '현행 유지', chosen_option: 'A', confidence: 7, gut_vs_logic: 5, time_pressure: 2, created_at: '2026-05-05T09:00:00Z' },
  { title: '개인 프로젝트 오픈소스 공개', category: '커리어', importance_level: 3, option_a: '공개', option_b: '비공개 유지', chosen_option: 'A', confidence: 8, gut_vs_logic: 3, time_pressure: 1, created_at: '2026-05-08T09:00:00Z' },
  // ── 추가 7개 (전체 50개 맞추기) ──────────────────────
  { title: '독서 모임 참여', category: '관계', importance_level: 1, option_a: '참여', option_b: '안 함', chosen_option: 'A', confidence: 7, gut_vs_logic: 2, time_pressure: 1, created_at: '2025-04-05T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '좋은 사람들을 많이 만났다' } },
  { title: '자격증 취득 도전', category: '커리어', importance_level: 3, option_a: '도전', option_b: '나중에', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 2, created_at: '2025-06-05T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '합격했고 연봉 협상에 도움이 됐다', lesson_learned: '자격증은 빠를수록 좋다' } },
  { title: '점심 루틴 변경', category: '건강', importance_level: 1, option_a: '집밥 도시락', option_b: '회사 근처 식당', chosen_option: 'A', confidence: 6, gut_vs_logic: 4, time_pressure: 1, created_at: '2025-08-12T09:00:00Z', review: { satisfaction_score: 7, would_choose_again: true, actual_result: '건강이 좋아지고 비용도 절약됐다' } },
  { title: '업무 방식 변경 제안', category: '커리어', importance_level: 3, option_a: '제안하기', option_b: '현행 유지', chosen_option: 'A', confidence: 7, gut_vs_logic: 4, time_pressure: 2, created_at: '2025-09-28T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '팀 전체 효율이 올라갔다' } },
  { title: '주택청약 납입 증액', category: '재정', importance_level: 3, option_a: '증액', option_b: '현행 유지', chosen_option: 'A', confidence: 8, gut_vs_logic: 5, time_pressure: 1, created_at: '2025-11-05T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '점수가 올라갔다', lesson_learned: '작은 차이가 나중에 크게 작용한다' } },
  { title: '새벽 기상 루틴 시도', category: '생활', importance_level: 2, option_a: '6시 기상', option_b: '7시 30분 유지', chosen_option: 'A', confidence: 6, gut_vs_logic: 3, time_pressure: 1, created_at: '2026-01-15T09:00:00Z', review: { satisfaction_score: 8, would_choose_again: true, actual_result: '하루가 훨씬 풍요로워졌다', lesson_learned: '아침 시간을 내 것으로 만들어야 한다' } },
  { title: '커뮤니티 운영 참여', category: '관계', importance_level: 2, option_a: '운영진 합류', option_b: '일반 멤버', chosen_option: 'A', confidence: 7, gut_vs_logic: 3, time_pressure: 1, created_at: '2026-03-15T09:00:00Z', review: { satisfaction_score: 9, would_choose_again: true, actual_result: '깊은 인맥이 생겼다' } },
]

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not available in production', { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // 기존 시드 데이터 초기화 여부
  const reset = new URL(req.url).searchParams.get('reset') === 'true'
  if (reset) {
    await supabase.from('decisions').delete().eq('user_id', user.id)
  }

  const errors: string[] = []
  let inserted = 0
  let reviewed = 0

  for (const d of DECISIONS) {
    const { review, ...fields } = d
    const { data: dec, error } = await supabase
      .from('decisions')
      .insert({ user_id: user.id, ...fields, reason: null, reason_not_chosen: null, review_date: null })
      .select('id')
      .single()

    if (error || !dec) { errors.push(error?.message ?? 'insert failed'); continue }
    inserted++

    if (review) {
      const { error: revErr } = await supabase
        .from('decision_reviews')
        .insert({ decision_id: dec.id, unexpected_things: null, ...review })
      if (revErr) errors.push(revErr.message)
      else reviewed++
    }
  }

  return Response.json({ inserted, reviewed, total: DECISIONS.length, errors })
}
