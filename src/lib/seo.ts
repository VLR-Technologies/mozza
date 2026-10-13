import type { Metadata } from 'next';
import { branches, restaurant } from '@/config/restaurant';
import { getSeoConfig } from '@/config/seo';

export const publicPages: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Mozza Italia | Pizza, Chicken, Burgers & Ghee Pulav',
    description: 'Explore Mozza Italia in Hyderabad, Shadnagar, Jadcherla and Guntur. Browse pizza, crispy chicken, burgers, ghee pulav, drinks and desserts.',
  },
  '/menu': {
    title: 'Menu',
    description: 'Browse the Mozza Italia menu with serving sizes and prices in rupees. Explore pizza, chicken, burgers, ghee pulav, snacks, drinks and desserts.',
  },
  '/order': {
    title: 'Order Online',
    description: 'Build your Mozza Italia order for pickup, dine-in or delivery. Choose dishes and an outlet, then let the restaurant confirm availability on WhatsApp.',
  },
  '/locations': {
    title: 'Locations',
    description: 'Find Mozza Italia outlets in Hyderabad, Shadnagar, Jadcherla and Guntur. View street addresses, phone numbers, directions and ways to order.',
  },
  '/catering': {
    title: 'Catering & Events',
    description: 'Plan food for birthdays, weddings, office events and bulk orders with Mozza Italia. Send a catering enquiry to your preferred outlet for availability.',
  },
  '/reservation': {
    title: 'Reserve a Table',
    description: 'Request a table at Mozza Italia in Hyderabad, Shadnagar, Jadcherla or Guntur. Share your date, time and guest count; staff confirm availability.',
  },
  '/about': {
    title: 'Our Story',
    description: 'Get to know Mozza Italia and its menu of pizza, crispy chicken, burgers and ghee pulav, with familiar favourites made for sharing.',
  },
  '/gallery': {
    title: 'Food Gallery',
    description: 'Explore illustrative pizza, chicken, burgers, ghee pulav, drinks and desserts in the Mozza Italia food gallery, then find your favourites on the menu.',
  },
  '/contact': {
    title: 'Contact',
    description: 'Call or WhatsApp Mozza Italia, find the right outlet, or ask about an order, table reservation, catering event or franchise enquiry.',
  },
  '/privacy': {
    title: 'Privacy',
    description: 'Read how Mozza Italia handles cart storage, order details, table requests and catering enquiries, including WhatsApp and restaurant service providers.',
  },
};

export const outletContent: Record<string, { introduction: string; visitTitle: string; visit: string }> = {
  hyderabad: {
    introduction: 'Find the Hyderabad outlet in Thukkuguda, Shamshabad. Call or message this team directly before heading over, or browse the menu and start an order for this outlet.',
    visitTitle: 'Visiting Thukkuguda, Shamshabad',
    visit: 'The Hyderabad outlet address is Thukkuguda, Shamshabad, Telangana 501359. Use the map search below for directions, and call the Hyderabad team to confirm the entrance and today’s opening hours.',
  },
  shadnagar: {
    introduction: 'Visit Mozza Italia at 1-11, Padmavati Colony in Shadnagar. This outlet’s phone number also serves as the website’s main contact line for restaurant enquiries.',
    visitTitle: 'Finding us in Padmavati Colony',
    visit: 'Use 1-11, Padmavati Colony, Shadnagar, Telangana 509216 as your destination. If you need help finding the outlet or want to arrange a table, call the Shadnagar team before you travel.',
  },
  jadcherla: {
    introduction: 'The Jadcherla outlet is on Road No. 2 in Vijayanagar Colony, opposite the New Bus Stand. Get directions to Plot No. 5 or contact the Jadcherla team to plan your visit.',
    visitTitle: 'Opposite the New Bus Stand',
    visit: 'Look for Plot No. 5 on Road No. 2, opposite the New Bus Stand in Vijayanagar Colony, Jadcherla, Telangana 509301. The directions link uses this full address; staff can help with the final approach.',
  },
  guntur: {
    introduction: 'Find Mozza Italia in the Hotel Siddhartha Building at 37-224, Brodipet, Guntur. Use this outlet’s own phone or WhatsApp contact for menu availability and visit enquiries.',
    visitTitle: 'At the Hotel Siddhartha Building, Brodipet',
    visit: 'Set your destination to Hotel Siddhartha Building, 37-224, Brodipet, Guntur, Andhra Pradesh 522002. Call the Guntur team if you need help locating the restaurant within the building.',
  },
};

for (const branch of branches) {
  publicPages[`/locations/${branch.id}`] = {
    title: `${branch.name} Outlet`,
    description: `Visit Mozza Italia in ${branchAddressForDescription(branch.id)}. Get directions, call ${branch.phone}, or start an order with the ${branch.name} team.`,
  };
}

function branchAddressForDescription(id: string) {
  const localities: Record<string, string> = {
    hyderabad: 'Thukkuguda, Shamshabad, Hyderabad', shadnagar: 'Padmavati Colony, Shadnagar',
    jadcherla: 'Vijayanagar Colony, Jadcherla', guntur: 'Brodipet, Guntur',
  };
  return localities[id];
}

export const indexablePaths = Object.keys(publicPages);

// Query filters select a view of the same menu/order experience, not new pages.
export function canonicalUrl(path: string, origin = getSeoConfig().origin) {
  const pathname = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (!Object.hasOwn(publicPages, pathname)) throw new Error('Unknown public SEO route.');
  // Match Next.js' root canonical serialization (origin without a trailing slash).
  return origin ? (pathname === '/' ? origin : new URL(pathname, origin).href) : null;
}

export function pageMetadata(path: string): Metadata {
  const pathname = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const page = publicPages[pathname];
  if (!page) throw new Error('Unknown public SEO route.');
  const url = canonicalUrl(path);
  const title = pathname === '/' ? page.title : `${page.title} | ${restaurant.name}`;
  const { origin } = getSeoConfig();
  const image = origin ? {
    url: `${origin}/brand/mozza-italia-logo.png`,
    width: 1600, height: 649, alt: 'Mozza Italia logo',
  } : null;
  return {
    title: { absolute: title }, description: page.description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title, description: page.description, type: 'website', locale: 'en_IN',
      siteName: restaurant.name, ...(url ? { url } : {}), ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: 'summary', title, description: page.description,
      ...(image ? { images: [{ url: image.url, alt: image.alt }] } : {}),
    },
  };
}

export function rootMetadata(): Metadata {
  const { origin, indexable } = getSeoConfig();
  return {
    title: { default: restaurant.name, template: `%s | ${restaurant.name}` },
    applicationName: restaurant.name,
    ...(origin ? { metadataBase: new URL(origin) } : {}),
    robots: { index: indexable, follow: indexable },
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
    icons: { icon: '/brand/mozza-italia.png' },
  };
}
