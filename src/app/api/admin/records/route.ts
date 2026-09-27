import { adminAuthorized, privateJson, readBody, sameOrigin } from '@/lib/server/security';
import { adminDb, adminError, tables } from '@/lib/server/admin-data';
export const runtime = 'nodejs';
export async function PATCH(request: Request) {
    if (!adminAuthorized(request)) return privateJson({ error: 'Unauthorized' }, 401);
    if (!sameOrigin(request)) return privateJson({ error: 'Invalid origin' }, 403);
    let input;
    try { input = JSON.parse(await readBody(request, 2048)); } catch { return privateJson({ error: 'Invalid request' }, 400); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return privateJson({ error: 'Invalid request' }, 400);
    const { section, id, action, status, confirmation } = input;
    if (!['orders','drafts','reservations','enquiries','notifications'].includes(section) || typeof id !== 'string' || !(section === 'drafts' ? /^MI-DRAFT-[A-F0-9]{32}$/.test(id) : /^[a-f0-9-]{36}$/.test(id))) return privateJson({ error: 'Invalid record' }, 400);
    if (!['archive','restore','delete','status','retry'].includes(action)) return privateJson({ error: 'Invalid action' }, 400);
    if (action === 'delete' && (process.env.NODE_ENV === 'production' || confirmation !== 'DELETE' || !['orders','drafts'].includes(section))) return privateJson({ error: 'Permanent deletion requires development mode and DELETE confirmation.' }, 403);
    const path = `${tables[section]}?${section === 'drafts' ? 'token' : 'id'}=eq.${encodeURIComponent(id)}`;
    try {
        const { data: records } = await adminDb<Record<string, unknown>[]>(`${path}&select=*`);
        const record = records[0]; if (!record) return privateJson({ error: 'Record not found' }, 404);
        const patch: Record<string, unknown> = {};
        if (action === 'archive' || action === 'restore') {
            if (section === 'orders' && !['completed','cancelled'].includes(String(record.status))) return privateJson({ error: 'Complete or cancel this order before archiving it.' }, 409);
            if (section === 'notifications' && record.status === 'sending') return privateJson({ error: 'A notification is being sent. Refresh before archiving.' }, 409);
            patch.archived_at = action === 'archive' ? new Date().toISOString() : null;
            if (section === 'notifications' && action === 'archive' && record.status === 'pending') patch.status = 'template_required';
        }
        if (action === 'status') {
            const allowed: Record<string, Record<string, string[]>> = { reservations: { pending: ['confirmed','declined','cancelled'], confirmed: ['completed','cancelled'] }, enquiries: { pending: ['contacted','resolved'], new: ['contacted','resolved'], contacted: ['resolved'], resolved: ['contacted'] } };
            if (!allowed[section]?.[String(record.status)]?.includes(status) || record.archived_at) return privateJson({ error: 'This status change is not allowed. Refresh the list.' }, 409);
            patch.status = status;
        }
        if (action === 'retry') {
            if (section !== 'notifications' || record.archived_at || !['pending','template_required'].includes(String(record.status))) return privateJson({ error: 'This notification cannot be retried.' }, 409);
            patch.status = 'pending'; patch.lease_until = null;
        }
        if (action === 'delete' && !record.archived_at) return privateJson({ error: 'Archive the test record before permanently deleting it.' }, 409);
        const guard = (record.status ? `&status=eq.${encodeURIComponent(String(record.status))}` : '') + (['delete','restore'].includes(action) ? '&archived_at=not.is.null' : '&archived_at=is.null');
        const result = await adminDb<unknown[]>(path + guard, { method: action === 'delete' ? 'DELETE' : 'PATCH', ...(action === 'delete' ? {} : { body: JSON.stringify(patch) }) });
        if (!result.data.length) return privateJson({ error: 'Record changed. Refresh and try again.' }, 409);
        return privateJson({ ok: true, note: action === 'retry' ? 'Notification queued for the existing sender. No message was sent by this action.' : 'Record updated.' });
    } catch (error) { return privateJson({ error: adminError(error) }, 503); }
}
