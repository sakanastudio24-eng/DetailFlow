import { SiteShell } from '@/components/layout/site-shell';

const MOCK_GALLERY = [
  'Paint correction and gloss reset',
  'Interior stain extraction and trim detail',
  'Ceramic coating finish outcome',
  'Truck package with wheel deep clean',
  'Convertible top and cabin refresh',
  'SUV family package turnaround',
];

/**
 * Renders a placeholder gallery grid until original assets are imported.
 */
export default function GalleryPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-brandBlack sm:text-4xl">Gallery</h1>
        <p className="mt-3 text-sm text-brandBlack/75 sm:text-base">
          Real before-and-after transformations from client vehicles.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_GALLERY.map((item) => (
            <article key={item} className="aspect-[4/3] rounded-2xl border border-black/10 bg-gradient-to-br from-waterBlue/25 to-white p-4">
              <p className="text-sm font-semibold text-brandBlack">{item}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
