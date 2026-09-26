import 'server-only';
import type { BotReply, Choice } from './types';
export function withinServiceWindow(last: string | undefined, now = Date.now()) { const timestamp = last ? Date.parse(last) : NaN; return Number.isFinite(timestamp) && timestamp <= now && now - timestamp < 24 * 60 * 60 * 1000; }
export function messagePayload(to: string, reply: BotReply) {
    const base = { messaging_product: 'whatsapp', recipient_type: 'individual', to };
    if (reply.kind === 'text') {
        if (reply.text.length > 4096)
            throw new Error('Text exceeds WhatsApp limit');
        return { ...base, type: 'text', text: { body: reply.text, preview_url: false } };
    }
    if (reply.text.length > 1024)
        throw new Error('Interactive body exceeds WhatsApp limit');
    if (reply.kind === 'buttons') {
        if (!reply.choices.length || reply.choices.length > 3 || reply.choices.some(c => c.title.length > 20))
            throw new Error('Invalid reply buttons');
        return { ...base, type: 'interactive', interactive: { type: 'button', body: { text: reply.text }, action: { buttons: reply.choices.map(c => ({ type: 'reply', reply: { id: c.id, title: c.title } })) } } };
    }
    if (!reply.choices.length || reply.choices.length > 10 || reply.choices.some(c => c.title.length > 24 || (c.description?.length || 0) > 72))
        throw new Error('Invalid list');
    return { ...base, type: 'interactive', interactive: { type: 'list', body: { text: reply.text }, action: { button: 'Choose', sections: [{ title: 'Mozza Italia', rows: reply.choices }] } } };
}
async function send(payload: unknown) {
    const version = process.env.WHATSAPP_API_VERSION;
    if (!/^v\d+\.\d+$/.test(version || '') || !process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID)
        throw new Error('Cloud API is not configured');
    const response = await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(12000) });
    if (!response.ok)
        throw new Error(`WhatsApp delivery failed (${response.status})`);
    return response.json();
}
export async function sendReply(to: string, reply: BotReply, lastCustomerMessageAt?: string) {
    if (!withinServiceWindow(lastCustomerMessageAt))
        throw new Error('Approved template required outside service window');
    return send(messagePayload(to, reply));
}
export const sendTextMessage = (to: string, text: string, last: string) => sendReply(to, { kind: 'text', text }, last);
export const sendInteractiveButtons = (to: string, text: string, choices: Choice[], last: string) => sendReply(to, { kind: 'buttons', text, choices }, last);
export const sendInteractiveList = (to: string, text: string, choices: Choice[], last: string) => sendReply(to, { kind: 'list', text, choices }, last);
// Only server-selected, explicitly configured approved templates. Never callable by public request.
export async function sendStatusTemplate(to: string, orderNumber: string, status: string) {
    const name = process.env.WHATSAPP_STATUS_TEMPLATE_NAME, code = process.env.WHATSAPP_STATUS_TEMPLATE_LANGUAGE;
    if (!name || !code)
        return false;
    await send({ messaging_product: 'whatsapp', to, type: 'template', template: { name, language: { code }, components: [{ type: 'body', parameters: [{ type: 'text', text: orderNumber }, { type: 'text', text: status }] }] } });
    return true;
}
