import Link from 'next/link';

/**
 * Renders the homepage closing call-to-action block.
 */
export function CtaSection(): JSX.Element {
  return (
    <section className="bg-gradient-to-r from-deepRed to-brandBlack py-16 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-[28px] border border-white/20 bg-white/5 p-6 backdrop-blur-md sm:p-10">
          <h2 className="font-heading text-4xl font-semibold sm:text-5xl">Ready to lock in your detail?</h2>
          <p className="mt-3 max-w-3xl text-sm text-white/80 sm:text-base">
            Submit your vehicle and service details first, then finish appointment scheduling in Setmore.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/booking" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brandBlack transition duration-300 hover:bg-waterBlue">
              Continue to Booking
            </Link>
            <Link href="/quote" className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white hover:text-brandBlack">
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
