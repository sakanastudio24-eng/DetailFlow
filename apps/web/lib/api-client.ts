import type {
  BookingIntakeRequest,
  BookingVehicleRequest,
  ContactForm,
  CustomerBookingForm,
  VehicleProfile,
} from '@/lib/booking-types';

const DEFAULT_API_BASE = 'http://127.0.0.1:8000';

/**
 * Returns the configured backend API base URL.
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE;
}

/**
 * Returns the configured Setmore redirect URL.
 */
export function getSetmoreUrl(): string {
  return process.env.NEXT_PUBLIC_SETMORE_URL ?? 'https://www.setmore.com';
}

/**
 * Submits booking intake data to the backend.
 */
export async function submitBookingIntake(payload: {
  customer: CustomerBookingForm;
  vehicles: VehicleProfile[];
}): Promise<void> {
  const vehicles: BookingVehicleRequest[] = payload.vehicles.map((vehicle) => ({
    id: vehicle.id,
    label: vehicle.label,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    serviceIds: vehicle.serviceIds,
  }));

  const requestPayload: BookingIntakeRequest = {
    customer: payload.customer,
    vehicles,
  };

  const response = await fetch(`${getApiBaseUrl()}/booking-intakes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    throw new Error('Booking intake submission failed.');
  }
}

/**
 * Submits contact questions to the backend.
 */
export async function submitContactMessage(payload: ContactForm): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/contact-messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Contact message submission failed.');
  }
}
