'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: 10000, suffix: '+', label: '기록된 결정', sublabel: '계속 증가 중' },
  { value: 95, suffix: '%', label: '사용자 만족도', sublabel: '전체 카테고리 기준' },
  { value: 24, suffix: '/7', label: 'AI 코칭', sublabel: '언제든지 이용 가능' },
]

function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    const duration = 1800
    const start = performance.now()
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.floor(eased * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target])

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function StatsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      {/* Gold divider top */}
      <div className="w-full h-px mb-20" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.3), transparent)' }} />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(184,137,42,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center text-xs font-semibold tracking-[0.3em] uppercase mb-16"
          style={{ color: '#d4a84b' }}
        >
          숫자로 보는 NextChoice
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="text-center"
            >
              <div style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(3.5rem, 7vw, 5.5rem)',
                fontWeight: 300,
                lineHeight: 1,
                background: 'linear-gradient(135deg, #d4a84b, #f0cc70)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                <CountUp target={s.value} suffix={s.suffix} active={inView} />
              </div>
              <p className="mt-3 text-base font-semibold" style={{ color: '#e8dfc8' }}>{s.label}</p>
              <p className="mt-1 text-xs tracking-wide" style={{ color: '#5a6a50' }}>{s.sublabel}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full h-px mt-20" style={{ background: 'linear-gradient(to right, transparent, rgba(184,137,42,0.3), transparent)' }} />
    </section>
  )
}
