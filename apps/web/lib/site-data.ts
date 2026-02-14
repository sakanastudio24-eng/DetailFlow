export interface ServiceItem {
  title: string;
  description: string;
  priceFrom: string;
}

export interface ResultItem {
  title: string;
  detail: string;
}

/**
 * Returns core service cards for the homepage teaser.
 */
export function getHomeServices(): ServiceItem[] {
  return [
    {
      title: 'Basic Detail',
      description: 'Exterior wash, vacuum, windows, and tire shine for weekly upkeep.',
      priceFrom: '$99',
    },
    {
      title: 'Standard Detail',
      description: 'Inside-out refresh with deep interior clean, clay bar, and wax protection.',
      priceFrom: '$189',
    },
    {
      title: 'Premium Detail',
      description: 'Showroom-level correction and long-lasting surface protection package.',
      priceFrom: '$349',
    },
  ];
}

/**
 * Returns key outcome highlights displayed in the homepage results section.
 */
export function getHomeResults(): ResultItem[] {
  return [
    {
      title: 'Paint Clarity Restored',
      detail: 'Swirl-heavy surfaces transformed with deeper gloss and better reflection.',
    },
    {
      title: 'Interior Reset',
      detail: 'Fabric, plastics, and touchpoints cleaned for a fresh and odor-free cabin.',
    },
    {
      title: 'Protection Layered',
      detail: 'Finish sealed to resist weather, road film, and short-term contamination.',
    },
  ];
}
