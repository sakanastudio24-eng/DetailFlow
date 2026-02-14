import { SiteShell } from '@/components/layout/site-shell';
import { CtaSection } from '@/components/sections/cta-section';
import { HeroSection } from '@/components/sections/hero-section';
import { ResultsSection } from '@/components/sections/results-section';
import { ServicesSection } from '@/components/sections/services-section';

/**
 * Composes the homepage sections for first-screen conversion.
 */
export default function HomePage(): JSX.Element {
  return (
    <SiteShell>
      <HeroSection />
      <ServicesSection />
      <ResultsSection />
      <CtaSection />
    </SiteShell>
  );
}
