import 'server-only';
import { db, rpc } from '../server/db';
import { logEvent } from '../server/config';
import { sendReply, sendStatusTemplate, withinServiceWindow } from './client';
import type { BotReply } from './types';
type Outbox = {
    id: string;
    phone: string;
    replies: (BotReply | {
        kind: 'status';
        reference: string;
        status: string;
    })[];
    next_reply: number;
    last_customer_message_at?: string;
};
export async function drainOutbox(key: string | null = null) {
    const entries = await rpc<Outbox[]>('claim_whatsapp_outbox', { p_key: key });
    for (const entry of entries) {
        try {
            let blocked = false;
            for (let i = entry.next_reply; i < entry.replies.length; i++) {
                const reply = entry.replies[i];
                if (reply.kind === 'status') {
                    // Refresh window: the customer may have messaged after the status was queued.
                    const sessions = await db<{
                        last_customer_message_at: string;
                    }[]>(`conversation_sessions?phone=eq.${encodeURIComponent(entry.phone)}&select=last_customer_message_at`);
                    const last = sessions[0]?.last_customer_message_at;
                    if (withinServiceWindow(last))
                        await sendReply(entry.phone, { kind: 'text', text: `Mozza Italia · ${reply.reference}\nOrder status: ${reply.status.replace(/_/g, ' ')}.` }, last);
                    else if (!await sendStatusTemplate(entry.phone, reply.reference, reply.status)) {
                        blocked = true;
                        break;
                    }
                }
                else if (!withinServiceWindow(entry.last_customer_message_at)) {
                    blocked = true;
                    break;
                }
                else
                    await sendReply(entry.phone, reply, entry.last_customer_message_at);
                await db(`whatsapp_outbox?id=eq.${entry.id}`, { method: 'PATCH', body: JSON.stringify({ next_reply: i + 1 }) });
            }
            await db(`whatsapp_outbox?id=eq.${entry.id}`, { method: 'PATCH', body: JSON.stringify({ status: blocked ? 'template_required' : 'sent', lease_until: null }) });
        }
        catch {
            logEvent('whatsapp_send_retry_pending');
            await db(`whatsapp_outbox?id=eq.${entry.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'pending', lease_until: null }) });
            throw new Error('WhatsApp send pending retry');
        }
    }
}
