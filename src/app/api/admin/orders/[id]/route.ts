import { adminAuthorized, privateJson, readBody, sameOrigin } from '@/lib/server/security';
import { rpc } from '@/lib/server/db';
import { drainOutbox } from '@/lib/whatsapp/outbox';
export const runtime = 'nodejs';
export async function PATCH(request: Request, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    if (!adminAuthorized(request))
        return privateJson({ error: 'Unauthorized' }, 401);
    if (!sameOrigin(request))
        return privateJson({ error: 'Invalid origin' }, 403);
    const { id } = await params;
    if (!/^[a-f0-9-]{36}$/.test(id))
        return privateJson({ error: 'Invalid order ID' }, 400);
    let status;
    try {
        status = JSON.parse(await readBody(request, 1024)).status;
    }
    catch {
        return privateJson({ error: 'Invalid request' }, 400);
    }
    if (!['confirmed', 'preparing', 'ready', 'completed', 'cancelled'].includes(status))
        return privateJson({ error: 'Invalid status' }, 400);
    try {
        const result = await rpc<{
            missing?: boolean;
            invalid?: boolean;
            unpriced?: boolean;
        }>('update_order_status', { p_id: id, p_status: status });
        if (result.missing)
            return privateJson({ error: 'Order not found' }, 404);
        if (result.invalid)
            return privateJson({ error: 'This status transition is not allowed. Refresh the list.' }, 409);
        if (result.unpriced)
            return privateJson({ error: 'Price confirmation required. Handle this enquiry with the customer before fulfilment; this screen cannot invent a price.' }, 409);
        try {
            await drainOutbox(`status:${id}:${status}`);
        }
        catch {
            return privateJson({ ok: true, note: 'Status saved. Customer notification is queued for retry.' });
        }
        return privateJson({ ok: true, note: 'Status saved. Notifications outside the service window require an approved template.' });
    }
    catch {
        return privateJson({ error: 'Status update failed. Refresh before retrying.' }, 503);
    }
}
