'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Car, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

import { useBooking } from '@/components/providers/booking-provider';
import { getVehicleDisplayName } from '@/lib/vehicle-utils';

/**
 * Renders selected vehicles with per-vehicle and overall booking totals.
 */
export function VehicleDock(): JSX.Element {
  const {
    vehicles,
    activeVehicleId,
    setActiveVehicleId,
    addVehicle,
    removeVehicle,
    getGrandTotal,
    getVehicleTotal,
    getVehicleServices,
  } = useBooking();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <aside className="dock-shell rounded-2xl border border-black/10 bg-white shadow-lg">
      <div className="border-b border-black/10 bg-brandBlack px-4 py-4 text-white sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Car className="h-5 w-5 text-waterBlue" />
            Vehicle Dock
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addVehicle}
              className="inline-flex items-center gap-1 rounded-full bg-waterBlue px-3 py-1.5 text-xs font-semibold text-brandBlack"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
            <button
              type="button"
              onClick={() => setMobileExpanded((current) => !current)}
              className="inline-flex items-center justify-center rounded-md bg-white/10 p-1.5 text-white lg:hidden"
            >
              {mobileExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className={`space-y-3 overflow-y-auto p-4 sm:p-5 ${mobileExpanded ? 'block' : 'hidden lg:block'}`}>
        {vehicles.map((vehicle) => {
          const active = vehicle.id === activeVehicleId;
          const selectedServices = getVehicleServices(vehicle.id);
          const subtotal = getVehicleTotal(vehicle.id);

          return (
            <article
              key={vehicle.id}
              className={`rounded-xl border p-3 transition ${active ? 'border-deepRed bg-deepRed/5' : 'border-black/10 bg-white'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveVehicleId(vehicle.id)}
                  className="text-left"
                >
                  <p className="font-heading text-base font-bold text-brandBlack">{getVehicleDisplayName(vehicle)}</p>
                  <p className="text-xs text-brandBlack/60">{selectedServices.length} selected services</p>
                </button>
                {vehicles.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeVehicle(vehicle.id)}
                    className="rounded-md p-1 text-brandBlack/50 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {selectedServices.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {selectedServices.map((service) => (
                    <li key={service.id} className="flex items-center justify-between text-xs">
                      <span className="text-brandBlack/70">{service.name}</span>
                      <span className="font-semibold text-brandBlack">${service.price}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-brandBlack/55">No services selected yet.</p>
              )}

              <div className="mt-3 border-t border-black/10 pt-2 text-right">
                <p className="text-xs text-brandBlack/60">Vehicle subtotal</p>
                <p className="font-heading text-lg font-bold text-deepRed">${subtotal}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="space-y-3 border-t border-black/10 bg-neutralGray px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-brandBlack">Total ({vehicles.length} vehicles)</p>
          <p className="font-heading text-2xl font-extrabold text-deepRed">${getGrandTotal()}</p>
        </div>
        <Link
          href="/booking"
          className="block rounded-full bg-deepRed px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brandBlack"
        >
          Book All Vehicles
        </Link>
      </div>
    </aside>
  );
}
