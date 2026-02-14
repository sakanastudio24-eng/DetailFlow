'use client';

import { Car, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import { VehicleDock } from '@/components/dock/vehicle-dock';
import { SiteShell } from '@/components/layout/site-shell';
import { useBooking } from '@/components/providers/booking-provider';
import { getAddonServices, getPackageServices } from '@/lib/services-catalog';

interface VehicleSizeOption {
  id: 'small' | 'medium' | 'large';
  label: string;
  hint: string;
}

/**
 * Returns supported vehicle size options for pricing context.
 */
function getVehicleSizeOptions(): VehicleSizeOption[] {
  return [
    { id: 'small', label: 'Small', hint: 'Sedan / Coupe' },
    { id: 'medium', label: 'Medium', hint: 'SUV / Crossover' },
    { id: 'large', label: 'Large', hint: 'Truck / Van' },
  ];
}

/**
 * Renders package or add-on service cards for the active vehicle.
 */
function ServiceGrid({ category }: { category: 'package' | 'addon' }): JSX.Element {
  const { activeVehicleId, setVehiclePackage, toggleServiceForVehicle, getVehicleServices } = useBooking();
  const services = useMemo(
    () => (category === 'package' ? getPackageServices() : getAddonServices()),
    [category],
  );

  const selectedIds = getVehicleServices(activeVehicleId).map((service) => service.id);

  /**
   * Handles selection logic for package and add-on cards.
   */
  function handleSelect(serviceId: string): void {
    const service = services.find((item) => item.id === serviceId);
    if (!service) {
      return;
    }

    if (category === 'package') {
      setVehiclePackage(activeVehicleId, service.id);
      return;
    }

    toggleServiceForVehicle(activeVehicleId, service);
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-heading text-2xl font-semibold text-brandBlack">
          {category === 'package' ? 'Detail Packages' : 'Enhancement Add-Ons'}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const selected = selectedIds.includes(service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleSelect(service.id)}
              className={`rounded-xl border p-4 text-left transition duration-300 ${
                selected
                  ? 'border-deepRed bg-deepRed/10 shadow-md'
                  : 'border-black/10 bg-white hover:-translate-y-0.5 hover:border-waterBlue hover:bg-waterBlue/10'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brandBlack/55">{service.duration}</p>
              <h3 className="mt-1 font-heading text-xl font-bold text-brandBlack">{service.name}</h3>
              <p className="mt-2 text-sm text-brandBlack/70">{service.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brandBlack/55">Tap to select</span>
                <span className="font-heading text-2xl font-extrabold text-deepRed">${service.price}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Renders the size selector block for the active vehicle.
 */
function VehicleSizeSection(): JSX.Element {
  const { vehicles, activeVehicleId, updateVehicle } = useBooking();
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId);
  const [guideOpen, setGuideOpen] = useState(false);
  const options = getVehicleSizeOptions();

  if (!activeVehicle) {
    return <></>;
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">
      <h2 className="font-heading text-2xl font-semibold text-brandBlack">Select Your Vehicle Size</h2>
      <p className="mt-2 text-sm text-brandBlack/60">Watch prices update automatically below.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {options.map((option) => {
          const selected = activeVehicle.size === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => updateVehicle(activeVehicle.id, { size: option.id })}
              className={`rounded-2xl border px-4 py-5 text-left transition duration-300 ${
                selected
                  ? 'border-deepRed bg-deepRed/5 shadow-md'
                  : 'border-black/10 bg-white hover:border-waterBlue hover:bg-waterBlue/10'
              }`}
            >
              <p className="font-heading text-xl font-semibold text-brandBlack">{option.label}</p>
              <p className="mt-1 text-sm text-brandBlack/55">{option.hint}</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setGuideOpen((current) => !current)}
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-black/10 bg-neutralGray px-4 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-brandBlack">
          <Car className="h-4 w-4 text-waterBlue" /> Vehicle Size Guide - Find Your Vehicle
        </span>
        <ChevronDown className={`h-4 w-4 text-brandBlack/60 transition ${guideOpen ? 'rotate-180' : ''}`} />
      </button>

      {guideOpen ? (
        <div className="mt-3 grid gap-3 rounded-xl border border-black/10 bg-white p-4 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-deepRed">Small</p>
            <p className="mt-1 text-xs text-brandBlack/70">Civic, Corolla, Mazda3, A4</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-deepRed">Medium</p>
            <p className="mt-1 text-xs text-brandBlack/70">CR-V, RAV4, CX-5, Model Y</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-deepRed">Large</p>
            <p className="mt-1 text-xs text-brandBlack/70">F-150, Silverado, Yukon, Suburban</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/**
 * Renders the services planner with left selection and right vehicle controls.
 */
export default function ServicesPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brandBlack px-4 py-16 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8cc0d633,transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Our Detailing Packages</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Choose the perfect service for your vehicle size and condition.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 services-bottom-safe lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <VehicleSizeSection />
          <ServiceGrid category="package" />
          <ServiceGrid category="addon" />
        </div>
        <div>
          <VehicleDock />
        </div>
      </section>
    </SiteShell>
  );
}
