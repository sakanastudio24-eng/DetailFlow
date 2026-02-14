import { SiteShell } from '@/components/layout/site-shell';
import { CtaSection } from '@/components/sections/cta-section';
import { GalleryPreviewSection } from '@/components/sections/gallery-preview-section';
import { HeroSection } from '@/components/sections/hero-section';
import { ProcessSection } from '@/components/sections/process-section';
import { ResultsSection } from '@/components/sections/results-section';
import { ServicesSection } from '@/components/sections/services-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';

/**
 * Composes a long-form homepage with trust, process, and conversion sections.
 */
export default function HomePage(): JSX.Element {
  return (
    <SiteShell>
      <HeroSection />
      <ServicesSection />
      <ProcessSection />
      <GalleryPreviewSection />
      <ResultsSection />
      <TestimonialsSection />
      <CtaSection />
    </SiteShell>
  );
}
