'use client';

import { Calendar, Check, ShieldCheck, Sparkles, User } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';
import { useBooking } from '@/components/providers/booking-provider';
import type { CustomerBookingForm } from '@/lib/booking-types';
import { getSetmoreUrl, submitBookingIntake } from '@/lib/api-client';
import { getAddonServices, getPackageServices } from '@/lib/services-catalog';
import { getVehicleDisplayName } from '@/lib/vehicle-utils';

interface StepItem {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const INITIAL_FORM: CustomerBookingForm = {
  fullName: '',
  email: '',
  phone: '',
  zipCode: '',
  notes: '',
  acceptedConsent: false,
};

/**
 * Returns the three booking step definitions.
 */
function getBookingSteps(): StepItem[] {
  return [
    { id: 1, title: 'Your Details', icon: User },
    { id: 2, title: 'Enhancements', icon: Sparkles },
    { id: 3, title: 'Schedule', icon: Calendar },
  ];
}

/**
 * Returns whether a customer form has required fields completed.
 */
function isCustomerFormValid(form: CustomerBookingForm): boolean {
  return (
    form.fullName.trim().length >= 2 &&
    form.email.includes('@') &&
    form.phone.trim().length >= 10 &&
    form.zipCode.trim().length >= 5 &&
    form.acceptedConsent
  );
}

/**
 * Renders the booking page with a multi-step appointment flow.
 */
export default function BookingPage(): JSX.Element {
  const {
    vehicles,
    activeVehicleId,
    setActiveVehicleId,
    updateVehicle,
    setVehiclePackage,
    toggleServiceForVehicle,
    getVehicleServices,
    getVehicleTotal,
    getGrandTotal,
    clearAll,
  } = useBooking();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CustomerBookingForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const steps = getBookingSteps();
  const packageServices = useMemo(() => getPackageServices(), []);
  const addonServices = useMemo(() => getAddonServices(), []);
  const activeVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === activeVehicleId) ?? vehicles[0],
    [activeVehicleId, vehicles],
  );
  const activeServiceIds = activeVehicle?.serviceIds ?? [];
  const selectedPackageId = activeServiceIds.find((serviceId) => serviceId.startsWith('pkg-'));
  const selectedPackage = selectedPackageId ? packageServices.find((item) => item.id === selectedPackageId) : undefined;
  const selectedAddons = addonServices.filter((service) => activeServiceIds.includes(service.id));
  const hasAnyService = vehicles.some((vehicle) => vehicle.serviceIds.length > 0);
  const canAdvanceFromStepOne = Boolean(activeVehicle) && Boolean(selectedPackageId) && isCustomerFormValid(form);

  /**
   * Updates a customer form field.
   */
  function updateCustomerField<K extends keyof CustomerBookingForm>(key: K, value: CustomerBookingForm[K]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  /**
   * Updates one active vehicle profile field.
   */
  function updateActiveVehicleField(field: 'make' | 'model' | 'year' | 'color', value: string): void {
    if (!activeVehicle) {
      return;
    }

    updateVehicle(activeVehicle.id, { [field]: value });
  }

  /**
   * Moves to the next booking step when validation passes.
   */
  function goToNextStep(): void {
    if (step === 1 && !canAdvanceFromStepOne) {
      setStatusMessage('Complete details and select a package before continuing.');
      return;
    }

    setStatusMessage('');
    setStep((current) => Math.min(current + 1, steps.length));
  }

  /**
   * Moves to the previous step when available.
   */
  function goToPreviousStep(): void {
    setStatusMessage('');
    setStep((current) => Math.max(current - 1, 1));
  }

  /**
   * Submits booking intake and redirects customer to Setmore.
   */
  async function submitBooking(): Promise<void> {
    if (!canAdvanceFromStepOne || !hasAnyService) {
      setStatusMessage('Please complete booking details and service selections first.');
      return;
    }

    setSubmitting(true);
    setStatusMessage('Submitting your intake...');

    try {
      await submitBookingIntake({ customer: form, vehicles });
      setStatusMessage('Saved. Redirecting to Setmore...');
      clearAll();
      window.location.href = getSetmoreUrl();
    } catch {
      setStatusMessage('Submission failed. Please retry in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brandBlack px-4 py-16 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8cc0d633,transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="rounded-[32px] border border-white/15 bg-white/10 px-6 py-8 backdrop-blur-md sm:px-10 sm:py-10">
            <h1 className="text-center font-heading text-5xl font-semibold sm:text-7xl">Book Your Appointment</h1>
            <p className="mt-3 text-center text-base text-white/80 sm:text-xl">Three simple steps to a pristine vehicle.</p>

            <div className="mx-auto mt-8 max-w-4xl">
              <div className="h-2 rounded-full bg-black/30">
                <div className="h-2 rounded-full bg-deepRed transition-all duration-500" style={{ width: `${(step / steps.length) * 100}%` }} />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {steps.map((item) => {
                  const Icon = item.icon;
                  const active = item.id === step;
                  const complete = item.id < step;

                  return (
                    <div key={item.id} className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition duration-300 ${
                          complete
                            ? 'border-green-300 bg-green-500 text-white'
                            : active
                            ? 'border-waterBlue bg-waterBlue text-brandBlack'
                            : 'border-white/30 bg-white/5 text-white/65'
                        }`}
                      >
                        {complete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-white/65'}`}>{item.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {vehicles.map((vehicle) => {
              const active = vehicle.id === activeVehicleId;
              return (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => setActiveVehicleId(vehicle.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active ? 'border-deepRed bg-deepRed text-white' : 'border-black/15 text-brandBlack hover:border-waterBlue'
                  }`}
                >
                  {getVehicleDisplayName(vehicle)}
                </button>
              );
            })}
          </div>

          {step === 1 ? (
            <>
              <section>
                <h2 className="font-heading text-3xl font-semibold text-brandBlack">Your Details</h2>
                <p className="mt-1 text-sm text-brandBlack/65">Select package and vehicle profile to start booking.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {packageServices.map((service) => {
                    const selected = selectedPackageId === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setVehiclePackage(activeVehicleId, service.id)}
                        className={`rounded-xl border p-4 text-left transition duration-300 ${
                          selected
                            ? 'border-deepRed bg-deepRed/10 shadow-md'
                            : 'border-black/10 bg-white hover:-translate-y-0.5 hover:border-waterBlue hover:bg-waterBlue/10'
                        }`}
                      >
                        <p className="font-heading text-xl font-bold text-brandBlack">{service.name}</p>
                        <p className="mt-1 text-xs text-brandBlack/60">{service.description}</p>
                        <p className="mt-3 font-heading text-3xl font-extrabold text-deepRed">${service.price}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-brandBlack/75">
                  Full Name *
                  <input
                    value={form.fullName}
                    onChange={(event) => updateCustomerField('fullName', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="John Doe"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  Email *
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateCustomerField('email', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="john@example.com"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  Phone *
                  <input
                    value={form.phone}
                    onChange={(event) => updateCustomerField('phone', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="(555) 123-4567"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  ZIP Code *
                  <input
                    value={form.zipCode}
                    onChange={(event) => updateCustomerField('zipCode', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="90210"
                  />
                </label>
              </section>

              <section className="grid gap-3 sm:grid-cols-4">
                <label className="text-sm font-semibold text-brandBlack/75">
                  Year
                  <input
                    value={activeVehicle?.year ?? ''}
                    onChange={(event) => updateActiveVehicleField('year', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="2020"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  Make
                  <input
                    value={activeVehicle?.make ?? ''}
                    onChange={(event) => updateActiveVehicleField('make', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="Toyota"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  Model
                  <input
                    value={activeVehicle?.model ?? ''}
                    onChange={(event) => updateActiveVehicleField('model', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="Camry"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  Color
                  <input
                    value={activeVehicle?.color ?? ''}
                    onChange={(event) => updateActiveVehicleField('color', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="Silver"
                  />
                </label>
              </section>

              <label className="flex items-start gap-2 rounded-xl border border-waterBlue/35 bg-waterBlue/10 px-4 py-3 text-sm text-brandBlack/80">
                <input
                  type="checkbox"
                  checked={form.acceptedConsent}
                  onChange={(event) => updateCustomerField('acceptedConsent', event.target.checked)}
                  className="mt-1"
                />
                I agree to booking terms and consent to contact for scheduling updates.
              </label>
            </>
          ) : null}

          {step === 2 ? (
            <section>
              <h2 className="font-heading text-3xl font-semibold text-brandBlack">Enhancements</h2>
              <p className="mt-1 text-sm text-brandBlack/65">Optional services to maximize finish quality.</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {addonServices.map((service) => {
                  const selected = activeServiceIds.includes(service.id);

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleServiceForVehicle(activeVehicleId, service)}
                      className={`rounded-xl border p-4 text-left transition duration-300 ${
                        selected
                          ? 'border-deepRed bg-deepRed/10 shadow-md'
                          : 'border-black/10 bg-white hover:-translate-y-0.5 hover:border-waterBlue hover:bg-waterBlue/10'
                      }`}
                    >
                      <p className="font-heading text-xl font-bold text-brandBlack">{service.name}</p>
                      <p className="mt-1 text-xs text-brandBlack/60">{service.description}</p>
                      <p className="mt-3 font-heading text-3xl font-extrabold text-deepRed">${service.price}</p>
                    </button>
                  );
                })}
              </div>

              <label className="mt-4 block text-sm font-semibold text-brandBlack/75">
                Special Notes
                <textarea
                  value={form.notes}
                  onChange={(event) => updateCustomerField('notes', event.target.value)}
                  className="mt-1 min-h-24 w-full rounded-lg border border-black/15 px-3 py-2"
                  placeholder="Gate code, preferred access, priority concerns..."
                />
              </label>
            </section>
          ) : null}

          {step === 3 ? (
            <section>
              <h2 className="font-heading text-3xl font-semibold text-brandBlack">Schedule</h2>
              <p className="mt-1 text-sm text-brandBlack/65">Confirm your intake and continue to Setmore for time-slot selection.</p>

              <div className="mt-4 rounded-xl border border-black/10 bg-neutralGray p-4">
                <div className="aspect-[16/9] w-full rounded-xl border border-black/10 bg-white p-4">
                  <p className="text-sm text-brandBlack/70">
                    After clicking submit, you will be redirected to Setmore to choose your final appointment date and time.
                  </p>
                  <a
                    href={getSetmoreUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center rounded-full border border-deepRed px-4 py-2 text-sm font-semibold text-deepRed transition hover:bg-deepRed hover:text-white"
                  >
                    Preview Setmore Link
                  </a>
                </div>
              </div>
            </section>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="rounded-full border border-waterBlue px-4 py-2 text-sm font-semibold text-waterBlue transition hover:bg-waterBlue/10"
              >
                Back
              </button>
            ) : <span />}

            {step < 3 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="rounded-full bg-deepRed px-5 py-2 text-sm font-semibold text-white transition hover:bg-brandBlack"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void submitBooking()}
                disabled={submitting}
                className="rounded-full bg-deepRed px-5 py-2 text-sm font-semibold text-white transition hover:bg-brandBlack disabled:opacity-65"
              >
                {submitting ? 'Submitting...' : 'Submit Intake and Continue'}
              </button>
            )}
          </div>

          {statusMessage ? <p className="text-sm text-brandBlack/70">{statusMessage}</p> : null}
        </div>

        <aside className="sticky top-28 h-fit rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="rounded-t-2xl bg-gradient-to-r from-brandBlack to-[#1a1514] px-4 py-3 text-white">
            <h2 className="inline-flex items-center gap-2 font-heading text-2xl font-semibold">
              <ShieldCheck className="h-5 w-5 text-waterBlue" /> Your Selection
            </h2>
          </div>
          <div className="space-y-3 p-4">
            {selectedPackage ? (
              <article className="rounded-xl border border-black/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brandBlack/55">Package</p>
                <p className="mt-1 font-heading text-xl font-bold text-brandBlack">{selectedPackage.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-brandBlack/60">{activeVehicle ? getVehicleDisplayName(activeVehicle) : 'Vehicle'}</span>
                  <span className="font-heading text-2xl font-extrabold text-deepRed">${selectedPackage.price}</span>
                </div>
              </article>
            ) : (
              <p className="rounded-xl bg-neutralGray p-3 text-sm text-brandBlack/70">Select a package to continue.</p>
            )}

            <article className="rounded-xl border border-black/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brandBlack/55">Add-Ons</p>
              {selectedAddons.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {selectedAddons.map((service) => (
                    <li key={service.id} className="flex items-center justify-between text-xs">
                      <span className="text-brandBlack/75">{service.name}</span>
                      <span className="font-semibold text-brandBlack">${service.price}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-brandBlack/60">No add-ons selected.</p>
              )}
            </article>

            <div className="rounded-xl bg-neutralGray p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-brandBlack">Subtotal</span>
                <span className="font-heading text-3xl font-extrabold text-deepRed">${activeVehicle ? getVehicleTotal(activeVehicle.id) : 0}</span>
              </div>
              <p className="mt-1 text-xs text-brandBlack/60">Final price confirmed on-site</p>
            </div>

            <div className="rounded-xl border border-black/10 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-brandBlack/60">
                <span>Booking Progress</span>
                <span>Step {step} of {steps.length}</span>
              </div>
              <div className="h-2 rounded-full bg-black/10">
                <div className="h-2 rounded-full bg-brandBlack transition-all duration-500" style={{ width: `${(step / steps.length) * 100}%` }} />
              </div>
            </div>

            <div className="border-t border-black/10 pt-3 text-right">
              <p className="text-xs text-brandBlack/60">All vehicles total</p>
              <p className="font-heading text-2xl font-extrabold text-deepRed">${getGrandTotal()}</p>
            </div>
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}
