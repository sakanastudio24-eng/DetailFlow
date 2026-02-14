'use client';

import { useMemo } from 'react';

import { SiteShell } from '@/components/layout/site-shell';
import { VehicleDock } from '@/components/dock/vehicle-dock';
import { useBooking } from '@/components/providers/booking-provider';
import { getAddonServices, getPackageServices } from '@/lib/services-catalog';
import { getVehicleDisplayName } from '@/lib/vehicle-utils';

/**
 * Renders one vehicle editor block used in the services planner.
 */
function VehicleEditor(): JSX.Element {
  const { vehicles, activeVehicleId, setActiveVehicleId, updateVehicle } = useBooking();

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="font-heading text-xl font-bold text-brandBlack">Select Vehicle</h2>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {vehicles.map((vehicle) => {
          const active = vehicle.id === activeVehicleId;
          return (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => setActiveVehicleId(vehicle.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold ${
                active ? 'border-deepRed bg-deepRed text-white' : 'border-black/15 text-brandBlack'
              }`}
            >
              {getVehicleDisplayName(vehicle)}
            </button>
          );
        })}
      </div>

      {vehicles.map((vehicle) => {
        if (vehicle.id !== activeVehicleId) {
          return null;
        }

        return (
          <div key={vehicle.id} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-brandBlack">
              Make
              <input
                value={vehicle.make}
                onChange={(event) => updateVehicle(vehicle.id, { make: event.target.value })}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="Toyota"
              />
            </label>
            <label className="text-sm font-medium text-brandBlack">
              Model
              <input
                value={vehicle.model}
                onChange={(event) => updateVehicle(vehicle.id, { model: event.target.value })}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="Camry"
              />
            </label>
            <label className="text-sm font-medium text-brandBlack">
              Year
              <input
                value={vehicle.year}
                onChange={(event) => updateVehicle(vehicle.id, { year: event.target.value })}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="2021"
              />
            </label>
            <label className="text-sm font-medium text-brandBlack">
              Color
              <input
                value={vehicle.color}
                onChange={(event) => updateVehicle(vehicle.id, { color: event.target.value })}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="Black"
              />
            </label>
          </div>
        );
      })}
    </section>
  );
}

/**
 * Renders service cards for one category and toggles active vehicle selection.
 */
function ServiceGrid({ category }: { category: 'package' | 'addon' }): JSX.Element {
  const { activeVehicleId, toggleServiceForVehicle, getVehicleServices } = useBooking();

  const services = useMemo(
    () => (category === 'package' ? getPackageServices() : getAddonServices()),
    [category],
  );

  const selectedIds = getVehicleServices(activeVehicleId).map((service) => service.id);

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="font-heading text-xl font-bold text-brandBlack">
        {category === 'package' ? 'Core Packages' : 'Add-On Services'}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const active = selectedIds.includes(service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleServiceForVehicle(activeVehicleId, service)}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? 'border-deepRed bg-deepRed/10 shadow-md'
                  : 'border-black/10 bg-white hover:border-waterBlue hover:bg-waterBlue/10'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brandBlack/55">{service.duration}</p>
              <h3 className="mt-1 font-heading text-lg font-bold text-brandBlack">{service.name}</h3>
              <p className="mt-1 text-sm text-brandBlack/75">{service.description}</p>
              <p className="mt-3 font-heading text-xl font-extrabold text-deepRed">${service.price}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Renders the services planner with multi-vehicle docking behavior.
 */
export default function ServicesPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="bg-brandBlack px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-waterBlue">Services Planner</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-5xl">
            Build service plans for multiple vehicles.
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-white/80 sm:text-base">
            Select a vehicle, assign package and add-ons, then review totals in the dock before checkout.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 services-bottom-safe lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <VehicleEditor />
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
