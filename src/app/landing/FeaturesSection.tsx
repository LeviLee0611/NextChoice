'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const features = [
  {
    icon: '✦',
    title: 'AI 결정 코치',
    description: '어떤 고민이든 AI 코치와 함께 이야기해보세요. 과거의 선택 패턴을 기억해 맥락에 맞는 솔직한 조언을 드립니다.',
    glow: 'rgba(184,137,42,0.15)',
    from: { x: -60, opacity: 0 },
  },
  {
    icon: '⬡',
    title: '기간 비교 분석',
    description: '두 기간의 결정 품질을 나란히 비교하세요. 어떤 카테고리에서 성장했는지, 어디서 실수했는지 한눈에 확인할 수 있습니다.',
    glow: 'rgba(80,160,70,0.1)',
    from: { y: 60, opacity: 0 },
  },
  {
    icon: '◈',
    title: '패턴 기반 조언',
    description: 'AI가 나의 결정 히스토리를 학습합니다. 과거의 패턴과 현재의 선택을 연결해 혼자서는 발견하지 못했을 인사이트를 제공합니다.',
    glow: 'rgba(184,137,42,0.1)',
    from: { y: 60, opacity: 0 },
  },
  {
    icon: '◎',
    title: '성장 추적',
    description: '만족도 점수, 카테고리별 트렌드, 후회율을 시간순으로 추적하세요. 의사결정자로서 내가 어디서 성장하고 있는지 정확히 알 수 있습니다.',
    glow: 'rgba(80,160,70,0.15)',
    from: { x: 60, opacity: 0 },
  },
]

function FeatureCard({ f, i }: { f: typeof features[0]; i: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={f.from}
      animate={inView ? { x: 0, y: 0, opacity: 1 } : f.from}
      transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="relative group rounded-2xl p-8 flex flex-col gap-5 cursor-default"
      style={{
        background: 'rgba(18, 24, 14, 0.7)',
        border: '1px solid rgba(184,137,42,0.12)',
        backdropFilter: 'blur(20px)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(184,137,42,0.4)'
        e.currentTarget.style.boxShadow = `0 0 40px ${f.glow}, 0 20px 60px rgba(0,0,0,0.3)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(184,137,42,0.12)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Top glow on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.6), transparent)' }}
      />

      <span style={{ fontSize: '1.6rem', color: '#d4a84b' }}>{f.icon}</span>

      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#e8dfc8', fontFamily: 'var(--font-geist-sans)' }}>
          {f.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: '#6a7a60' }}>
          {f.description}
        </p>
      </div>

      <div className="mt-auto pt-2 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-colors duration-200"
        style={{ color: '#b8892a' }}
      >
        자세히 보기
        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </div>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true, margin: '-60px' })

  return (
    <section id="features" className="relative py-32 px-6">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(184,137,42,0.03) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 40 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="text-center mb-20"
        >
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-5" style={{ color: '#d4a84b' }}>
            NextChoice가 하는 것
          </p>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: 300,
            color: '#e8dfc8',
            lineHeight: 1.15,
          }}>
            자신 있게 선택하기 위한<br />
            <em style={{ fontStyle: 'italic', color: '#d4a84b' }}>모든 도구가 여기에</em>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
