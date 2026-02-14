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
      <div className="bg-gradient-to-b from-[#f3f6f5] via-[#f8f8f8] to-white">
        <ServicesSection />
        <ProcessSection />
      </div>
      <div className="bg-white">
        <GalleryPreviewSection />
        <ResultsSection />
      </div>
      <div className="bg-gradient-to-b from-white to-[#f3f6f5]">
        <TestimonialsSection />
      </div>
      <CtaSection />
    </SiteShell>
  );
}
