import Link from 'next/link';

/**
 * Renders the homepage closing call-to-action block.
 */
export function CtaSection(): JSX.Element {
  return (
    <section className="bg-gradient-to-r from-deepRed to-brandBlack py-14 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/20 bg-white/5 p-6 backdrop-blur sm:p-8">
          <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Ready to lock in your detail?</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
            Submit your vehicle and service details first, then finish appointment selection in Setmore.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/booking" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-brandBlack hover:bg-waterBlue">
              Continue to Booking
            </Link>
            <Link href="/quote" className="rounded-full border border-white/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white hover:text-brandBlack">
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
