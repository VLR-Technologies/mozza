export function dateRange(period: string, now = new Date()) {
    const today = new Date(now.getTime() + 330 * 60000).toISOString().slice(0, 10), d = new Date(`${today}T00:00:00Z`);
    if (period === 'today')
        return { from: today, to: today };
    if (period === 'yesterday') {
        d.setUTCDate(d.getUTCDate() - 1);
        return { from: d.toISOString().slice(0, 10), to: d.toISOString().slice(0, 10) };
    }
    if (period === 'week' || period === 'last30') {
        d.setUTCDate(d.getUTCDate() - (period === 'last30' ? 29 : 6));
        return { from: d.toISOString().slice(0, 10), to: today };
    }
    if (period === 'month')
        return { from: `${today.slice(0, 7)}-01`, to: today };
    return { from: '', to: '' };
}
export const orderTransitions: Record<string, string[]> = { pending: ['confirmed', 'cancelled'], confirmed: ['preparing', 'cancelled'], preparing: ['ready', 'cancelled'], ready: ['completed', 'cancelled'], completed: [], cancelled: [] };
