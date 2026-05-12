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
      <footer className="py-12 px-8 text-center flex flex-col gap-3" style={{ borderTop: '1px solid rgba(184,137,42,0.08)' }}>
        <div className="flex items-center justify-center gap-4 text-xs">
          <a href="/privacy" className="footer-link">개인정보처리방침</a>
          <span style={{ color: '#1e2a1a' }}>·</span>
          <a href="/terms" className="footer-link">이용약관</a>
        </div>
        <p className="text-xs" style={{ color: '#1e2a18' }}>
          © 2026 NextChoice · 더 나은 선택, 더 나은 미래.
        </p>
      </footer>
    </div>
  )
}
