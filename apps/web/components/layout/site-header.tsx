'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { QuickHelpModal } from '@/components/help/quick-help-modal';
import { useBooking } from '@/components/providers/booking-provider';
import { getVehicleDisplayName } from '@/lib/vehicle-utils';

interface NavLinkItem {
  href: string;
  label: string;
}

/**
 * Returns the primary text links shown in desktop and mobile nav.
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
  const {
    vehicles,
    getVehicleServices,
    getVehicleTotal,
    getGrandTotal,
    getSelectedServiceCount,
  } = useBooking();
  const selectedServiceCount = getSelectedServiceCount();
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  const vehiclesWithSelections = useMemo(
    () => vehicles.filter((vehicle) => getVehicleServices(vehicle.id).length > 0),
    [getVehicleServices, vehicles],
  );

  useEffect(() => {
    /**
     * Closes cart panel when pointer clicks outside dropdown container.
     */
    function onPointerDown(event: MouseEvent): void {
      if (!cartRef.current) {
        return;
      }

      if (!cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    }

    /**
     * Closes cart panel when Escape is pressed.
     */
    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setCartOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeydown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeydown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="font-heading text-2xl font-semibold tracking-tight text-brandBlack sm:text-3xl">
          Cruzn
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm font-medium transition duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-deepRed after:transition-all after:duration-300 ${
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

        <div className="hidden items-center gap-3 lg:flex" ref={cartRef}>
          <a href="tel:+15551234567" className="inline-flex items-center gap-2 text-sm font-semibold text-brandBlack transition hover:text-deepRed">
            <Phone className="h-4 w-4" />
            (555) 123-4567
          </a>

          <Link
            href="/booking"
            className="group relative overflow-hidden rounded-full bg-deepRed px-7 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#6e0912]"
          >
            <span className="relative z-10">Book Now</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>

          <QuickHelpModal />

          <button
            type="button"
            onClick={() => setCartOpen((current) => !current)}
            className="relative rounded-full p-2 text-brandBlack transition duration-300 hover:bg-neutralGray hover:text-deepRed"
            aria-label="Open cart summary"
          >
            <ShoppingCart className="h-5 w-5" />
            {selectedServiceCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-deepRed px-1 text-[10px] font-bold text-white">
                {selectedServiceCount}
              </span>
            ) : null}
          </button>

          {cartOpen ? (
            <div className="absolute right-6 top-[74px] z-50 w-[330px] rounded-2xl border border-black/10 bg-white p-4 shadow-2xl">
              <h3 className="font-heading text-lg font-semibold text-brandBlack">Cart Summary</h3>

              {vehiclesWithSelections.length === 0 ? (
                <p className="mt-2 rounded-xl bg-neutralGray p-3 text-sm text-brandBlack/70">
                  No services selected yet. Add services from the Services page.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {vehiclesWithSelections.map((vehicle) => {
                    const items = getVehicleServices(vehicle.id);
                    return (
                      <article key={vehicle.id} className="rounded-xl border border-black/10 p-3">
                        <p className="font-semibold text-brandBlack">{getVehicleDisplayName(vehicle)}</p>
                        <ul className="mt-2 space-y-1">
                          {items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between text-xs">
                              <span className="text-brandBlack/70">{item.name}</span>
                              <span className="font-semibold text-brandBlack">${item.price}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-right text-sm font-semibold text-deepRed">${getVehicleTotal(vehicle.id)}</p>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="mt-3 border-t border-black/10 pt-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span className="text-deepRed">${getGrandTotal()}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href="/services"
                    onClick={() => setCartOpen(false)}
                    className="rounded-full border border-waterBlue px-3 py-2 text-center text-xs font-semibold text-waterBlue"
                  >
                    Edit Services
                  </Link>
                  <Link
                    href="/booking"
                    onClick={() => setCartOpen(false)}
                    className="rounded-full bg-deepRed px-3 py-2 text-center text-xs font-semibold text-white"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1 lg:hidden" ref={cartRef}>
          <QuickHelpModal />
          <button
            type="button"
            onClick={() => setCartOpen((current) => !current)}
            className="relative rounded-full p-2 text-brandBlack transition duration-300 hover:bg-neutralGray"
            aria-label="Open cart summary"
          >
            <ShoppingCart className="h-5 w-5" />
            {selectedServiceCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-deepRed px-1 text-[10px] font-bold text-white">
                {selectedServiceCount}
              </span>
            ) : null}
          </button>
          <Link
            href="/booking"
            className="rounded-full bg-deepRed px-4 py-2 text-xs font-semibold text-white transition hover:bg-brandBlack"
          >
            Book Now
          </Link>

          {cartOpen ? (
            <div className="fixed inset-x-3 top-[72px] z-50 rounded-2xl border border-black/10 bg-white p-4 shadow-2xl">
              <h3 className="font-heading text-lg font-semibold text-brandBlack">Cart Summary</h3>
              <p className="mt-1 text-xs text-brandBlack/60">{vehiclesWithSelections.length} vehicles selected</p>
              <div className="mt-2 border-t border-black/10 pt-2 text-right text-sm font-semibold text-deepRed">${getGrandTotal()}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/services" onClick={() => setCartOpen(false)} className="rounded-full border border-waterBlue px-3 py-2 text-center text-xs font-semibold text-waterBlue">
                  View
                </Link>
                <Link href="/booking" onClick={() => setCartOpen(false)} className="rounded-full bg-deepRed px-3 py-2 text-center text-xs font-semibold text-white">
                  Checkout
                </Link>
              </div>
            </div>
          ) : null}
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
