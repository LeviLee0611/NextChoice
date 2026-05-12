import LandingNav from './landing/LandingNav'
import ParticleHero from './landing/ParticleHero'
import FeaturesSection from './landing/FeaturesSection'
import StatsSection from './landing/StatsSection'
import CTASection from './landing/CTASection'

export default function Home() {
  return (
    <div style={{ background: '#111210', minHeight: '100vh', overflowX: 'hidden' }}>
      <LandingNav />

      <ParticleHero />
      <FeaturesSection />
      <StatsSection />
      <CTASection />

      {/* Footer */}
      <footer className="py-12 px-8 text-center" style={{ borderTop: '1px solid rgba(184,137,42,0.08)' }}>
        <p className="text-xs" style={{ color: '#2d3e28' }}>
          © 2026 NextChoice · 더 나은 선택, 더 나은 미래.
        </p>
      </footer>
    </div>
  )
}
