'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { ServiceOption, VehicleProfile } from '@/lib/booking-types';
import { findServiceById } from '@/lib/services-catalog';

interface BookingContextValue {
  vehicles: VehicleProfile[];
  activeVehicleId: string;
  setActiveVehicleId: (vehicleId: string) => void;
  addVehicle: () => void;
  removeVehicle: (vehicleId: string) => void;
  updateVehicle: (vehicleId: string, updates: Partial<VehicleProfile>) => void;
  toggleServiceForVehicle: (vehicleId: string, service: ServiceOption) => void;
  getVehicleTotal: (vehicleId: string) => number;
  getGrandTotal: () => number;
  getVehicleServices: (vehicleId: string) => ServiceOption[];
  clearAll: () => void;
}

interface BookingProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'cruzn-clean-booking-v1';

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

/**
 * Creates a default vehicle profile for new entries in the dock.
 */
function createDefaultVehicle(index: number): VehicleProfile {
  return {
    id: `vehicle-${Date.now()}-${index}`,
    label: `Vehicle ${index + 1}`,
    make: '',
    model: '',
    year: '',
    color: '',
    serviceIds: [],
  };
}

/**
 * Provides multi-vehicle booking state for services and booking routes.
 */
export function BookingProvider({ children }: BookingProviderProps): JSX.Element {
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([createDefaultVehicle(0)]);
  const [activeVehicleId, setActiveVehicleId] = useState<string>(vehicles[0].id);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { vehicles: VehicleProfile[]; activeVehicleId: string };

      if (Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0) {
        setVehicles(parsed.vehicles);
        setActiveVehicleId(parsed.activeVehicleId ?? parsed.vehicles[0].id);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicles, activeVehicleId }));
  }, [activeVehicleId, vehicles]);

  /**
   * Adds a new vehicle to the customer dock and makes it active.
   */
  function addVehicle(): void {
    setVehicles((current) => {
      const nextVehicle = createDefaultVehicle(current.length);
      setActiveVehicleId(nextVehicle.id);
      return [...current, nextVehicle];
    });
  }

  /**
   * Removes an existing vehicle and reassigns active vehicle if needed.
   */
  function removeVehicle(vehicleId: string): void {
    setVehicles((current) => {
      if (current.length === 1) {
        return current;
      }

      const filtered = current.filter((vehicle) => vehicle.id !== vehicleId);
      if (activeVehicleId === vehicleId && filtered.length > 0) {
        setActiveVehicleId(filtered[0].id);
      }
      return filtered;
    });
  }

  /**
   * Updates editable vehicle details for the selected vehicle record.
   */
  function updateVehicle(vehicleId: string, updates: Partial<VehicleProfile>): void {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              ...updates,
            }
          : vehicle,
      ),
    );
  }

  /**
   * Adds or removes a service selection for one vehicle.
   */
  function toggleServiceForVehicle(vehicleId: string, service: ServiceOption): void {
    setVehicles((current) =>
      current.map((vehicle) => {
        if (vehicle.id !== vehicleId) {
          return vehicle;
        }

        const hasService = vehicle.serviceIds.includes(service.id);
        const nextServiceIds = hasService
          ? vehicle.serviceIds.filter((serviceId) => serviceId !== service.id)
          : [...vehicle.serviceIds, service.id];

        return {
          ...vehicle,
          serviceIds: nextServiceIds,
        };
      }),
    );
  }

  /**
   * Resolves selected service records for one vehicle.
   */
  function getVehicleServices(vehicleId: string): ServiceOption[] {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) {
      return [];
    }

    return vehicle.serviceIds
      .map((serviceId) => findServiceById(serviceId))
      .filter((service): service is ServiceOption => Boolean(service));
  }

  /**
   * Calculates subtotal price for one vehicle by selected services.
   */
  function getVehicleTotal(vehicleId: string): number {
    return getVehicleServices(vehicleId).reduce((sum, service) => sum + service.price, 0);
  }

  /**
   * Calculates the grand total across all vehicles.
   */
  function getGrandTotal(): number {
    return vehicles.reduce((sum, vehicle) => sum + getVehicleTotal(vehicle.id), 0);
  }

  /**
   * Clears dock state and resets to a single empty vehicle.
   */
  function clearAll(): void {
    const fallback = createDefaultVehicle(0);
    setVehicles([fallback]);
    setActiveVehicleId(fallback.id);
  }

  const value = useMemo<BookingContextValue>(
    () => ({
      vehicles,
      activeVehicleId,
      setActiveVehicleId,
      addVehicle,
      removeVehicle,
      updateVehicle,
      toggleServiceForVehicle,
      getVehicleTotal,
      getGrandTotal,
      getVehicleServices,
      clearAll,
    }),
    [activeVehicleId, vehicles],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

/**
 * Returns the booking context and enforces provider presence.
 */
export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error('useBooking must be used within BookingProvider.');
  }

  return context;
}
