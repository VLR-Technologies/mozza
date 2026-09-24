export const restaurant = {
  name: 'Mozza Italia', branch: 'Shadnagar', region: 'Telangana, India',
  tagline: 'Taste Brings People Together', phone: '+91 99497 99488', whatsapp: '919949799488',
  address: null as string | null, googleMapsUrl: null as string | null,
  instagramUrl: null as string | null, orderUrl: null as string | null,
  reviewUrl: null as string | null, writeReviewUrl: null as string | null,
  rating: 4.4, reviewCount: null as number | null, // Rating supplied by client; count not confirmed.
  hours: null as string | null,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
  // TODO: confirm street address, hours, Maps, social, reviews, ordering URLs and production domain.
};
export const callUrl = `tel:+${restaurant.whatsapp}`;
export function whatsappUrl(message = 'Hi Mozza Italia, please share availability / ordering details.') {
  return `https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(message)}`;
}
export function itemOrderUrl(name: string, size?: string) {
  return whatsappUrl(`Hi Mozza Italia,\nI would like to order:\n\n${name}${size ? ` — ${size}` : ''}\n\nPlease share availability / ordering details.`);
}
