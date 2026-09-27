import { branches, whatsappIntentMessage } from '@/config/restaurant';
import { normalizePhone, textField } from '@/lib/order-utils';
export type WebsiteRequest = {
 kind: 'reservation' | 'enquiry'; branch: string; name: string | null; phone: string | null; notes: string;
 date?: string; time?: string; guests?: number; type?: 'catering' | 'bulk_order';
 eventType?: string; eventDate?: string; preferredTime?: string; guestRange?: string; service?: string; food?: string;
};
export function validDate(value: unknown): value is string {
 if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
 const date = new Date(`${value}T00:00:00Z`);
 return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
const validTime = (value: unknown): value is string => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export function validateWebsiteRequest(value: unknown, now = new Date()): WebsiteRequest {
 if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid request.');
 const v = value as Record<string, unknown>;
 const branch = branches.find(b => b.id === v.branch);
 if (!branch) throw new Error('Choose a listed outlet.');
 const optional = v.kind === 'reservation' && v.form === 'planner';
 const name = textField(v.name, 'your name', 80, !optional) || null;
 const phone = optional && !v.phone ? null : normalizePhone(typeof v.phone === 'string' ? v.phone : '');
 const notes = textField(v.notes, 'notes', 600);
 if (v.kind === 'reservation') {
  if (!validDate(v.date) || !validTime(v.time) || new Date(`${v.date}T${v.time}:00+05:30`).getTime() <= now.getTime()) throw new Error('Choose a valid future reservation date and time (IST).');
  const guests = v.guests === '13+' ? 13 : Number(v.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 50) throw new Error('Choose a guest count from 1 to 50.');
  return {kind:'reservation',branch:branch.id,name,phone,date:v.date,time:v.time,guests,notes: v.guests === '13+' ? `Guest count requested: 13+ (exact count to be confirmed). ${notes}` : notes};
 }
 if (v.kind !== 'enquiry') throw new Error('Choose a reservation or catering enquiry.');
 const today = new Date(now.getTime()+330*60000).toISOString().slice(0,10);
 if (!validDate(v.eventDate) || v.eventDate < today) throw new Error('Choose today or a future event date.');
 const preferredTime = textField(v.preferredTime, 'preferred time', 5);
 if (preferredTime && (!validTime(preferredTime) || new Date(`${v.eventDate}T${preferredTime}:00+05:30`).getTime() <= now.getTime())) throw new Error('Choose a valid future preferred time (IST).');
 const eventType = textField(v.eventType, 'event type', 80, true), guestRange = textField(v.guestRange, 'group size', 30, true), service = textField(v.service, 'service preference', 80, true), food = textField(v.food, 'food preference', 60) || 'Not decided';
 if (!['Birthday','Office / Corporate Event','Private Party','Family Gathering','Wedding / Engagement Related Event','College / Student Event','Bulk Food Order','Other'].includes(eventType) || !['Under 10','10–20','21–30','31–50','51–75','76–100','100+'].includes(guestRange) || !['Pickup','Delivery / Venue Service','Need Help Deciding'].includes(service)) throw new Error('Choose the listed event options.');
 return {kind:'enquiry',type:eventType==='Bulk Food Order'?'bulk_order':'catering',branch:branch.id,name,phone,notes,eventType,eventDate:v.eventDate,preferredTime,guestRange,service,food};
}
export function websiteRequestMessage(v: WebsiteRequest, reference: string) {
 const branch = branches.find(b => b.id === v.branch)!.name;
 if (v.kind === 'reservation') return [whatsappIntentMessage('reservation'),'',`Request reference: ${reference}`,`Preferred outlet: ${branch}`,v.name ? `Name: ${v.name}` : '',v.phone ? `Mobile: ${v.phone}` : '',`Date: ${v.date}`,`Time: ${v.time} (IST)`,`Guests: ${v.guests}`,v.notes ? `Message: ${v.notes}` : '', 'Pending confirmation — please confirm availability.'].filter(Boolean).join('\n');
 return [whatsappIntentMessage('catering'),'',`Enquiry reference: ${reference}`,`Name: ${v.name}`,`Phone: ${v.phone}`,`Nearest outlet: ${branch}`,`Event type: ${v.eventType}`,`Event date: ${v.eventDate}`,`Preferred time: ${v.preferredTime || 'Not specified'} (IST)`,`Guests: ${v.guestRange}`,`Service preference: ${v.service}`,`Food preference: ${v.food}`,`Notes: ${v.notes || 'None'}`,'Please let me know the available catering options.'].join('\n');
}
