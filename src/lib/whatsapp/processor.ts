import 'server-only';
import { initialSession, resumeDraft, transition } from './engine';
import { db, rpc } from '../server/db';
import { publicId } from '../server/security';
import { money, validateCheckout } from '../order-utils';
import type { Checkout } from '../../types/order';
import type { BotReply, Session, Transition } from './types';
import { drainOutbox } from './outbox';
export type Incoming = {
    id: string;
    phone: string;
    input: string;
    timestamp: string;
};
export interface EventStore {
    seen(id: string): Promise<boolean>;
    session(phone: string): Promise<{
        state_payload: Session;
        version: number;
    } | undefined>;
    draft(token: string, phone: string): Promise<Checkout | undefined>;
    commit(args: Record<string, unknown>): Promise<{
        retry?: boolean;
        draftInvalid?: boolean;
    }>;
    flush(id: string): Promise<void>;
}
export const eventStore: EventStore = {
    seen: async (id) => (await db<unknown[]>(`processed_messages?message_id=eq.${encodeURIComponent(id)}&select=message_id`)).length > 0,
    session: async (phone) => (await db<{
        state_payload: Session;
        version: number;
    }[]>(`conversation_sessions?phone=eq.${encodeURIComponent(phone)}&select=state_payload,version`))[0],
    draft: async (token, phone) => {
        const rows = await db<{
            checkout: Checkout;
        }[]>(`order_drafts?token=eq.${encodeURIComponent(token)}&customer_phone=eq.${encodeURIComponent(phone)}&consumed_at=is.null&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=checkout`);
        return rows[0]?.checkout;
    },
    commit: args => rpc('apply_whatsapp_event', args),
    flush: drainOutbox,
};
function splitReplies(replies: BotReply[]): BotReply[] { return replies.flatMap(reply => { if (reply.kind !== 'text' || reply.text.length <= 4000)
    return [reply]; const chunks: BotReply[] = []; for (let i = 0; i < reply.text.length; i += 3500)
    chunks.push({ kind: 'text', text: reply.text.slice(i, i + 3500) }); return chunks; }); }
export async function processIncoming(incoming: Incoming, store: EventStore = eventStore) {
    if (await store.seen(incoming.id)) {
        await store.flush(incoming.id);
        return;
    }
    for (let attempt = 0; attempt < 4; attempt++) {
        const current = await store.session(incoming.phone);
        const session = current?.state_payload || initialSession();
        let result: Transition;
        const token = incoming.input.match(/MI-DRAFT-[A-F0-9]{32}/i)?.[0].toUpperCase();
        if (incoming.input === 'unsupported-message' && session.state !== 'HUMAN_HANDOFF') {
            result = { session, replies: [{ kind: 'text', text: 'Please send text or choose one of the menu options. Send STAFF for help.' }] };
        }
        else if (token && session.state !== 'HUMAN_HANDOFF') {
            const checkout = await store.draft(token, incoming.phone);
            if (checkout) {
                try {
                    result = resumeDraft(session, checkout, token);
                }
                catch {
                    result = { session: initialSession(), replies: [{ kind: 'text', text: 'This draft contains a menu item that has changed. Send order to rebuild it, or STAFF for help.' }] };
                }
            }
            else
                result = { session, replies: [{ kind: 'text', text: 'This draft is expired, already submitted, or linked to a different mobile number. Use the WhatsApp number entered at checkout, create a fresh draft, or send STAFF for help.' }] };
        }
        else if (/\*Order Summary\*/i.test(incoming.input) && session.state !== 'HUMAN_HANDOFF') {
            result = { session: { ...session, state: 'HUMAN_HANDOFF' }, replies: [{ kind: 'text', text: 'Your order enquiry is with our team for review. Send RESET to use automated ordering.' }], effect: { type: 'handoff', details: { request: incoming.input.slice(0, 6000) } } };
        }
        else
            result = transition(session, incoming.input, incoming.phone);
        result.session.lastCustomerMessageAt = incoming.timestamp;
        let effect: unknown = result.effect || null;
        if (result.effect?.type === 'order') {
            const checkout = validateCheckout({ ...result.effect.checkout, customer: { ...result.effect.checkout.customer, phone: incoming.phone } });
            const reference = publicId();
            effect = { ...result.effect, checkout, reference };
            result.replies = [{ kind: 'text', text: `Order request received ✅\n\nOrder ID: *${reference}*\nOutlet: Mozza Italia — Shadnagar\nSubtotal: ${money(checkout.subtotal)}\nOur team will confirm availability, final charges and preparation / pickup timing shortly.` }, { kind: 'buttons', text: 'Need help?', choices: [{ id: 'staff', title: 'Talk to Staff' }] }];
        }
        else if (result.effect?.type === 'reservation') {
            const reference = publicId('MR');
            effect = { ...result.effect, reference };
            const r = result.effect.reservation;
            result.replies = [{ kind: 'text', text: `Reservation request received ✅\nReference: *${reference}*\n${r.date} at ${r.time} IST\nGuests: ${r.guests}\nOur team will confirm availability. Your table is not confirmed yet.` }];
        }
        const saved = await store.commit({ p_message_id: incoming.id, p_phone: incoming.phone, p_version: current?.version || 0, p_session: result.session, p_effect: effect, p_replies: splitReplies(result.replies), p_received_at: incoming.timestamp });
        if (saved.retry)
            continue;
        if (saved.draftInvalid) {
            const recovery = await store.commit({ p_message_id: incoming.id, p_phone: incoming.phone, p_version: current?.version || 0, p_session: { ...initialSession(), lastCustomerMessageAt: incoming.timestamp }, p_effect: null, p_replies: [{ kind: 'text', text: 'Your draft expired or was already submitted. Send order to start again or STAFF to check an existing order.' }], p_received_at: incoming.timestamp });
            if (recovery.retry)
                continue;
        }
        await store.flush(incoming.id);
        return;
    }
    throw new Error('Session busy; retry event');
}
