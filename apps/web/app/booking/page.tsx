'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';
import { useBooking } from '@/components/providers/booking-provider';
import type { CustomerBookingForm } from '@/lib/booking-types';
import { getSetmoreUrl, submitBookingIntake } from '@/lib/api-client';
import { getVehicleDisplayName } from '@/lib/vehicle-utils';

const INITIAL_FORM: CustomerBookingForm = {
  fullName: '',
  email: '',
  phone: '',
  zipCode: '',
  notes: '',
  acceptedConsent: false,
};

/**
 * Validates customer booking form fields before submission.
 */
function isBookingFormValid(form: CustomerBookingForm): boolean {
  return (
    form.fullName.trim().length >= 2 &&
    form.email.includes('@') &&
    form.phone.trim().length >= 10 &&
    form.zipCode.trim().length >= 5 &&
    form.acceptedConsent
  );
}

/**
 * Renders the booking-only form and Setmore redirection flow.
 */
export default function BookingPage(): JSX.Element {
  const { vehicles, getGrandTotal, getVehicleServices, clearAll } = useBooking();
  const [form, setForm] = useState<CustomerBookingForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const hasSelections = useMemo(
    () => vehicles.some((vehicle) => getVehicleServices(vehicle.id).length > 0),
    [getVehicleServices, vehicles],
  );

  /**
   * Updates one booking form key while preserving other values.
   */
  function updateField<K extends keyof CustomerBookingForm>(key: K, value: CustomerBookingForm[K]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  /**
   * Submits booking intake and redirects to Setmore for final scheduling.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!isBookingFormValid(form)) {
      setStatusMessage('Please complete required booking fields and consent.');
      return;
    }

    if (!hasSelections) {
      setStatusMessage('Please add at least one service in Services before booking.');
      return;
    }

    setSubmitting(true);
    setStatusMessage('Submitting your intake...');

    try {
      await submitBookingIntake({
        customer: form,
        vehicles,
      });

      setStatusMessage('Saved. Redirecting to Setmore now...');
      clearAll();
      window.location.href = getSetmoreUrl();
    } catch {
      setStatusMessage('Submission failed. Check backend and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteShell>
      <section className="bg-brandBlack px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-waterBlue">Book Now</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-5xl">Finalize your booking intake.</h1>
          <p className="mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
            This form is for booking details. You will be redirected to Setmore to choose your final appointment slot.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-heading text-2xl font-bold text-brandBlack">Customer Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-brandBlack">
              Full Name
              <input
                value={form.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="Jane Doe"
                required
              />
            </label>
            <label className="text-sm font-medium text-brandBlack">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="jane@email.com"
                required
              />
            </label>
            <label className="text-sm font-medium text-brandBlack">
              Phone
              <input
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="(555) 123-4567"
                required
              />
            </label>
            <label className="text-sm font-medium text-brandBlack">
              ZIP Code
              <input
                value={form.zipCode}
                onChange={(event) => updateField('zipCode', event.target.value)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="90210"
                required
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-brandBlack">
            Booking Notes
            <textarea
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              className="mt-1 min-h-24 w-full rounded-lg border border-black/15 px-3 py-2"
              placeholder="Gate code, parking notes, preferred prep details..."
            />
          </label>

          <label className="flex items-start gap-2 text-sm text-brandBlack/80">
            <input
              type="checkbox"
              checked={form.acceptedConsent}
              onChange={(event) => updateField('acceptedConsent', event.target.checked)}
              className="mt-0.5"
            />
            I consent to being contacted regarding booking confirmation and service updates.
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-deepRed px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Intake and Continue to Setmore'}
          </button>

          {statusMessage ? <p className="text-sm text-brandBlack/75">{statusMessage}</p> : null}
        </form>

        <aside className="space-y-4 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-brandBlack">Booking Summary</h2>
          {!hasSelections ? (
            <div className="rounded-xl bg-neutralGray p-4 text-sm text-brandBlack/75">
              No services selected yet. Go to
              {' '}
              <Link className="font-semibold text-deepRed" href="/services">
                Services
              </Link>
              {' '}
              to assign packages and add-ons per vehicle.
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => {
                const selectedServices = getVehicleServices(vehicle.id);
                if (selectedServices.length === 0) {
                  return null;
                }

                return (
                  <article key={vehicle.id} className="rounded-xl border border-black/10 p-3">
                    <p className="font-heading text-base font-bold text-brandBlack">{getVehicleDisplayName(vehicle)}</p>
                    <ul className="mt-2 space-y-1">
                      {selectedServices.map((service) => (
                        <li key={service.id} className="flex items-center justify-between text-xs">
                          <span className="text-brandBlack/75">{service.name}</span>
                          <span className="font-semibold text-brandBlack">${service.price}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
              <div className="border-t border-black/10 pt-3 text-right">
                <p className="text-xs text-brandBlack/60">Estimated total</p>
                <p className="font-heading text-2xl font-extrabold text-deepRed">${getGrandTotal()}</p>
              </div>
            </div>
          )}
        </aside>
      </section>
    </SiteShell>
  );
}
