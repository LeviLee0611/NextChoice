'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

export default function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-40 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 60%, rgba(184,137,42,0.07) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 40%, rgba(80,160,70,0.04) 0%, transparent 60%)',
        }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative">
        <motion.p
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xs font-semibold tracking-[0.3em] uppercase mb-8"
          style={{ color: '#d4a84b' }}
        >
          지금 시작하세요
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 300,
            lineHeight: 1.1,
            color: '#f5f0e8',
          }}
        >
          현명한 선택이<br />
          <em style={{ fontStyle: 'italic', color: '#d4a84b' }}>당신의 미래를 만듭니다.</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="mt-6 text-base leading-relaxed max-w-lg mx-auto"
          style={{ color: '#c8d5bc' }}
        >
          결정을 기록하고, 결과를 돌아보고,<br />
          최고의 선택을 하게 됩니다.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="mt-12"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #b8892a 0%, #d4a84b 50%, #b8892a 100%)',
              backgroundSize: '200% 100%',
              color: '#0d1008',
              boxShadow: '0 0 60px rgba(184,137,42,0.35), 0 8px 30px rgba(0,0,0,0.5)',
              fontSize: '0.9rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 80px rgba(184,137,42,0.55), 0 8px 30px rgba(0,0,0,0.5)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 0 60px rgba(184,137,42,0.35), 0 8px 30px rgba(0,0,0,0.5)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            지금 무료로 시작하기
            <span style={{ fontSize: '1.1rem' }}>✦</span>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-xs"
          style={{ color: '#7a8a70' }}
        >
          Google 로그인 · 얼리버드 100명 Pro 평생 무료
        </motion.p>
      </div>
    </section>
  )
}
