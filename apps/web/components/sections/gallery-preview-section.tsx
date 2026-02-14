import Link from 'next/link';

const PREVIEW_ITEMS = [
  'Exterior correction and wheel detail',
  'Interior reset with odor treatment',
  'Before/After transformation showcase',
  'Premium package gloss outcome',
];

/**
 * Renders a gallery teaser strip to extend homepage depth.
 */
export function GalleryPreviewSection(): JSX.Element {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deepRed">Our Work</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-brandBlack sm:text-4xl">Recent transformations</h2>
          </div>
          <Link href="/gallery" className="text-sm font-semibold text-deepRed transition duration-300 hover:text-brandBlack">
            View full gallery
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_ITEMS.map((item, index) => (
            <article
              key={item}
              className="fade-in-up aspect-[4/5] rounded-2xl border border-black/10 bg-gradient-to-br from-brandBlack to-[#162116] p-4 text-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <p className="text-sm text-white/80">{item}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
