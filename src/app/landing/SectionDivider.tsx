'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function SectionDivider({ label }: { label?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className="relative flex flex-col items-center justify-center py-14 px-6 overflow-hidden">
      {/* Subtle center glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div style={{
          width: '300px', height: '1px',
          background: 'radial-gradient(ellipse, rgba(184,137,42,0.15) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }} />
      </div>

      {/* Label */}
      {label && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xs font-semibold tracking-[0.4em] uppercase mb-5"
          style={{ color: '#d4a84b' }}
        >
          {label}
        </motion.p>
      )}

      {/* Line with center diamond */}
      <div className="flex items-center w-full max-w-2xl">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 h-px origin-right"
          style={{ background: 'linear-gradient(to left, rgba(184,137,42,0.55), transparent)' }}
        />
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mx-4 text-base"
          style={{ color: '#d4a84b' }}
        >
          ✦
        </motion.span>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 h-px origin-left"
          style={{ background: 'linear-gradient(to right, rgba(184,137,42,0.55), transparent)' }}
        />
      </div>
    </div>
  )
}
