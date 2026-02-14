import Link from 'next/link';

/**
 * Renders the homepage hero with high-contrast heading and CTA group.
 */
export function HeroSection(): JSX.Element {
  return (
    <section className="relative overflow-hidden bg-brandBlack text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#8cc0d62e,transparent_60%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="fade-in-up">
          <p className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-waterBlue">
            Mobile Detailing, Premium Finish
          </p>
          <h1 className="mt-4 font-heading text-5xl font-semibold leading-tight sm:text-7xl">
            Keep your vehicle
            <span className="block">showroom ready.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/80 sm:text-xl">
            Complete detail plans for interiors and exteriors, with multi-vehicle booking designed for fast scheduling.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/booking" className="rounded-full bg-deepRed px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-[#6e0912]">
              Book Now
            </Link>
            <Link href="/services" className="rounded-full border border-white/45 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white hover:text-brandBlack">
              Explore Services
            </Link>
          </div>
        </div>

        <aside className="fade-in-up rounded-[28px] border border-white/20 bg-white/10 p-6 backdrop-blur-md">
          <h2 className="font-heading text-3xl font-semibold">What you can do here</h2>
          <ul className="mt-5 space-y-4 text-sm text-white/80">
            <li className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">Build service plans for multiple vehicles in one dock.</li>
            <li className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">Submit intake details once and keep booking data organized.</li>
            <li className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">Finish schedule confirmation through Setmore handoff.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
