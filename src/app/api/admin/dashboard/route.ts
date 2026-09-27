import { adminAuthorized, privateJson } from '@/lib/server/security';
import { adminDb, adminError, buildListQuery } from '@/lib/server/admin-data';
import { cloudReady, destination } from '@/lib/server/config';
export const runtime = 'nodejs';
export async function GET(request: Request) {
    if (!adminAuthorized(request)) return privateJson({ error: 'Unauthorized' }, 401);
    const input = new URL(request.url).searchParams;
    try {
        if (input.get('section') === 'overview' || input.get('section') === 'settings') {
            const { data } = await adminDb('rpc/admin_dashboard_summary', { method: 'POST', body: '{}' });
            return privateJson({ summary: data, settings: { database: true, cloud: cloudReady(), development: process.env.NODE_ENV !== 'production', phone: destination() } });
        }
        const query = buildListQuery(input);
        const result = await adminDb<Record<string, unknown>[]>(query.path);
        if (query.section === 'notifications' && result.data.length) {
            const phones = [...new Set(result.data.map(row => String(row.phone)).filter(value => /^\d{10,15}$/.test(value)))];
            const ids = [...new Set(result.data.map(row => String(row.message_key || '').split(':')[1]).filter(value => /^[a-f0-9-]{36}$/.test(value || '')))];
            const [customers, orders] = await Promise.all([
                phones.length ? adminDb<{ phone: string; name: string }[]>(`customers?phone=in.(${phones.join(',')})&select=phone,name&limit=100`) : Promise.resolve({data:[]}),
                ids.length ? adminDb<{ id: string; public_order_id: string }[]>(`orders?id=in.(${ids.join(',')})&select=id,public_order_id&limit=100`) : Promise.resolve({data:[]})
            ]);
            result.data = result.data.map(row => {
                const key = String(row.message_key || '');
                const safe = {...row}; delete safe.message_key;
                return {...safe, customer_name: customers.data.find(customer => customer.phone === row.phone)?.name || 'Guest', notification_type: key.startsWith('status:') ? 'Order status update' : 'Conversation reply', order_reference: orders.data.find(order => order.id === key.split(':')[1])?.public_order_id || null};
            });
        }
        return privateJson({ rows: result.data, total: result.total, page: query.page, size: query.size });
    } catch (error) { return privateJson({ error: adminError(error) }, 503); }
}
