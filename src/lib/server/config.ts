import 'server-only';
import { restaurant, resolveBranch, whatsappUrl } from '../../config/restaurant';
export const databaseReady = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
// Current sessions/outbox are keyed by customer only. Do not activate multiple senders
// until they are scoped to the receiving outlet and reservation RPC stores its branch.
export const LIVE_META_BRANCH = 'shadnagar';
export function metaConfig(branch: string) {
    const outlet = resolveBranch(branch);
    const prefix = 'WHATSAPP_' + outlet.id.toUpperCase() + '_';
    const value = (key: string) => process.env[prefix + key] || (outlet.id === LIVE_META_BRANCH ? process.env['WHATSAPP_' + key] : undefined);
    return { phoneNumberId: value('PHONE_NUMBER_ID'), accessToken: value('ACCESS_TOKEN'), apiVersion: value('API_VERSION'), appSecret: value('APP_SECRET'), verifyToken: value('VERIFY_TOKEN') };
}
export const cloudReady = (branch = LIVE_META_BRANCH) => {
    if (resolveBranch(branch).id !== LIVE_META_BRANCH) return false;
    const config = metaConfig(branch);
    return databaseReady() && Boolean(config.phoneNumberId && config.accessToken && /^v\d+\.\d+$/.test(config.apiVersion || '') && config.appSecret && config.verifyToken);
};
export function destination() { const phone = process.env.WHATSAPP_PHONE_NUMBER || restaurant.whatsapp; if (!/^\d{10,15}$/.test(phone))
    throw new Error('Invalid restaurant phone configuration'); return phone; }
export const serverWhatsappUrl = (branch: string, message: string) => whatsappUrl(branch, message);
export function logEvent(event: string, data: Record<string, string | number | boolean> = {}) { console.info(JSON.stringify({ event, ...data })); }
