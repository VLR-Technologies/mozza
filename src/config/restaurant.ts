export const restaurant = {
  name: 'Mozza Italia', branch: 'Shadnagar', region: 'Telangana, India',
  tagline: 'Taste Brings People Together', phone: '+91 99497 99488', whatsapp: '919949799488',
  address: null as string | null, googleMapsUrl: null as string | null,
  hours: null as string | null,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
  // TODO: confirm street address, hours, Maps links and production domain.
};

export type Branch = {
  id: string;
  name: string;
  region: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  hours: string | null;
  googleMapsUrl: string | null;
};

// City presence is confirmed by the client. Only Shadnagar currently has a
// verified contact number in this project, so the other branches deliberately
// omit address, hours, phone and directions instead of inventing them.
export const branches: Branch[] = [
  { id: 'hyderabad', name: 'Hyderabad', region: 'Telangana', phone: null, whatsapp: null, address: null, hours: null, googleMapsUrl: null },
  { id: 'shadnagar', name: 'Shadnagar', region: 'Telangana', phone: restaurant.phone, whatsapp: restaurant.whatsapp, address: restaurant.address, hours: restaurant.hours, googleMapsUrl: restaurant.googleMapsUrl },
  { id: 'jadcherla', name: 'Jadcherla', region: 'Telangana', phone: null, whatsapp: null, address: null, hours: null, googleMapsUrl: null },
  { id: 'guntur', name: 'Guntur', region: 'Andhra Pradesh', phone: null, whatsapp: null, address: null, hours: null, googleMapsUrl: null },
];

export const callUrl = `tel:+${restaurant.whatsapp}`;
export function whatsappUrl(message = 'Hi Mozza Italia, please share availability / ordering details.') {
  return `https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(message)}`;
}
export function itemOrderUrl(name: string, size?: string, branch = restaurant.branch) {
  return whatsappUrl(`Hi Mozza Italia,\nI would like to order:\n\n${name}${size ? ` — ${size}` : ''}\nPreferred outlet: ${branch}\n\nPlease share availability / ordering details.`);
}
