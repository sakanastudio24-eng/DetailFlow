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
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#eef4f2_0%,#f7f8f8_45%,#ffffff_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,#8cc0d622,transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,#56070f16,transparent_35%)]" />
        <div className="relative">
          <ServicesSection />
          <ProcessSection />
        </div>
      </div>
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f6f7f7_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,#8cc0d61f,transparent_40%)]" />
        <div className="relative">
          <GalleryPreviewSection />
          <ResultsSection />
        </div>
      </div>
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#f7f8f7_0%,#eef3f1_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,#56070f14,transparent_35%)]" />
        <div className="relative">
          <TestimonialsSection />
        </div>
      </div>
      <CtaSection />
    </SiteShell>
  );
}
