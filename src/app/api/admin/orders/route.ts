import { adminAuthorized, privateJson } from '@/lib/server/security';
import { databaseReady } from '@/lib/server/config';
import { db } from '@/lib/server/db';
export const runtime = 'nodejs';
export async function GET(request: Request) {
    if (!adminAuthorized(request))
        return privateJson({ error: 'Unauthorized' }, 401);
    if (!databaseReady())
        return privateJson({ error: 'Supabase is not configured.' }, 503);
    try {
        const [orders, reservations, enquiries, drafts, outbox] = await Promise.all([
            db('orders?select=*&order=created_at.desc&limit=100'), db('reservations?select=*&order=created_at.desc&limit=50'), db('staff_enquiries?select=*&order=created_at.desc&limit=50'), db('order_drafts?select=checkout,created_at,expires_at&consumed_at=is.null&expires_at=gt.' + encodeURIComponent(new Date().toISOString()) + '&order=created_at.desc&limit=50'), db('whatsapp_outbox?select=id,status,attempts,created_at&status=neq.sent&order=created_at&limit=50')
        ]);
        return privateJson({ orders, reservations, enquiries, drafts, outbox });
    }
    catch {
        return privateJson({ error: 'Could not load orders. Check server configuration.' }, 503);
    }
}
