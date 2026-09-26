import { cloudReady, logEvent } from '@/lib/server/config';
import { constantEqual, privateJson, readBody, validSignature } from '@/lib/server/security';
import { processIncoming } from '@/lib/whatsapp/processor';
export const runtime = 'nodejs';
export async function GET(request: Request) {
    const params = new URL(request.url).searchParams, verify = process.env.WHATSAPP_VERIFY_TOKEN;
    if (verify && params.get('hub.mode') === 'subscribe' && constantEqual(params.get('hub.verify_token') || '', verify))
        return new Response(params.get('hub.challenge') || '', { headers: { 'Cache-Control': 'no-store' } });
    return new Response('Forbidden', { status: 403 });
}
type Message = {
    id?: string;
    from?: string;
    timestamp?: string;
    type?: string;
    text?: {
        body?: string;
    };
    interactive?: {
        button_reply?: {
            id?: string;
        };
        list_reply?: {
            id?: string;
        };
    };
};
export async function POST(request: Request) {
    let raw: string;
    try {
        raw = await readBody(request, 262144);
    }
    catch {
        return privateJson({ error: 'Invalid payload' }, 413);
    }
    if (!validSignature(raw, request.headers.get('x-hub-signature-256'), process.env.WHATSAPP_APP_SECRET || ''))
        return privateJson({ error: 'Forbidden' }, 403);
    if (!cloudReady())
        return privateJson({ error: 'Automation is not configured' }, 503);
    let payload;
    try {
        payload = JSON.parse(raw);
    }
    catch {
        return privateJson({ error: 'Invalid JSON' }, 400);
    }
    if (!payload || typeof payload !== 'object' || payload.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry))
        return privateJson({ error: 'Invalid webhook' }, 400);
    try {
        for (const entry of payload.entry) {
            if (!Array.isArray(entry.changes))
                continue;
            for (const change of entry.changes) {
                const value = change.value;
                if (change.field !== 'messages' || value?.metadata?.phone_number_id !== process.env.WHATSAPP_PHONE_NUMBER_ID)
                    continue;
                if (!Array.isArray(value.messages))
                    continue; // Delivery/read receipts are not customer messages.
                for (const message of value.messages as Message[]) {
                    if (typeof message.id !== 'string' || message.id.length > 250 || !/^\d{10,15}$/.test(message.from || '') || !/^\d{10}$/.test(message.timestamp || ''))
                        continue;
                    const time = Number(message.timestamp) * 1000;
                    if (time > Date.now() + 60000)
                        continue;
                    const input = message.type === 'text' ? message.text?.body : message.type === 'interactive' ? (message.interactive?.button_reply?.id || message.interactive?.list_reply?.id) : undefined;
                    await processIncoming({ id: message.id, phone: message.from!, input: typeof input === 'string' ? input.slice(0, 10000) : 'unsupported-message', timestamp: new Date(time).toISOString() });
                }
            }
        }
        return privateJson({ received: true });
    }
    catch {
        logEvent('webhook_retry_required');
        return privateJson({ error: 'Please retry delivery' }, 503);
    }
}
