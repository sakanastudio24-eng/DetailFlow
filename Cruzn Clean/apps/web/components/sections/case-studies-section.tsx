import { getCaseStudies } from '@/lib/site-data';

/**
 * Renders portfolio case studies with open image placeholders for future screenshots.
 */
export function CaseStudiesSection(): JSX.Element {
  const caseStudies = getCaseStudies();

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deepRed">Case Studies</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-brandBlack sm:text-4xl">Other projects in this portfolio</h2>
          </div>
          <p className="max-w-sm text-right text-xs text-brandBlack/55">Image areas are intentionally open placeholders for final screenshots.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {caseStudies.map((caseStudy, index) => (
            <article
              key={caseStudy.slug}
              className="fade-in-up rounded-2xl border border-black/10 bg-neutralGray p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading text-2xl font-semibold text-brandBlack">{caseStudy.project}</h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    caseStudy.status === 'under-construction'
                      ? 'bg-waterBlue/20 text-brandBlack'
                      : 'bg-deepRed/10 text-deepRed'
                  }`}
                >
                  {caseStudy.status === 'under-construction' ? 'Under Construction' : caseStudy.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-brandBlack/75">{caseStudy.summary}</p>

              <div className="mt-4 rounded-xl border border-dashed border-waterBlue/45 bg-waterBlue/10 px-4 py-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brandBlack/55">Photo Placeholder</p>
                <p className="mt-1 text-sm text-brandBlack/70">{caseStudy.imagePlaceholder}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {caseStudy.stack.map((item) => (
                  <span
                    key={`${caseStudy.slug}-${item}`}
                    className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-brandBlack/75"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <ul className="mt-4 space-y-1.5 text-sm text-brandBlack/75">
                {caseStudy.highlights.map((item) => (
                  <li key={`${caseStudy.slug}-${item}`} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-waterBlue" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
