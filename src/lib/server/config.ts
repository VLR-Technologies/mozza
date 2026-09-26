import 'server-only';
import { restaurant } from '../../config/restaurant';
export const databaseReady = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const cloudReady = () => databaseReady() && Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN && /^v\d+\.\d+$/.test(process.env.WHATSAPP_API_VERSION || '') && process.env.WHATSAPP_APP_SECRET && process.env.WHATSAPP_VERIFY_TOKEN);
export function destination() { const phone = process.env.WHATSAPP_PHONE_NUMBER || restaurant.whatsapp; if (!/^\d{10,15}$/.test(phone))
    throw new Error('Invalid restaurant phone configuration'); return phone; }
export const serverWhatsappUrl = (message: string) => `https://wa.me/${destination()}?text=${encodeURIComponent(message)}`;
export function logEvent(event: string, data: Record<string, string | number | boolean> = {}) { console.info(JSON.stringify({ event, ...data })); }
