'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkItem {
  href: string;
  label: string;
}

/**
 * Returns the primary navigation links shown in site header.
 */
function getNavLinks(): NavLinkItem[] {
  return [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/booking', label: 'Book Now' },
    { href: '/contact', label: 'Contact' },
  ];
}

/**
 * Resolves route-match state for one navigation link.
 */
function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname.startsWith(href);
}

/**
 * Renders desktop and mobile navigation for all public pages.
 */
export function SiteHeader(): JSX.Element {
  const pathname = usePathname();
  const links = getNavLinks();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-heading text-lg font-extrabold tracking-tight text-brandBlack sm:text-xl">
          Cruz N Clean
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition ${active ? 'text-deepRed' : 'text-brandBlack hover:text-deepRed'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/booking"
          className="rounded-full bg-deepRed px-4 py-2 text-xs font-semibold text-white transition hover:bg-brandBlack sm:text-sm"
        >
          Book
        </Link>
      </div>

      <nav className="border-t border-black/5 bg-white md:hidden">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 py-2">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active ? 'bg-brandBlack text-white' : 'bg-neutralGray text-brandBlack'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
