import Link from 'next/link';

/**
 * Renders shared footer links and contact summary.
 */
export function SiteFooter(): JSX.Element {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <h2 className="font-heading text-xl font-semibold text-brandBlack">Cruz N Clean</h2>
          <p className="mt-2 text-sm text-brandBlack/75">
            Mobile detailing built for convenience, protection, and premium finish quality.
          </p>
          <p className="mt-3 text-sm font-semibold text-brandBlack">(555) 123-4567</p>
        </div>

        <div>
          <h3 className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-brandBlack">Quick Links</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <Link href="/" className="text-brandBlack hover:text-deepRed hover:underline">Home</Link>
            <Link href="/services" className="text-brandBlack hover:text-deepRed hover:underline">Services</Link>
            <Link href="/gallery" className="text-brandBlack hover:text-deepRed hover:underline">Gallery</Link>
            <Link href="/quote" className="text-brandBlack hover:text-deepRed hover:underline">Quote</Link>
            <Link href="/booking" className="text-brandBlack hover:text-deepRed hover:underline">Book Now</Link>
            <Link href="/contact" className="text-brandBlack hover:text-deepRed hover:underline">Contact</Link>
            <Link href="/faq" className="text-brandBlack hover:text-deepRed hover:underline">FAQ</Link>
          </div>
        </div>

        <div>
          <h3 className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-brandBlack">Legal</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/privacy" className="text-brandBlack hover:text-deepRed hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="text-brandBlack hover:text-deepRed hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
