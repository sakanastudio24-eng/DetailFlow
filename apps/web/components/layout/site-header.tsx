import Link from 'next/link';

/**
 * Renders the primary homepage header and quick actions.
 */
export function SiteHeader(): JSX.Element {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-heading text-lg font-extrabold tracking-tight text-brandBlack">
          Cruz N Clean
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-brandBlack md:flex">
          <Link href="/services" className="hover:text-deepRed">Services</Link>
          <Link href="/gallery" className="hover:text-deepRed">Gallery</Link>
          <Link href="/booking" className="hover:text-deepRed">Booking</Link>
          <Link href="/contact" className="hover:text-deepRed">Contact</Link>
        </nav>
        <Link
          href="/booking"
          className="rounded-full bg-deepRed px-4 py-2 text-sm font-semibold text-white transition hover:bg-brandBlack"
        >
          Book Now
        </Link>
      </div>
    </header>
  );
}
