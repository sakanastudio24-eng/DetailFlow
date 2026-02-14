import Link from 'next/link';

/**
 * Renders the top hero section with primary call-to-actions.
 */
export function HeroSection(): JSX.Element {
  return (
    <section className="relative overflow-hidden bg-brandBlack text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8cc0d655,transparent_55%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          <p className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-waterBlue">
            Mobile First Service
          </p>
          <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            Premium car detailing for daily drivers and show builds.
          </h1>
          <p className="mt-4 max-w-prose text-sm text-white/80 sm:text-base">
            We clean, restore, and protect interiors and exteriors with package-based detailing built for convenience.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/booking" className="rounded-full bg-deepRed px-5 py-3 text-sm font-semibold text-white hover:bg-white hover:text-brandBlack">
              Start Booking
            </Link>
            <Link href="/services" className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white hover:text-brandBlack">
              View Services
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
          <h2 className="font-heading text-xl font-bold">Why clients choose us</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/85">
            <li>Consistent process for paint, trim, glass, and interior materials.</li>
            <li>Transparent package pricing with optional upgrades.</li>
            <li>Setmore handoff for final appointment scheduling.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
