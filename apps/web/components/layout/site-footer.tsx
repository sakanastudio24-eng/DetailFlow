import Link from 'next/link';

/**
 * Renders a compact footer for the first homepage release.
 */
export function SiteFooter(): JSX.Element {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-brandBlack/80">Cruz N Clean. Mobile detailing with premium finish standards.</p>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="text-brandBlack/80 hover:text-deepRed">Privacy</Link>
          <Link href="/terms" className="text-brandBlack/80 hover:text-deepRed">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
