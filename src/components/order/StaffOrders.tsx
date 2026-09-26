'use client';
import { useState, type FormEvent } from 'react';
import { money } from '@/lib/order-utils';
import type { OrderSummary, OrderStatus } from '@/types/order';
type Order = {
    id: string;
    public_order_id: string;
    created_at: string;
    status: OrderStatus;
    source: string;
    snapshot: OrderSummary;
};
type Data = {
    orders: Order[];
    reservations: {
        public_reservation_id: string;
        reservation_date: string;
        reservation_time: string;
        party_size: number;
        name: string;
        phone: string;
        notes: string;
        status: string;
    }[];
    enquiries: {
        id: string;
        phone: string;
        details: Record<string, string>;
    }[];
    drafts: {
        checkout: OrderSummary;
        created_at: string;
    }[];
    outbox: {
        id: string;
        status: string;
        attempts: number;
    }[];
};
const next: Record<OrderStatus, OrderStatus[]> = { pending: ['confirmed', 'cancelled'], confirmed: ['preparing', 'cancelled'], preparing: ['ready', 'cancelled'], ready: ['completed', 'cancelled'], completed: [], cancelled: [] };
export function StaffOrders() {
    const [secret, setSecret] = useState('');
    const [data, setData] = useState<Data | null>(null);
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    async function load(e?: FormEvent) { e?.preventDefault(); setBusy(true); try {
        const response = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store' });
        const json = await response.json();
        if (!response.ok)
            throw new Error(json.error);
        setData(json);
        setMessage('');
    }
    catch (e) {
        setData(null);
        setMessage((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    async function update(id: string, status: OrderStatus) { setBusy(true); try {
        const response = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
        const json = await response.json();
        if (!response.ok)
            throw new Error(json.error);
        await load();
        setMessage(json.note);
    }
    catch (e) {
        setMessage((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    async function retry() { setBusy(true); try {
        const r = await fetch('/api/admin/notifications', { method: 'POST', headers: { Authorization: `Bearer ${secret}` } });
        const j = await r.json();
        if (!r.ok)
            throw new Error(j.error);
        await load();
    }
    catch (e) {
        setMessage((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    return <section className="admin-orders"><span className="kicker">Internal · Mozza Italia</span><h1>Staff orders</h1>
 {!data ? <form onSubmit={load}><label>Staff access secret <input type="password" value={secret} onChange={e => setSecret(e.target.value)} required autoComplete="off"/></label><button className="button button-primary" disabled={busy}>Sign in</button></form> : <><button className="button button-secondary" disabled={busy} onClick={() => load()}>Refresh</button><button className="button button-secondary" onClick={() => { setSecret(''); setData(null); }}>Sign out</button><p>Latest 100 orders. Amounts are menu subtotals; availability and any final charges require staff confirmation.</p></>}
 {message && <p role="status">{message}</p>}
 {data?.orders.map(order => <article key={order.id}><h2>{order.public_order_id}</h2><p>{new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST · {order.source} · {order.snapshot.fulfilment} · {order.status}</p><p>{order.snapshot.customer.name} · +{order.snapshot.customer.phone}</p><p>{order.snapshot.items.reduce((s, l) => s + l.quantity, 0)} items · {money(order.snapshot.subtotal)}</p><details><summary>Order details</summary>{order.snapshot.lines.map((line, i) => <p key={i}>{line.quantity} × {line.name} · {line.size} · {money(line.unitPrice)} each · {money(line.lineTotal)}</p>)}<p>{order.snapshot.customer.address} {order.snapshot.customer.landmark}</p><p>{order.snapshot.customer.notes}</p><p>Table: {order.snapshot.customer.table || '—'}</p></details>{next[order.status].map(status => <button className="button button-secondary" disabled={busy} key={status} onClick={() => update(order.id, status)}>{status}</button>)}</article>)}
 {data && <><h2>Reservation requests</h2>{data.reservations.map(r => <article key={r.public_reservation_id}><strong>{r.public_reservation_id} · {r.status}</strong><p>{r.name} · +{r.phone}<br />{r.reservation_date} {r.reservation_time} IST · {r.party_size} guests</p><p>{r.notes}</p><p>Contact the customer to confirm availability.</p></article>)}<h2>Staff / catering enquiries</h2>{data.enquiries.map(e => <article key={e.id}><strong>+{e.phone}</strong>{Object.entries(e.details).map(([k, v]) => <p key={k}>{k}: {v}</p>)}</article>)}<h2>Unconfirmed website drafts</h2>{data.drafts.map((d, i) => <article key={i}><p>{d.checkout.customer.name} · +{d.checkout.customer.phone} · {money(d.checkout.subtotal)}</p>{d.checkout.lines.map((l, i) => <p key={i}>{l.quantity} × {l.name} · {l.size}</p>)}<p>Draft only — customer has not confirmed this order.</p></article>)}<h2>Notification queue</h2><p>{data.outbox.length} pending / template-required notifications (latest 50).</p>{data.outbox.map(o => <p key={o.id}>{o.status} · {o.attempts} attempts</p>)}<button className="button button-secondary" disabled={busy} onClick={retry}>Retry pending notifications</button></>}
 </section>;
}
