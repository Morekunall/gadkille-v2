const DEFAULT_SITE_URL = 'https://gadkille.co';

export const SITE_NAME = 'GadKille';
export const SITE_TAGLINE = 'Fort exploration and trip planning in Maharashtra';

export const getSiteUrl = () => {
  const configured = String(import.meta.env.VITE_SITE_URL || '').trim();
  return (configured || DEFAULT_SITE_URL).replace(/\/$/, '');
};

export const absoluteUrl = (path = '/') => {
  const base = getSiteUrl();
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getDefaultOgImage = () => absoluteUrl('/og-default.png');

export const buildTitle = (pageTitle) => {
  if (!pageTitle) return `${SITE_NAME} — Official Website | Maharashtra Fort Tourism & Trek Booking`;
  if (pageTitle.toLowerCase().includes('gadkille')) return pageTitle;
  return `${pageTitle} | ${SITE_NAME}`;
};

export const DEFAULT_DESCRIPTION =
  'GadKille is the official fort tourism website for Maharashtra. Explore forts, plan treks, book group tours, and discover routes, stays, and guides — GadKille website for seamless fort journeys.';

export const DEFAULT_KEYWORDS =
  'GadKille, GadKille website, gad kille, Maharashtra forts, fort tourism, trek booking, Shivaji Maharaj forts, Lohagad, Visapur, Ramshej, group tours, किल्ले, गडकिल्ले';

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  alternateName: ['GADकिल्ले', 'Gad Kille', 'GadKille website'],
  url: getSiteUrl(),
  logo: absoluteUrl('/og-default.png'),
  description: DEFAULT_DESCRIPTION,
  email: 'gadkille.co@gmail.com',
  telephone: '+91-84326-60285',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Pune',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN'
  },
  sameAs: []
});

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: 'GadKille website',
  url: getSiteUrl(),
  description: DEFAULT_DESCRIPTION,
  inLanguage: ['en-IN', 'mr-IN'],
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: getSiteUrl()
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${getSiteUrl()}/explore?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
});

export const fortJsonLd = (fort, slug) => ({
  '@context': 'https://schema.org',
  '@type': 'TouristAttraction',
  name: fort.name,
  description: fort.description || fort.history || `${fort.name} fort trek and travel guide on GadKille.`,
  url: absoluteUrl(`/fort/${slug}`),
  image: fort.images?.[0] || getDefaultOgImage(),
  address: fort.location
    ? {
        '@type': 'PostalAddress',
        addressLocality: fort.location,
        addressRegion: 'Maharashtra',
        addressCountry: 'IN'
      }
    : undefined
});

export const trekJsonLd = (trek) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: trek.title,
  description: trek.description || `Join ${trek.title} — upcoming fort trek on GadKille.`,
  url: absoluteUrl(`/trek/${trek.slug}`),
  startDate: trek.startDate,
  endDate: trek.endDate,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: trek.fort?.name
    ? {
        '@type': 'Place',
        name: trek.fort.name,
        address: trek.fort.location || 'Maharashtra, India'
      }
    : undefined,
  organizer: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: getSiteUrl()
  },
  offers: trek.pricePerPerson
    ? {
        '@type': 'Offer',
        price: trek.pricePerPerson,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: absoluteUrl(`/trek/${trek.slug}`)
      }
    : undefined
});

export const breadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path)
  }))
});
