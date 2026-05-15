'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

const steps = [
  {
    number: '01',
    title: '결정을 기록하세요',
    description: '선택지, 선택 이유, 확신 수준을 기록합니다. 나중에 실제 결과와 배운 점도 추가할 수 있어요.',
    color: '#d4a84b',
  },
  {
    number: '02',
    title: 'AI가 패턴을 학습합니다',
    description: '기록이 쌓일수록 AI는 나의 결정 성향, 카테고리별 만족도, 후회 패턴을 분석합니다.',
    color: '#8aad7a',
  },
  {
    number: '03',
    title: '과거가 지금을 돕습니다',
    description: '새로운 결정을 고민할 때, AI 코치가 비슷한 과거 결정을 찾아 그때 배운 점을 연결해줍니다.',
    color: '#d4a84b',
  },
]

export default function HowItWorksSection() {
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true, margin: '-60px' })

  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(138,173,122,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 40 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-5" style={{ color: '#d4a84b' }}>
            작동 원리
          </p>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: 300,
            color: '#f5f0e8',
            lineHeight: 1.15,
          }}>
            기록이 쌓일수록<br />
            <em style={{ fontStyle: 'italic', color: '#d4a84b' }}>조언이 깊어집니다</em>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-6 relative">
          {/* Connector line */}
          <div className="absolute left-8 top-16 bottom-16 w-px hidden md:block"
            style={{ background: 'linear-gradient(to bottom, rgba(184,137,42,0.3), rgba(138,173,122,0.3), rgba(184,137,42,0.3))' }}
          />

          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* Link to detail page */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={titleInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-14"
        >
          <Link
            href="/how-it-works"
            className="text-xs font-semibold tracking-widest uppercase transition-colors"
            style={{ color: '#d4a84b' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f5f0e8'}
            onMouseLeave={e => e.currentTarget.style.color = '#d4a84b'}
          >
            더 자세히 알아보기 →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-8 items-start p-8 rounded-2xl"
      style={{
        background: 'rgba(18,24,14,0.6)',
        border: '1px solid rgba(184,137,42,0.1)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: `rgba(${step.color === '#d4a84b' ? '184,137,42' : '138,173,122'},0.1)`, border: `1px solid ${step.color}30` }}
      >
        <span style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.4rem',
          fontWeight: 300,
          color: step.color,
        }}>
          {step.number}
        </span>
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <h3 className="text-base font-semibold" style={{ color: '#f5f0e8' }}>{step.title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: '#9aaa8a' }}>{step.description}</p>
      </div>
    </motion.div>
  )
}
