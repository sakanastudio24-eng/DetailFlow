import Link from 'next/link';

/**
 * Renders shared footer links and contact summary.
 */
export function SiteFooter(): JSX.Element {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <h2 className="font-heading text-lg font-extrabold text-brandBlack">Cruz N Clean</h2>
          <p className="mt-2 text-sm text-brandBlack/75">
            Mobile detailing built for convenience, protection, and premium finish quality.
          </p>
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-brandBlack">Quick Links</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/services" className="text-brandBlack/75 hover:text-deepRed">Services</Link>
            <Link href="/booking" className="text-brandBlack/75 hover:text-deepRed">Book Now</Link>
            <Link href="/contact" className="text-brandBlack/75 hover:text-deepRed">Contact</Link>
            <Link href="/faq" className="text-brandBlack/75 hover:text-deepRed">FAQ</Link>
          </div>
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-brandBlack">Legal</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/privacy" className="text-brandBlack/75 hover:text-deepRed">Privacy Policy</Link>
            <Link href="/terms" className="text-brandBlack/75 hover:text-deepRed">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
