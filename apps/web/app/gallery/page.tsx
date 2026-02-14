'use client';

import { useMemo, useState } from 'react';

import { SiteShell } from '@/components/layout/site-shell';

interface GalleryItem {
  id: string;
  label: string;
  category: 'exterior' | 'interior' | 'premium' | 'before-after';
}

/**
 * Returns gallery showcase items grouped by category.
 */
function getGalleryItems(): GalleryItem[] {
  return [
    { id: 'g1', label: 'Foam wash and paint correction prep', category: 'exterior' },
    { id: 'g2', label: 'Wheel polish and tire treatment', category: 'exterior' },
    { id: 'g3', label: 'Interior vacuum and console reset', category: 'interior' },
    { id: 'g4', label: 'Seat extraction and odor treatment', category: 'interior' },
    { id: 'g5', label: 'Premium ceramic coating finish', category: 'premium' },
    { id: 'g6', label: 'Premium trim restoration', category: 'premium' },
    { id: 'g7', label: 'Before/after swirl correction set', category: 'before-after' },
    { id: 'g8', label: 'Before/after interior deep clean', category: 'before-after' },
  ];
}

/**
 * Renders the interactive gallery showcase with category filters.
 */
export default function GalleryPage(): JSX.Element {
  const [filter, setFilter] = useState<'all' | GalleryItem['category']>('all');
  const items = getGalleryItems();

  const visibleItems = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.category === filter)),
    [filter, items],
  );

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brandBlack px-4 py-16 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8cc0d622,transparent_58%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-5xl font-semibold sm:text-7xl">Our Work</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 sm:text-xl">
            Real results from real clients. Every project showcases our precision and care.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {[
            ['all', 'All Work'],
            ['exterior', 'Exterior'],
            ['interior', 'Interior'],
            ['premium', 'Premium'],
            ['before-after', 'Before/After'],
          ].map(([id, label]) => {
            const selected = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id as 'all' | GalleryItem['category'])}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? 'border-deepRed bg-deepRed text-white shadow-md'
                    : 'border-black/15 bg-white text-brandBlack hover:border-waterBlue hover:bg-waterBlue/10'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleItems.map((item, index) => (
            <article
              key={item.id}
              className="fade-in-up aspect-[4/5] rounded-2xl border border-black/10 bg-gradient-to-br from-[#0f1913] via-[#172a20] to-[#0f1913] p-4 text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-waterBlue">{item.category}</p>
              <p className="mt-2 text-sm text-white/85">{item.label}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
