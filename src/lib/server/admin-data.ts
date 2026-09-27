import 'server-only';
import { databaseReady } from './config';
export class AdminDatabaseError extends Error {
    constructor(public status: number, public code: string) { super('Admin database request failed'); }
}
export async function adminDb<T>(path: string, options: RequestInit = {}): Promise<{
    data: T;
    total: number;
}> {
    if (!databaseReady())
        throw new AdminDatabaseError(503, 'CONFIG');
    const base = process.env.SUPABASE_URL!;
    if (!/^https:\/\//.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(base))
        throw new AdminDatabaseError(503, 'CONFIG');
    const response = await fetch(`${base.replace(/\/$/, '')}/rest/v1/${path}`, { ...options, cache: 'no-store', signal: AbortSignal.timeout(15000), headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`, 'Content-Type': 'application/json', Prefer: 'count=exact,return=representation', ...options.headers } });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new AdminDatabaseError(response.status, typeof error.code === 'string' ? error.code : 'UNKNOWN');
    }
    return { data: await response.json(), total: Number(response.headers.get('content-range')?.split('/')[1] || 0) };
}
export function adminError(error: unknown) {
    if (error instanceof AdminDatabaseError) {
        if (['42703', '42P01', 'PGRST202', 'PGRST204', 'PGRST205'].includes(error.code))
            return 'Dashboard database setup is incomplete. Apply the new 202609260002_admin_dashboard.sql migration once, then refresh.';
        if (error.status === 401 || error.status === 403 || error.code === '42501')
            return 'Database access denied. Check the server service-role key and table grants.';
        if (error.code === '23503')
            return 'This record is linked to another record and cannot be deleted. Archive it instead.';
        if (error.code === 'CONFIG')
            return 'Database is not configured. Ask your administrator to check server settings.';
    }
    return 'The database could not complete this request. Please refresh and try again.';
}
export const tables: Record<string, string> = { orders: 'orders', history: 'orders', drafts: 'order_drafts', reservations: 'reservations', enquiries: 'staff_enquiries', notifications: 'whatsapp_outbox', customers: 'admin_customer_history' };
export function buildListQuery(input: URLSearchParams) {
    const section = input.get('section') || 'orders', table = tables[section];
    if (!Object.hasOwn(tables, section))
        throw new Error('Invalid section');
    const page = Math.max(1, Math.min(100000, Number(input.get('page')) || 1));
    const size = [25, 50, 100].includes(Number(input.get('size'))) ? Number(input.get('size')) : 25;
    const q = new URLSearchParams({ select: '*', limit: String(size), offset: String((page - 1) * size) });
    const search = (input.get('search') || '').replace(/[^\p{L}\p{N}\s+@_-]/gu, '').trim().slice(0, 80);
    const clauses: string[] = [];
    if (section === 'orders')
        clauses.push('archived_at.is.null', 'status.not.in.(completed,cancelled)');
    else if (section === 'history') {
        clauses.push('or(archived_at.not.is.null,status.in.(completed,cancelled))');
        if (input.get('archived') === 'only')
            clauses.push('archived_at.not.is.null');
        else if (input.get('archived') !== 'all')
            clauses.push('archived_at.is.null');
    }
    else if (section !== 'customers' && input.get('archived') !== 'all')
        clauses.push(input.get('archived') === 'only' ? 'archived_at.not.is.null' : 'archived_at.is.null');
    if (section === 'drafts')
        clauses.push('consumed_at.is.null');
    if (search) {
        const columns = section === 'orders' || section === 'history' ? ['public_order_id', 'customer_name', 'customer_phone', 'snapshot::text'] : section === 'drafts' ? ['token', 'customer_phone', 'checkout::text'] : section === 'reservations' ? ['public_reservation_id', 'name', 'phone'] : section === 'enquiries' ? ['phone', 'details::text'] : section === 'customers' ? ['name', 'phone'] : ['phone', 'message_key'];
        // PostgREST does not allow casts in filter expressions; JSON text paths cover item/name search.
        const filters = columns.map(c => c === 'snapshot::text' ? `snapshot->>lines.ilike.*${search}*` : c === 'checkout::text' ? `checkout->>customer.ilike.*${search}*,checkout->>lines.ilike.*${search}*` : c === 'details::text' ? `details->>name.ilike.*${search}*,details->>message.ilike.*${search}*,details->>type.ilike.*${search}*,details->>request.ilike.*${search}*` : `${c}.ilike.*${search}*`);
        clauses.push(`or(${filters.join(',')})`);
    }
    for (const [key, column] of [['status', 'status'], ['source', 'source'], ['fulfilment', 'fulfilment_type']] as const) {
        const value = input.get(key);
        if (value && value !== 'all' && /^[a-z_-]+$/.test(value) && (key === 'status' ? !['customers', 'drafts'].includes(section) : ['orders', 'history'].includes(section)))
            clauses.push(section === 'enquiries' && key === 'status' && ['new', 'pending'].includes(value) ? 'status.in.(new,pending)' : `${column}.eq.${value}`);
    }
    if (section === 'drafts' && input.get('status') === 'expired')
        clauses.push(`expires_at.lte.${new Date().toISOString()}`);
    if (section === 'drafts' && input.get('status') === 'active')
        clauses.push(`expires_at.gt.${new Date().toISOString()}`);
    for (const [key, op] of [['from', 'gte'], ['to', 'lte']] as const) {
        const value = input.get(key);
        if (value && /^\d{4}-\d{2}-\d{2}$/.test(value))
            clauses.push(`created_at.${op}.${value}T${key === 'from' ? '00:00:00' : '23:59:59.999'}+05:30`);
    }
    if (clauses.length)
        q.set('and', `(${clauses.join(',')})`);
    const sort = input.get('sort');
    q.set('order', sort === 'oldest' ? 'created_at.asc' : ['orders', 'history'].includes(section) && ['highest', 'lowest'].includes(sort || '') ? `subtotal.${sort === 'highest' ? 'desc' : 'asc'}.nullslast,id.asc` : 'created_at.desc');
    // Never send internal message payloads, idempotency hashes, or stored technical errors to the browser.
    if (section === 'notifications')
        q.set('select', 'id,message_key,phone,status,attempts,created_at,lease_until,archived_at');
    if (section === 'drafts')
        q.set('select', 'token,checkout,customer_phone,created_at,expires_at,consumed_at,archived_at');
    if (section === 'reservations') q.set('select', 'id,public_reservation_id,created_at,archived_at,status,source,name,phone,branch,reservation_date,reservation_time,party_size,notes');
    if (section === 'enquiries') q.set('select', 'id,public_enquiry_id,created_at,archived_at,status,source,type,phone,details');
    return { path: `${table}?${q}`, page, size, section };
}
