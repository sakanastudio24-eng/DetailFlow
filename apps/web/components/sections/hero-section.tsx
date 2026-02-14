import Link from 'next/link';

/**
 * Renders a full-viewport landing hero with primary conversion actions.
 */
export function HeroSection(): JSX.Element {
  return (
    <section className="landing-hero relative overflow-hidden bg-brandBlack text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,#8cc0d63b,transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#56070f40,transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#08100dcc_0%,#10150fef_40%,#151d18f0_100%)]" />

      <div className="relative mx-auto grid min-h-[calc(100svh-var(--site-header-height))] max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        <div className="fade-in-up">
          <p className="inline-flex rounded-full border border-waterBlue/50 bg-waterBlue/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-waterBlue">
            Mobile Detailing • Premium Finish
          </p>

          <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
            Clean, correct, and protect
            <span className="block text-white/95">without leaving your driveway.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Build service plans per vehicle, submit booking intake once, and finish scheduling in Setmore with a smooth handoff.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="rounded-full bg-deepRed px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#6e0912]"
            >
              Book Now
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-white/45 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white hover:text-brandBlack"
            >
              Explore Services
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <article className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.12em] text-white/60">Packages</p>
              <p className="mt-1 font-heading text-xl font-semibold text-waterBlue">3 Core</p>
            </article>
            <article className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.12em] text-white/60">Add-ons</p>
              <p className="mt-1 font-heading text-xl font-semibold text-waterBlue">4 Options</p>
            </article>
            <article className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.12em] text-white/60">Multi-Car</p>
              <p className="mt-1 font-heading text-xl font-semibold text-waterBlue">Dock Ready</p>
            </article>
          </div>
        </div>

        <aside className="fade-in-up rounded-[26px] border border-white/20 bg-white/10 p-6 backdrop-blur-md">
          <h2 className="font-heading text-2xl font-semibold">Why this booking flow works</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition duration-300 hover:bg-black/30">
              Select package + add-ons per vehicle in one interface.
            </li>
            <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition duration-300 hover:bg-black/30">
              Keep customer details, notes, and vehicle data organized.
            </li>
            <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition duration-300 hover:bg-black/30">
              Redirect to Setmore only after intake is complete.
            </li>
          </ul>

          <div className="mt-5 rounded-xl border border-waterBlue/40 bg-waterBlue/10 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-waterBlue">Recommended first step</p>
            <p className="mt-1 text-sm text-white/85">Start in Services to build vehicle plans, then continue to Book Now.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
