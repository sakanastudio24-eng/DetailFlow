'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, ShoppingCart } from 'lucide-react';

import { QuickHelpModal } from '@/components/help/quick-help-modal';
import { useBooking } from '@/components/providers/booking-provider';

interface NavLinkItem {
  href: string;
  label: string;
}

/**
 * Returns the primary text links shown in the desktop navigation.
 */
function getNavLinks(): NavLinkItem[] {
  return [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/quote', label: 'Quote' },
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
  const { getSelectedServiceCount } = useBooking();
  const selectedServiceCount = getSelectedServiceCount();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-3 transition-all sm:px-6">
        <Link href="/" className="font-heading text-3xl font-semibold tracking-tight text-brandBlack">
          Cruzn
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-[30px] font-medium transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-deepRed after:transition-all after:duration-300 ${
                  active
                    ? 'text-brandBlack after:w-full'
                    : 'text-brandBlack/75 hover:text-brandBlack after:w-0 hover:after:w-full'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a href="tel:+15551234567" className="inline-flex items-center gap-2 text-sm font-semibold text-brandBlack transition hover:text-deepRed">
            <Phone className="h-4 w-4" />
            (555) 123-4567
          </a>

          <Link
            href="/booking"
            className="group relative overflow-hidden rounded-full bg-deepRed px-10 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-[#6e0912]"
          >
            <span className="relative z-10">Book Now</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>

          <QuickHelpModal />

          <Link
            href="/services"
            className="relative rounded-full p-2 text-brandBlack transition duration-300 hover:bg-neutralGray hover:text-deepRed"
            aria-label="Open services dock"
          >
            <ShoppingCart className="h-5 w-5" />
            {selectedServiceCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-deepRed px-1 text-[10px] font-bold text-white">
                {selectedServiceCount}
              </span>
            ) : null}
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <QuickHelpModal />
          <Link
            href="/services"
            className="relative rounded-full p-2 text-brandBlack transition duration-300 hover:bg-neutralGray"
            aria-label="Open services dock"
          >
            <ShoppingCart className="h-5 w-5" />
            {selectedServiceCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-deepRed px-1 text-[10px] font-bold text-white">
                {selectedServiceCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/booking"
            className="rounded-full bg-deepRed px-4 py-2 text-xs font-semibold text-white transition hover:bg-brandBlack"
          >
            Book Now
          </Link>
        </div>
      </div>

      <nav className="border-t border-black/10 bg-white lg:hidden">
        <div className="mx-auto flex max-w-[1360px] items-center gap-2 overflow-x-auto px-3 py-2">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition duration-300 ${
                  active ? 'bg-deepRed text-white' : 'bg-neutralGray text-brandBlack hover:bg-black/10'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href="tel:+15551234567"
            className="ml-auto inline-flex whitespace-nowrap rounded-full bg-neutralGray px-3 py-1.5 text-xs font-semibold text-brandBlack"
          >
            Call
          </a>
        </div>
      </nav>
    </header>
  );
}
