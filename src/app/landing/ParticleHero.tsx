'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; opacity: number; color: string
}

export default function ParticleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const c = canvasRef.current as HTMLCanvasElement
    const ctx = c.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    const colors = ['#d4a84b', '#b8892a', '#8aad7a', '#e8dfc8', '#6b8f5e']

    function resize() {
      c.width = window.innerWidth
      c.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Init particles
    particlesRef.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    function draw() {
      ctx.clearRect(0, 0, c.width, c.height)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const p of particlesRef.current) {
        // Subtle mouse attraction
        const dx = mx - p.x
        const dy = my - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200 && dist > 0) {
          p.vx += (dx / dist) * 0.008
          p.vy += (dy / dist) * 0.008
        }

        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = c.width
        if (p.x > c.width) p.x = 0
        if (p.y < 0) p.y = c.height
        if (p.y > c.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
      }

      // Draw connections between nearby particles
      ctx.globalAlpha = 1
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i]
          const b = particlesRef.current[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = '#d4a84b'
            ctx.globalAlpha = (1 - dist / 100) * 0.08
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    show: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.18, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    }),
  }

  return (
    <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '100vh' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div style={{
          position: 'absolute', top: '20%', left: '15%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(184,137,42,0.06) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(80,160,70,0.05) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
        }} />
      </div>

      {/* Content */}
      <div className="relative text-center px-6 max-w-5xl mx-auto" style={{ zIndex: 2 }}>
        <motion.p
          custom={0} variants={fadeUp} initial="hidden" animate="show"
          className="text-xs font-semibold tracking-[0.3em] uppercase mb-8"
          style={{ color: '#d4a84b' }}
        >
          AI 기반 의사결정 코치
        </motion.p>

        <motion.h1
          custom={1} variants={fadeUp} initial="hidden" animate="show"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 300,
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            color: '#e8dfc8',
          }}
        >
          Make Better<br />
          <span style={{
            background: 'linear-gradient(135deg, #d4a84b 0%, #f0cc70 50%, #b8892a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Decisions
          </span>
          {' '}with AI
        </motion.h1>

        <motion.p
          custom={2} variants={fadeUp} initial="hidden" animate="show"
          className="mt-8 text-lg leading-relaxed max-w-xl mx-auto"
          style={{ color: '#a0b090', fontFamily: 'var(--font-geist-sans)' }}
        >
          커리어, 재정, 관계, 일상의 모든 선택을 위한 개인 AI 코치.
          결정을 기록하고, 결과에서 배우고, 매번 더 나은 선택을.
        </motion.p>

        <motion.div
          custom={3} variants={fadeUp} initial="hidden" animate="show"
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #b8892a, #d4a84b)',
              color: '#0d1008',
              boxShadow: '0 0 30px rgba(184,137,42,0.3), 0 4px 20px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 50px rgba(184,137,42,0.5), 0 4px 20px rgba(0,0,0,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(184,137,42,0.3), 0 4px 20px rgba(0,0,0,0.4)')}
          >
            코칭 시작하기
            <span style={{ fontSize: '1rem' }}>→</span>
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(184,137,42,0.25)',
              color: '#e8dfc8',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,137,42,0.6)'; e.currentTarget.style.background = 'rgba(184,137,42,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,137,42,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            어떻게 작동하나요
          </a>
        </motion.div>

        <motion.div
          custom={4} variants={fadeUp} initial="hidden" animate="show"
          className="mt-20 flex justify-center"
        >
          <div style={{ animation: 'bounce 2s infinite' }}>
            <div style={{
              width: '1px', height: '60px',
              background: 'linear-gradient(to bottom, rgba(184,137,42,0.6), transparent)',
              margin: '0 auto',
            }} />
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.4; }
        }
      `}</style>
    </section>
  )
}
