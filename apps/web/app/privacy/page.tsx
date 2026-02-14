import { SiteShell } from '@/components/layout/site-shell';

/**
 * Renders privacy policy summary for booking/contact data collection.
 */
export default function PrivacyPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-brandBlack sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-brandBlack/75">
          We collect contact and vehicle service details strictly for appointment processing, communication,
          and service delivery. Data sharing is limited to required operational tools.
        </p>
      </section>
    </SiteShell>
  );
}
