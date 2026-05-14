'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

const FREE_FEATURES = [
  '결정 기록 무제한',
  '기본 통계 · 대시보드',
  '기간 비교 분석',
  'AI Choice 코치 10턴/일',
  'AI 인사이트 3회/일',
]

const PRO_FEATURES = [
  'Free의 모든 것',
  'AI Choice 코치 50턴/일',
  'AI 인사이트 15회/일',
  '유저 맞춤형 AI 코치',
  'ML 기반 패턴 인사이트',
  '우선 지원',
]

const EARLY_BIRD_FEATURES = [
  'Pro의 모든 것',
  '평생 Pro 이용',
  '신규 기능 우선 체험',
]

export default function PricingSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="pricing" ref={ref} className="relative py-32 px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '900px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(184,137,42,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6"
        >
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-5" style={{ color: '#d4a84b' }}>
            요금제
          </p>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: 300,
            color: '#f5f0e8',
            lineHeight: 1.15,
          }}>
            Free로 시작하고,<br />
            <em style={{ fontStyle: 'italic', color: '#d4a84b' }}>Pro로 성장하세요</em>
          </h2>
        </motion.div>

        {/* Early bird banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm"
            style={{
              background: 'rgba(184,137,42,0.08)',
              border: '1px solid rgba(184,137,42,0.25)',
              color: '#d4a84b',
            }}
          >
            <span style={{ fontSize: '0.75rem' }}>✦</span>
            <span>선착순 <strong>100명</strong> 한정 — Early Bird ₩99,000 일시불로 평생 Pro</span>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-7 flex flex-col gap-5"
            style={{
              background: 'rgba(18,24,14,0.7)',
              border: '1px solid rgba(184,137,42,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: '#9aaa8a' }}>Free</p>
              <div className="flex items-end gap-2">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.6rem', fontWeight: 300, color: '#f5f0e8', lineHeight: 1 }}>₩0</span>
                <span className="text-sm mb-0.5" style={{ color: '#9aaa8a' }}>/월</span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: '#8a9a80' }}>영원히 무료</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#c8d5bc' }}>
                  <span style={{ color: '#7aad6a', fontSize: '0.65rem' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/login" className="mt-auto block text-center py-3 rounded-xl text-sm font-semibold tracking-wide transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#9aaa8a', border: '1px solid rgba(255,255,255,0.07)' }}>
              무료로 시작하기
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl p-7 flex flex-col gap-5"
            style={{
              background: 'rgba(18,24,14,0.85)',
              border: '1px solid rgba(184,137,42,0.35)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 50px rgba(184,137,42,0.07)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.6), transparent)' }}
            />
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: '#d4a84b' }}>Pro</p>
              <div className="flex items-end gap-2">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.6rem', fontWeight: 300, color: '#f5f0e8', lineHeight: 1 }}>₩3,900</span>
                <span className="text-sm mb-0.5" style={{ color: '#9aaa8a' }}>/월</span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: '#8a9a80' }}>매월 결제</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#d8e8c8' }}>
                  <span style={{ color: '#d4a84b', fontSize: '0.65rem' }}>✦</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/login"
              className="mt-auto block text-center py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 100%)', color: '#0d1008', boxShadow: '0 4px 20px rgba(184,137,42,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 30px rgba(184,137,42,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(184,137,42,0.25)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Pro 시작하기
            </Link>
          </motion.div>

          {/* Early Bird */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl p-7 flex flex-col gap-5"
            style={{
              background: 'rgba(22,20,10,0.95)',
              border: '1px solid rgba(212,168,75,0.6)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 60px rgba(184,137,42,0.14)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{ background: 'linear-gradient(to right, transparent, rgba(212,168,75,0.9), transparent)' }}
            />
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase"
                style={{ background: 'linear-gradient(135deg, #b8892a, #f0cc70)', color: '#0d1008' }}>
                선착순 100명
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: '#f0cc70' }}>Early Bird</p>
              <div className="flex items-end gap-2">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.6rem', fontWeight: 300, color: '#f5f0e8', lineHeight: 1 }}>₩99,000</span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: '#c4903e' }}>일시불 · 평생 Pro 이용</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {EARLY_BIRD_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#f0e8c8' }}>
                  <span style={{ color: '#f0cc70', fontSize: '0.65rem' }}>✦</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/login"
              className="mt-auto block text-center py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #c4903e 0%, #f0cc70 100%)', color: '#0d1008', boxShadow: '0 4px 20px rgba(240,204,112,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 30px rgba(240,204,112,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(240,204,112,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              얼리버드 참여하기
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-8 flex flex-col items-center gap-3"
        >
          <p className="text-xs" style={{ color: '#7a8a70' }}>
            얼리버드 100명 마감 후 Pro ₩3,900/월로 전환
          </p>
          <Link href="/pricing" className="text-xs font-semibold tracking-widest uppercase transition-colors"
            style={{ color: '#d4a84b' }}
          >
            기능 상세 비교 보기 →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
