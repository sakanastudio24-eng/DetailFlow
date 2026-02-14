'use client';

import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';

type PreviewTab = 'customer' | 'owner';

interface TemplateVariable {
  key: string;
  type: 'string' | 'number' | 'boolean';
  fallback: string;
}

interface EmailPreviewConfig {
  title: string;
  subject: string;
  description: string;
  htmlPreview: string;
  variables: TemplateVariable[];
}

/**
 * Returns static mock previews for customer and owner transactional templates.
 */
function getPreviewConfigs(): Record<PreviewTab, EmailPreviewConfig> {
  return {
    customer: {
      title: 'Customer Confirmation Preview',
      subject: 'Booking received: bk_ab12cd34ef56',
      description: 'Sent when customer email confirmation preference is enabled.',
      htmlPreview:
        '<p>Hi Jordan Cruz,</p><p>Thanks for your booking request. We saved your intake details.</p><p><strong>Vehicle:</strong> 2022 Tesla Model 3 (White)</p><p><strong>Selected Services:</strong> Standard Detail, Ceramic Coating</p><p><strong>Estimated Total:</strong> $689</p><p>Next step: choose your appointment time on Cal.com.</p>',
      variables: [
        { key: 'booking.bookingId', type: 'string', fallback: 'bk_xxxxxxxxxxxx' },
        { key: 'booking.submittedAt', type: 'string', fallback: '2026-02-14T19:22:10Z' },
        { key: 'customer.fullName', type: 'string', fallback: 'Jordan Cruz' },
        { key: 'customer.email', type: 'string', fallback: 'jordan@example.com' },
        { key: 'vehicles', type: 'string', fallback: '[{...}]' },
        { key: 'estimate.grandTotal', type: 'number', fallback: '689' },
      ],
    },
    owner: {
      title: 'Owner Notification Preview',
      subject: 'New booking intake bk_ab12cd34ef56',
      description: 'Sent for every accepted booking intake.',
      htmlPreview:
        '<h3>New Booking Intake</h3><p><strong>Customer:</strong> Jordan Cruz</p><p><strong>Contact:</strong> jordan@example.com / (555) 123-4567</p><p><strong>Vehicle 1:</strong> 2022 Tesla Model 3, White</p><p><strong>Services:</strong> Standard Detail, Ceramic Coating</p><p><strong>Estimated Total:</strong> $689</p>',
      variables: [
        { key: 'booking.bookingId', type: 'string', fallback: 'bk_xxxxxxxxxxxx' },
        { key: 'customer.fullName', type: 'string', fallback: 'Jordan Cruz' },
        { key: 'customer.phone', type: 'string', fallback: '(555) 123-4567' },
        { key: 'customer.zipCode', type: 'string', fallback: '90210' },
        { key: 'vehicles', type: 'string', fallback: '[{...}]' },
        { key: 'estimate.grandTotal', type: 'number', fallback: '689' },
      ],
    },
  };
}

/**
 * Renders a public mock email preview page for template design reviews.
 */
export default function EmailPreviewPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<PreviewTab>('customer');
  const previews = useMemo(() => getPreviewConfigs(), []);
  const config = previews[activeTab];

  return (
    <SiteShell>
      <section className="bg-brandBlack px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-waterBlue">Template Preview</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">Email Preview Center</h1>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            Public mock previews for template layout reviews. This page does not call private provider APIs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'customer'
                ? 'bg-deepRed text-white'
                : 'border border-black/15 bg-white text-brandBlack hover:border-waterBlue hover:text-waterBlue'
            }`}
          >
            Customer Confirmation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('owner')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'owner'
                ? 'bg-deepRed text-white'
                : 'border border-black/15 bg-white text-brandBlack hover:border-waterBlue hover:text-waterBlue'
            }`}
          >
            Owner Notification
          </button>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-2xl font-semibold text-brandBlack">{config.title}</h2>
            <p className="mt-2 text-sm text-brandBlack/70">{config.description}</p>
            <div className="mt-4 rounded-xl border border-black/10 bg-neutralGray/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brandBlack/55">Subject</p>
              <p className="mt-1 text-sm font-semibold text-brandBlack">{config.subject}</p>
            </div>
            <div className="mt-4 rounded-xl border border-black/10 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brandBlack/55">HTML Preview</p>
              <div
                className="prose prose-sm mt-3 max-w-none text-brandBlack"
                dangerouslySetInnerHTML={{ __html: config.htmlPreview }}
              />
            </div>
          </article>

          <aside className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <h3 className="font-heading text-xl font-semibold text-brandBlack">Variables Preview</h3>
            <p className="mt-2 text-sm text-brandBlack/70">These are sample payload keys used by transactional email mapping.</p>
            <ul className="mt-4 space-y-2">
              {config.variables.map((variable) => (
                <li key={variable.key} className="rounded-xl border border-black/10 p-3">
                  <p className="text-sm font-semibold text-brandBlack">{variable.key}</p>
                  <p className="mt-1 text-xs text-brandBlack/70">Type: {variable.type}</p>
                  <p className="mt-1 text-xs text-brandBlack/60">Fallback: {variable.fallback}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
