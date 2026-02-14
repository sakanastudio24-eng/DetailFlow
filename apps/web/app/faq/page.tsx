import { SiteShell } from '@/components/layout/site-shell';

const FAQ_ITEMS = [
  {
    q: 'How does booking work?',
    a: 'Select services per vehicle in Services, submit intake in Book Now, then choose final time in Setmore.',
  },
  {
    q: 'Can I book multiple cars in one request?',
    a: 'Yes. The dock supports multiple vehicles with separate package/add-on selections.',
  },
  {
    q: 'Do you offer mobile service?',
    a: 'Yes, service is mobile-first. ZIP and location details are validated in booking.',
  },
];

/**
 * Renders frequently asked questions for booking and service policy.
 */
export default function FaqPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-brandBlack sm:text-4xl">FAQ</h1>
        <div className="mt-6 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <article key={item.q} className="rounded-xl border border-black/10 bg-white p-4">
              <h2 className="font-heading text-lg font-bold text-brandBlack">{item.q}</h2>
              <p className="mt-1 text-sm text-brandBlack/75">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
