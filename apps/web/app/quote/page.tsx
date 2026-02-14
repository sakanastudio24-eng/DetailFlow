'use client';

import { useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';
import type { ContactForm } from '@/lib/booking-types';
import { submitContactMessage } from '@/lib/api-client';

/**
 * Renders quote intake page for custom or multi-vehicle requests.
 */
export default function QuotePage(): JSX.Element {
  const [form, setForm] = useState<ContactForm>({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [statusMessage, setStatusMessage] = useState('');

  /**
   * Submits quote request using the contact pipeline.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      await submitContactMessage({
        ...form,
        message: `[QUOTE REQUEST] ${form.message}`,
      });
      setStatusMessage('Quote request sent. We will follow up with an estimate.');
      setForm({ fullName: '', email: '', phone: '', message: '' });
    } catch {
      setStatusMessage('Quote request failed. Please retry.');
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-brandBlack sm:text-4xl">Request a Quote</h1>
        <p className="mt-3 text-sm text-brandBlack/75 sm:text-base">
          Best for special conditions, fleet needs, and custom detail requests.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-black/10 bg-white p-6">
          <input
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            placeholder="Email"
            required
          />
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            placeholder="Phone"
          />
          <textarea
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            className="min-h-32 w-full rounded-lg border border-black/15 px-3 py-2"
            placeholder="Vehicle count, condition, requested services, and timeline"
            required
          />
          <button type="submit" className="w-full rounded-full bg-deepRed px-4 py-3 text-sm font-semibold text-white">
            Submit Quote Request
          </button>
          {statusMessage ? <p className="text-sm text-brandBlack/75">{statusMessage}</p> : null}
        </form>
      </section>
    </SiteShell>
  );
}
