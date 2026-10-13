const defaultContact = { phone: '+91 99497 99488', whatsapp: '919949799488' };
export const restaurant = {
  name: 'Mozza Italia', branch: 'Shadnagar', region: 'Telangana, India',
  tagline: 'Taste Brings People Together', ...defaultContact,
  address: '1-11, Padmavati Colony, Shadnagar, Telangana 509216', googleMapsUrl: null as string | null,
  hours: null as string | null,
  features: { delivery: true, tableNumber: false },
  // Street addresses and production domain confirmed by the owner on 13 Oct 2026.
  // TODO: confirm hours and exact Google Maps listing URLs.
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
  postalAddress?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: 'IN';
  };
  // Google Maps search for this exact outlet (restaurant name + street address
  // supplied by the client). Used by BranchMap for both the tile map and the
  // maximized map, so the two views always show the same location.
  mapQuery: string;
};

// Owner-confirmed contacts and map-query addresses. Hours/listing URLs are pending.
export const branches: Branch[] = [
  { id: 'hyderabad', name: 'Hyderabad', region: 'Telangana', phone: '+91 87123 57688', whatsapp: '918712357688', address: 'Thukkuguda, Shamshabad, Telangana 501359', hours: null, googleMapsUrl: null, mapQuery: 'Mozza Italia, Thukkuguda, Shamshabad, Telangana 501359', postalAddress: { streetAddress: 'Thukkuguda', addressLocality: 'Shamshabad', addressRegion: 'Telangana', postalCode: '501359', addressCountry: 'IN' } },
  { id: 'shadnagar', name: 'Shadnagar', region: 'Telangana', phone: restaurant.phone, whatsapp: restaurant.whatsapp, address: restaurant.address, hours: restaurant.hours, googleMapsUrl: restaurant.googleMapsUrl, mapQuery: 'Mozza Italia, 1-11, Padmavati Colony, Shadnagar, Telangana 509216', postalAddress: { streetAddress: '1-11, Padmavati Colony', addressLocality: 'Shadnagar', addressRegion: 'Telangana', postalCode: '509216', addressCountry: 'IN' } },
  { id: 'jadcherla', name: 'Jadcherla', region: 'Telangana', phone: '+91 99510 47424', whatsapp: '919951047424', address: 'Rd No 2, Plot No 5, Opp. New Bus Stand, Vijayanagar Colony, Jadcherla, Telangana 509301', hours: null, googleMapsUrl: null, mapQuery: 'Mozza Italia, Rd No 2, Plot No 5, Opp. New Bus Stand, Vijayanagar Colony, Jadcherla, Telangana 509301', postalAddress: { streetAddress: 'Rd No 2, Plot No 5, Opp. New Bus Stand, Vijayanagar Colony', addressLocality: 'Jadcherla', addressRegion: 'Telangana', postalCode: '509301', addressCountry: 'IN' } },
  { id: 'guntur', name: 'Guntur', region: 'Andhra Pradesh', phone: '+91 92467 69769', whatsapp: '919246769769', address: 'Hotel Siddhartha Building, 37-224, Brodipet, Guntur, Andhra Pradesh 522002', hours: null, googleMapsUrl: null, mapQuery: 'Mozza Italia, Hotel Siddhartha Building, 37-224, Brodipet, Guntur, Andhra Pradesh 522002', postalAddress: { streetAddress: 'Hotel Siddhartha Building, 37-224, Brodipet', addressLocality: 'Guntur', addressRegion: 'Andhra Pradesh', postalCode: '522002', addressCountry: 'IN' } },
];

// Keyless Google Maps embed for one outlet. Single source for tile + maximized map.
export function branchMapEmbedUrl(branch: Pick<Branch, 'mapQuery'>, zoom = 16) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(branch.mapQuery)}&z=${zoom}&output=embed`;
}

// Confirmed address for display, retaining the existing map-query fallback.
export function branchAddress(branch: Branch) {
  return branch.address || branch.mapQuery.replace(/^Mozza Italia,\s*/i, '');
}

// Directions link for an outlet. Falls back to a Maps search on the same query
// the embedded map uses, so both always point at one place.
export function branchDirectionsUrl(branch: Branch) {
  return branch.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapQuery)}`;
}

export const callUrl = `tel:+${restaurant.whatsapp}`;
export function resolveBranch(value: string): Branch {
  const branch = branches.find(branch => branch.id === value || branch.name.toLowerCase() === value.toLowerCase());
  if (!branch?.whatsapp) throw new Error('Please select a valid Mozza Italia outlet.');
  return branch;
}
export function whatsappUrl(branch: string, message = 'Hi Mozza Italia, please share availability / ordering details.') {
  return `https://wa.me/${resolveBranch(branch).whatsapp}?text=${encodeURIComponent(message)}`;
}
export function itemOrderUrl(name: string, size: string | undefined, branch: string) {
  return whatsappUrl(branch, `Hi Mozza Italia,\nI would like to order:\n\n${name}${size ? ` — ${size}` : ''}\nOutlet: ${resolveBranch(branch).name}\n\nPlease share availability / ordering details.`);
}
export function whatsappIntentMessage(intent: 'order' | 'reservation' | 'catering' | 'support' | 'location', detail?: string) {
  const messages = { order: 'I want to place an order.', reservation: 'I want to book a table.', catering: 'I want to enquire about catering.', support: 'I want to talk to staff.', location: `Please share the ${detail || restaurant.branch} outlet location and opening hours.` };
  return `Hi Mozza Italia 👋\n${messages[intent]}`;
}

export function whatsappIntentUrl(intent: 'order' | 'reservation' | 'catering' | 'support' | 'location', branch: string) {
  const outlet = resolveBranch(branch);
  return whatsappUrl(outlet.id, `${whatsappIntentMessage(intent, outlet.name)}\nOutlet: ${outlet.name}`);
}
