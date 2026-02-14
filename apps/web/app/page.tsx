import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { CtaSection } from '@/components/sections/cta-section';
import { HeroSection } from '@/components/sections/hero-section';
import { ResultsSection } from '@/components/sections/results-section';
import { ServicesSection } from '@/components/sections/services-section';

/**
 * Composes the first release homepage sections.
 */
export default function HomePage(): JSX.Element {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ServicesSection />
        <ResultsSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
