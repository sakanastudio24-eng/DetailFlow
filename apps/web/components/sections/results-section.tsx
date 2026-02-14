import { getHomeResults } from '@/lib/site-data';

/**
 * Renders measurable transformation outcomes for trust-building.
 */
export function ResultsSection(): JSX.Element {
  const results = getHomeResults();

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deepRed">Before + After Outcomes</p>
        <h2 className="mt-2 font-heading text-2xl font-extrabold text-brandBlack sm:text-3xl">Results clients can actually see</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {results.map((item) => (
            <article key={item.title} className="rounded-2xl bg-neutralGray p-5">
              <h3 className="font-heading text-lg font-bold text-brandBlack">{item.title}</h3>
              <p className="mt-2 text-sm text-brandBlack/75">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
