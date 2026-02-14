import Link from 'next/link';

import { getHomeServices } from '@/lib/site-data';

/**
 * Renders the service teaser cards for homepage conversion.
 */
export function ServicesSection(): JSX.Element {
  const services = getHomeServices();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deepRed">Packages</p>
          <h2 className="mt-2 font-heading text-2xl font-extrabold text-brandBlack sm:text-3xl">Choose your detail level</h2>
        </div>
        <Link href="/services" className="text-sm font-semibold text-deepRed hover:text-brandBlack">
          Full menu
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {services.map((service) => (
          <article key={service.title} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-waterBlue">From {service.priceFrom}</p>
            <h3 className="mt-2 font-heading text-xl font-bold text-brandBlack">{service.title}</h3>
            <p className="mt-2 text-sm text-brandBlack/75">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
