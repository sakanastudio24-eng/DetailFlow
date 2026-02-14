'use client';

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CarFront,
  CheckCircle2,
  Clock3,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { useMemo, useState, type ComponentType } from 'react';

import { SiteShell } from '@/components/layout/site-shell';
import { useBooking } from '@/components/providers/booking-provider';
import type { CustomerBookingForm, VehicleProfile } from '@/lib/booking-types';
import { getSetmoreUrl, submitBookingIntake } from '@/lib/api-client';
import { getAddonServices, getPackageServices } from '@/lib/services-catalog';
import { getVehicleDisplayName } from '@/lib/vehicle-utils';

interface StepItem {
  id: number;
  title: string;
  icon: ComponentType<{ className?: string }>;
}

interface VehicleSizeOption {
  id: 'small' | 'medium' | 'large';
  label: string;
  hint: string;
}

const MAX_VEHICLES = 4;

const INITIAL_FORM: CustomerBookingForm = {
  fullName: '',
  email: '',
  phone: '',
  zipCode: '',
  sendEmailConfirmation: true,
  sendSmsConfirmation: false,
  acceptedSmsConsent: false,
  notes: '',
  acceptedConsent: false,
};

/**
 * Returns the booking step sequence used by the progress header.
 */
function getBookingSteps(): StepItem[] {
  return [
    { id: 1, title: 'Your Details', icon: User },
    { id: 2, title: 'Enhancements', icon: Sparkles },
    { id: 3, title: 'Schedule', icon: Calendar },
  ];
}

/**
 * Returns available vehicle sizes shown during booking step one.
 */
function getVehicleSizes(): VehicleSizeOption[] {
  return [
    { id: 'small', label: 'Small', hint: 'Sedan / Coupe' },
    { id: 'medium', label: 'Medium', hint: 'SUV / Crossover' },
    { id: 'large', label: 'Large', hint: 'Truck / Van' },
  ];
}

/**
 * Validates confirmation preference inputs for email and SMS updates.
 */
function hasValidConfirmationPreference(form: CustomerBookingForm): boolean {
  const selectedAnyChannel = form.sendEmailConfirmation || form.sendSmsConfirmation;
  const smsConsentSatisfied = !form.sendSmsConfirmation || form.acceptedSmsConsent;
  return selectedAnyChannel && smsConsentSatisfied;
}

/**
 * Validates required step-one booking fields.
 */
function isStepOneValid(form: CustomerBookingForm, hasPackage: boolean): boolean {
  return (
    hasPackage &&
    form.fullName.trim().length >= 2 &&
    form.email.includes('@') &&
    form.phone.trim().length >= 10 &&
    form.zipCode.trim().length >= 5 &&
    hasValidConfirmationPreference(form) &&
    form.acceptedConsent
  );
}

/**
 * Formats numeric totals into display currency strings.
 */
function formatCurrency(value: number): string {
  return `$${value.toFixed(0)}`;
}

/**
 * Builds a compact vehicle label for dock cards.
 */
function getVehicleHint(vehicle: VehicleProfile): string {
  const parts = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'No vehicle details yet';
}

/**
 * Renders the booking workflow with improved visual hierarchy and flow.
 */
export default function BookingPage(): JSX.Element {
  const {
    vehicles,
    activeVehicleId,
    setActiveVehicleId,
    addVehicle,
    removeVehicle,
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
  const sizes = getVehicleSizes();
  const packageServices = useMemo(() => getPackageServices(), []);
  const addonServices = useMemo(() => getAddonServices(), []);
  const activeVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === activeVehicleId) ?? vehicles[0],
    [activeVehicleId, vehicles],
  );

  const selectedServiceIds = activeVehicle?.serviceIds ?? [];
  const selectedPackageId = selectedServiceIds.find((serviceId) => serviceId.startsWith('pkg-'));
  const selectedPackage = selectedPackageId
    ? packageServices.find((item) => item.id === selectedPackageId)
    : undefined;
  const selectedAddons = addonServices.filter((service) => selectedServiceIds.includes(service.id));
  const selectedVehicles = useMemo(
    () => vehicles.filter((vehicle) => getVehicleServices(vehicle.id).length > 0),
    [getVehicleServices, vehicles],
  );
  const hasAnyService = vehicles.some((vehicle) => vehicle.serviceIds.length > 0);
  const stepOneValid = isStepOneValid(form, Boolean(selectedPackageId));

  /**
   * Updates one customer form field while preserving other keys.
   */
  function updateCustomerField<K extends keyof CustomerBookingForm>(key: K, value: CustomerBookingForm[K]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  /**
   * Updates one active vehicle field during booking.
   */
  function updateActiveVehicleField(field: 'make' | 'model' | 'year' | 'color', value: string): void {
    if (!activeVehicle) {
      return;
    }

    updateVehicle(activeVehicle.id, { [field]: value });
  }

  /**
   * Adds another vehicle to the booking dock up to configured max.
   */
  function handleAddVehicle(): void {
    if (vehicles.length >= MAX_VEHICLES) {
      setStatusMessage(`Up to ${MAX_VEHICLES} vehicles can be booked in one request.`);
      return;
    }

    addVehicle();
    setStatusMessage('');
  }

  /**
   * Removes one vehicle from the booking dock.
   */
  function handleRemoveVehicle(vehicleId: string): void {
    removeVehicle(vehicleId);
    setStatusMessage('');
  }

  /**
   * Advances to the next step when current-step validation passes.
   */
  function goNext(): void {
    if (step === 1 && !stepOneValid) {
      setStatusMessage('Complete required details, select one package, and confirm email/SMS preferences to continue.');
      return;
    }

    setStatusMessage('');
    setStep((current) => Math.min(current + 1, steps.length));
  }

  /**
   * Moves back to the previous booking step.
   */
  function goBack(): void {
    setStatusMessage('');
    setStep((current) => Math.max(current - 1, 1));
  }

  /**
   * Submits booking intake and redirects customer to Setmore.
   */
  async function handleSubmitBooking(): Promise<void> {
    if (!stepOneValid || !hasAnyService) {
      setStatusMessage('Please complete details, confirmation preferences, and service selections before submitting.');
      return;
    }

    setSubmitting(true);
    setStatusMessage('Submitting your booking intake...');

    try {
      await submitBookingIntake({ customer: form, vehicles });
      setStatusMessage('Intake saved. Redirecting to Setmore...');
      clearAll();
      window.location.href = getSetmoreUrl();
    } catch {
      setStatusMessage('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brandBlack px-4 py-10 text-white sm:px-6 sm:py-12 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8cc0d636,transparent_65%)]" />
        <div className="relative mx-auto max-w-6xl rounded-[28px] border border-white/15 bg-white/10 px-4 py-6 backdrop-blur-md sm:rounded-[30px] sm:px-8 sm:py-8 md:px-10 md:py-9">
          <h1 className="text-center font-heading text-2xl font-semibold sm:text-4xl md:text-5xl">Book Your Appointment</h1>
          <p className="mt-2 text-center text-sm text-white/75 sm:text-base">Three simple steps to a pristine vehicle.</p>

          <div className="mx-auto mt-6 max-w-4xl">
            <div className="h-2 rounded-full bg-black/30">
              <div
                className="h-2 rounded-full bg-deepRed transition-all duration-500"
                style={{ width: `${(step / steps.length) * 100}%` }}
              />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {steps.map((item) => {
                const Icon = item.icon;
                const active = item.id === step;
                const complete = item.id < step;

                return (
                  <div key={item.id} className="flex flex-col items-center gap-2 text-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition duration-300 ${
                        complete
                          ? 'border-green-300 bg-green-500 text-white'
                          : active
                            ? 'border-waterBlue bg-waterBlue text-brandBlack'
                            : 'border-white/30 bg-white/5 text-white/70'
                      }`}
                    >
                      {complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <p className={`text-xs sm:text-sm ${active ? 'text-white' : 'text-white/70'}`}>{item.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px]">
        <div className="space-y-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="rounded-2xl border border-black/10 bg-neutralGray/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brandBlack/60">Vehicle Deck</p>
                <p className="text-sm text-brandBlack/70">Manage multiple cars in one booking.</p>
              </div>
              <button
                type="button"
                onClick={handleAddVehicle}
                className="inline-flex items-center gap-2 rounded-full border border-waterBlue bg-white px-3 py-1.5 text-xs font-semibold text-waterBlue transition duration-300 hover:bg-waterBlue/10"
              >
                <Plus className="h-4 w-4" /> Add Vehicle
              </button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => {
                const active = vehicle.id === activeVehicleId;
                return (
                  <article
                    key={vehicle.id}
                    className={`rounded-xl border bg-white p-3 transition-all duration-300 ${
                      active ? 'border-deepRed shadow-sm' : 'border-black/10 hover:border-waterBlue'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveVehicleId(vehicle.id)}
                        className="text-left"
                      >
                        <p className="font-semibold text-brandBlack">{getVehicleDisplayName(vehicle)}</p>
                        <p className="text-xs text-brandBlack/60">{getVehicleHint(vehicle)}</p>
                      </button>
                      {vehicles.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveVehicle(vehicle.id)}
                          className="rounded-full p-1 text-brandBlack/55 transition hover:bg-neutralGray hover:text-deepRed"
                          aria-label={`Remove ${getVehicleDisplayName(vehicle)}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2 text-xs">
                      <span className="text-brandBlack/65">{vehicle.serviceIds.length} selections</span>
                      <span className="font-semibold text-deepRed">{formatCurrency(getVehicleTotal(vehicle.id))}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {step === 1 ? (
            <section className="space-y-4 rounded-2xl border border-black/10 p-4 transition-all duration-300">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-brandBlack">Your Details</h2>
                <p className="mt-1 text-sm text-brandBlack/65">Pick one package, set vehicle size, and complete contact info.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {packageServices.map((service) => {
                  const selected = selectedPackageId === service.id;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setVehiclePackage(activeVehicleId, service.id)}
                      className={`rounded-xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                        selected
                          ? 'border-deepRed bg-deepRed/10 shadow-md'
                          : 'border-black/10 bg-white hover:border-waterBlue hover:bg-waterBlue/10'
                      }`}
                    >
                      <p className="font-heading text-lg font-semibold text-brandBlack">{service.name}</p>
                      <p className="mt-1 text-xs text-brandBlack/60">{service.description}</p>
                      <p className="mt-3 font-heading text-2xl font-extrabold text-deepRed">{formatCurrency(service.price)}</p>
                    </button>
                  );
                })}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-brandBlack/80">Vehicle Size</h3>
                <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sizes.map((size) => {
                    const selected = activeVehicle?.size === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => activeVehicle && updateVehicle(activeVehicle.id, { size: size.id })}
                        className={`rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                          selected
                            ? 'border-deepRed bg-deepRed/10'
                            : 'border-black/10 bg-white hover:border-waterBlue hover:bg-waterBlue/10'
                        }`}
                      >
                        <p className="font-heading text-base font-semibold text-brandBlack">{size.label}</p>
                        <p className="text-xs text-brandBlack/55">{size.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-brandBlack/75">
                  Full Name *
                  <input
                    value={form.fullName}
                    onChange={(event) => updateCustomerField('fullName', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 transition duration-300 focus:border-waterBlue focus:outline-none"
                    placeholder="John Doe"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  Email *
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateCustomerField('email', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 transition duration-300 focus:border-waterBlue focus:outline-none"
                    placeholder="john@example.com"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  Phone *
                  <input
                    value={form.phone}
                    onChange={(event) => updateCustomerField('phone', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 transition duration-300 focus:border-waterBlue focus:outline-none"
                    placeholder="(555) 123-4567"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  ZIP Code *
                  <input
                    value={form.zipCode}
                    onChange={(event) => updateCustomerField('zipCode', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 transition duration-300 focus:border-waterBlue focus:outline-none"
                    placeholder="90210"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-sm font-semibold text-brandBlack/75">
                  Year
                  <input
                    value={activeVehicle?.year ?? ''}
                    onChange={(event) => updateActiveVehicleField('year', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 transition duration-300 focus:border-waterBlue focus:outline-none"
                    placeholder="2020"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  Make
                  <input
                    value={activeVehicle?.make ?? ''}
                    onChange={(event) => updateActiveVehicleField('make', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 transition duration-300 focus:border-waterBlue focus:outline-none"
                    placeholder="Toyota"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  Model
                  <input
                    value={activeVehicle?.model ?? ''}
                    onChange={(event) => updateActiveVehicleField('model', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 transition duration-300 focus:border-waterBlue focus:outline-none"
                    placeholder="Camry"
                  />
                </label>
                <label className="text-sm font-semibold text-brandBlack/75">
                  Color
                  <input
                    value={activeVehicle?.color ?? ''}
                    onChange={(event) => updateActiveVehicleField('color', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 transition duration-300 focus:border-waterBlue focus:outline-none"
                    placeholder="Silver"
                  />
                </label>
              </div>

              <section className="rounded-xl border border-black/10 bg-neutralGray/65 p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-brandBlack">Confirmation Preferences</h3>
                <p className="mt-1 text-xs text-brandBlack/70">
                  Choose how you want appointment confirmations and status updates.
                </p>

                <div className="mt-3 space-y-2">
                  <label className="flex items-start gap-2 rounded-lg border border-waterBlue/30 bg-white px-3 py-2 text-sm text-brandBlack/80">
                    <input
                      type="checkbox"
                      checked={form.sendEmailConfirmation}
                      onChange={(event) => updateCustomerField('sendEmailConfirmation', event.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      Email confirmations to <span className="font-semibold text-brandBlack">your email address</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2 rounded-lg border border-waterBlue/30 bg-white px-3 py-2 text-sm text-brandBlack/80">
                    <input
                      type="checkbox"
                      checked={form.sendSmsConfirmation}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        updateCustomerField('sendSmsConfirmation', checked);
                        if (!checked) {
                          updateCustomerField('acceptedSmsConsent', false);
                        }
                      }}
                      className="mt-1"
                    />
                    <span>
                      SMS confirmations to <span className="font-semibold text-brandBlack">your phone number</span>
                    </span>
                  </label>
                </div>

                {form.sendSmsConfirmation ? (
                  <label className="mt-3 flex items-start gap-2 rounded-lg border border-deepRed/30 bg-deepRed/5 px-3 py-2 text-xs text-brandBlack/80">
                    <input
                      type="checkbox"
                      checked={form.acceptedSmsConsent}
                      onChange={(event) => updateCustomerField('acceptedSmsConsent', event.target.checked)}
                      className="mt-0.5"
                    />
                    I agree to receive booking-related SMS confirmations. Message/data rates may apply.
                  </label>
                ) : null}
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
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-4 rounded-2xl border border-black/10 p-4 transition-all duration-300">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-brandBlack">Enhancements</h2>
                <p className="mt-1 text-sm text-brandBlack/65">Select optional add-ons for {activeVehicle ? getVehicleDisplayName(activeVehicle) : 'this vehicle'}.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {addonServices.map((service) => {
                  const selected = selectedServiceIds.includes(service.id);

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleServiceForVehicle(activeVehicleId, service)}
                      className={`rounded-xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                        selected
                          ? 'border-deepRed bg-deepRed/10 shadow-md'
                          : 'border-black/10 bg-white hover:border-waterBlue hover:bg-waterBlue/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-heading text-lg font-semibold text-brandBlack">{service.name}</p>
                        {selected ? <CheckCircle2 className="h-5 w-5 text-deepRed" /> : null}
                      </div>
                      <p className="mt-1 text-xs text-brandBlack/60">{service.description}</p>
                      <p className="mt-3 text-sm text-brandBlack/70">{service.duration}</p>
                      <p className="mt-1 font-heading text-2xl font-extrabold text-deepRed">{formatCurrency(service.price)}</p>
                    </button>
                  );
                })}
              </div>

              <label className="block text-sm font-semibold text-brandBlack/75">
                Special Notes
                <textarea
                  value={form.notes}
                  onChange={(event) => updateCustomerField('notes', event.target.value)}
                  className="mt-1 min-h-24 w-full rounded-lg border border-black/15 px-3 py-2 transition duration-300 focus:border-waterBlue focus:outline-none"
                  placeholder="Gate code, preferred access, or condition notes..."
                />
              </label>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-4 rounded-2xl border border-black/10 p-4 transition-all duration-300">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-brandBlack">Schedule</h2>
                <p className="mt-1 text-sm text-brandBlack/65">Submit your details, then choose your appointment on Setmore.</p>
              </div>

              <div className="rounded-xl border border-black/10 bg-neutralGray p-4">
                <p className="text-sm text-brandBlack/75">
                  We pre-save your intake first so your booking request stays attached to your service selections.
                </p>
                <a
                  href={getSetmoreUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-deepRed px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-brandBlack"
                >
                  Open Setmore Calendar <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <ul className="space-y-2 text-sm text-brandBlack/75">
                <li className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-waterBlue" /> Instant confirmation after slot selection.</li>
                <li className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-waterBlue" /> Intake details are saved before redirect.</li>
              </ul>
            </section>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-full border border-waterBlue px-4 py-2 text-sm font-semibold text-waterBlue transition duration-300 hover:bg-waterBlue/10"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <span />}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-full bg-deepRed px-5 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-brandBlack"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmitBooking()}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-deepRed px-5 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-brandBlack disabled:opacity-65"
              >
                {submitting ? 'Submitting...' : 'Submit and Continue'}
              </button>
            )}
          </div>

          {statusMessage ? (
            <p className={`text-sm ${statusMessage.toLowerCase().includes('failed') ? 'text-deepRed' : 'text-brandBlack/70'}`}>
              {statusMessage}
            </p>
          ) : null}
        </div>

        <aside className="h-fit rounded-2xl border border-black/10 bg-white shadow-sm lg:sticky lg:top-28">
          <div className="rounded-t-2xl bg-gradient-to-r from-brandBlack to-[#1a1514] px-4 py-3 text-white">
            <h2 className="inline-flex items-center gap-2 font-heading text-xl font-semibold">
              <ShieldCheck className="h-5 w-5 text-waterBlue" /> Your Selection
            </h2>
          </div>
          <div className="space-y-3 p-4">
            <article className="rounded-xl border border-black/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brandBlack/55">Active Vehicle</p>
              <p className="mt-1 inline-flex items-center gap-2 font-semibold text-brandBlack">
                <CarFront className="h-4 w-4 text-waterBlue" />
                {activeVehicle ? getVehicleDisplayName(activeVehicle) : 'Vehicle'}
              </p>
              <p className="mt-1 text-xs text-brandBlack/60">{activeVehicle ? getVehicleHint(activeVehicle) : ''}</p>
            </article>

            {selectedVehicles.length > 0 ? (
              <article className="rounded-xl border border-black/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brandBlack/55">Booked Vehicles</p>
                <ul className="mt-2 space-y-2">
                  {selectedVehicles.map((vehicle) => (
                    <li key={vehicle.id} className="flex items-center justify-between text-xs">
                      <span className="text-brandBlack/75">{getVehicleDisplayName(vehicle)}</span>
                      <span className="font-semibold text-brandBlack">{formatCurrency(getVehicleTotal(vehicle.id))}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}

            {selectedPackage ? (
              <article className="rounded-xl border border-black/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brandBlack/55">Package</p>
                <p className="mt-1 font-heading text-lg font-semibold text-brandBlack">{selectedPackage.name}</p>
                <p className="mt-1 text-sm font-semibold text-deepRed">{formatCurrency(selectedPackage.price)}</p>
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
                      <span className="font-semibold text-brandBlack">{formatCurrency(service.price)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-brandBlack/60">No add-ons selected.</p>
              )}
            </article>

            <div className="rounded-xl bg-neutralGray p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-brandBlack">Vehicle Subtotal</span>
                <span className="font-heading text-2xl font-extrabold text-deepRed">
                  {formatCurrency(activeVehicle ? getVehicleTotal(activeVehicle.id) : 0)}
                </span>
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
              <p className="font-heading text-2xl font-extrabold text-deepRed">{formatCurrency(getGrandTotal())}</p>
            </div>
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}
