import { validateCheckout, orderMessage } from '@/lib/order-utils';
import { cloudReady, databaseReady, logEvent, serverWhatsappUrl } from '@/lib/server/config';
import { draftToken, hash, privateJson, readBody, sameOrigin } from '@/lib/server/security';
import { rpc } from '@/lib/server/db';
export const runtime = 'nodejs';
export async function POST(request: Request) {
    if (!sameOrigin(request))
        return privateJson({ error: 'Invalid request origin.' }, 403);
    let order;
    try {
        order = validateCheckout(JSON.parse(await readBody(request)));
    }
    catch (e) {
        return privateJson({ error: (e as Error).message }, 400);
    }
    const fallback = () => privateJson({ mode: 'fallback', whatsappUrl: serverWhatsappUrl(orderMessage(order)), note: 'Send this request in WhatsApp. The restaurant will confirm availability and final charges. No backend order has been created.' });
    if (!databaseReady())
        return fallback();
    const key = request.headers.get('idempotency-key');
    if (!key || !/^[-a-zA-Z0-9]{16,80}$/.test(key))
        return privateJson({ error: 'Invalid checkout key.' }, 400);
    try {
        const token = draftToken();
        const stored = await rpc<{
            token: string;
            conflict?: boolean;
            limited?: boolean;
        }>('create_order_draft', { p_key: hash(key), p_hash: hash(JSON.stringify(order)), p_token: token, p_checkout: order });
        if (stored.conflict)
            return privateJson({ error: 'Checkout changed. Please review it again.' }, 409);
        if (stored.limited)
            return privateJson({ error: 'Too many checkout attempts. Please contact the restaurant.' }, 429);
        if (!cloudReady())
            return privateJson({ mode: 'stored-fallback', whatsappUrl: serverWhatsappUrl(orderMessage(order)), note: 'Your request is saved as a draft. Send the full summary in WhatsApp for staff to confirm; automated continuation is not active.' });
        return privateJson({ mode: 'draft', whatsappUrl: serverWhatsappUrl(`Hi Mozza Italia 👋\nI'd like to continue order *${stored.token}*.`), note: 'Your draft is ready for 24 hours. Open WhatsApp, send the reference, and confirm your order there.' });
    }
    catch {
        logEvent('draft_storage_unavailable');
        return fallback();
    }
}
