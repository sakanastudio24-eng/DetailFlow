'use client';

import { Calendar, Car, CircleDollarSign, Shield, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';

interface FaqRecord {
  q: string;
  a: string;
  category: 'booking' | 'services' | 'pricing' | 'preparation' | 'maintenance';
}

interface FaqCategoryChip {
  id: 'all' | FaqRecord['category'];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Returns FAQ records used by category filtering.
 */
function getFaqRecords(): FaqRecord[] {
  return [
    { q: 'How long does a detail take?', a: 'Basic takes 2-3 hours, Standard around 4, and Premium around 6+.', category: 'booking' },
    { q: 'Can I book multiple cars at once?', a: 'Yes. The vehicle dock allows separate selections per car.', category: 'booking' },
    { q: 'What is included in the Standard package?', a: 'Standard includes deep interior reset, wax, clay bar, and a full exterior clean.', category: 'services' },
    { q: 'Do you offer ceramic coating?', a: 'Yes, ceramic coating is available as an add-on or premium bundle.', category: 'services' },
    { q: 'How is final pricing confirmed?', a: 'Final pricing is confirmed on-site based on condition and selected scope.', category: 'pricing' },
    { q: 'Do you need water or power on-site?', a: 'No, mobile service setup is prepared for on-location operation.', category: 'preparation' },
    { q: 'How often should I detail my vehicle?', a: 'Most clients book maintenance every 4-8 weeks depending on use.', category: 'maintenance' },
  ];
}

/**
 * Renders FAQ page with category chips and expandable answers.
 */
export default function FaqPage(): JSX.Element {
  const [category, setCategory] = useState<'all' | FaqRecord['category']>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const records = getFaqRecords();

  const visible = useMemo(
    () => (category === 'all' ? records : records.filter((record) => record.category === category)),
    [category, records],
  );
  const chips: FaqCategoryChip[] = [
    { id: 'all', label: 'All Questions', icon: Sparkles },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'services', label: 'Services', icon: Sparkles },
    { id: 'pricing', label: 'Pricing', icon: CircleDollarSign },
    { id: 'preparation', label: 'Preparation', icon: Car },
    { id: 'maintenance', label: 'Maintenance', icon: Shield },
  ];

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brandBlack px-4 py-16 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8cc0d622,transparent_58%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Get answers to common questions about our mobile detailing services.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap justify-center gap-2">
          {chips.map((chip) => {
            const selected = category === chip.id;
            const ChipIcon = chip.icon;

            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setCategory(chip.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? 'border-deepRed bg-deepRed text-white shadow-md'
                    : 'border-black/15 bg-white text-brandBlack hover:border-waterBlue hover:bg-waterBlue/10'
                }`}
              >
                <ChipIcon className="h-4 w-4" />
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-3 rounded-2xl border border-black/10 bg-white p-4">
          {visible.map((record) => {
            const isOpen = expanded === record.q;

            return (
              <article key={record.q} className="rounded-xl border border-black/10 bg-white">
                <button
                  type="button"
                  onClick={() => setExpanded((current) => (current === record.q ? null : record.q))}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-brandBlack">{record.q}</span>
                  <span className="text-brandBlack/55">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen ? <p className="px-4 pb-4 text-sm text-brandBlack/75">{record.a}</p> : null}
              </article>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
