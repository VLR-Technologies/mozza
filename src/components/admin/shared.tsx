'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import type { AnalyticsData } from '@/types/analytics';
import type { OrderSummary } from '@/types/order';
export type Section = 'overview' | 'orders' | 'drafts' | 'reservations' | 'enquiries' | 'analytics' | 'notifications' | 'customers' | 'history' | 'settings';
export type Row = {
    id: string;
    token?: string;
    created_at: string;
    archived_at?: string;
    status?: string;
    source?: string;
    public_order_id?: string;
    public_reservation_id?: string;
    public_enquiry_id?: string;
    type?: string;
    snapshot?: OrderSummary;
    checkout?: OrderSummary;
    customer_name?: string;
    customer_phone?: string;
    name?: string;
    phone?: string;
    branch?: string;
    fulfilment_type?: string;
    subtotal?: number;
    reservation_date?: string;
    reservation_time?: string;
    party_size?: number;
    notes?: string;
    expires_at?: string;
    details?: Record<string, string>;
    message_key?: string; notification_type?: string; order_reference?: string;
    attempts?: number;
    lease_until?: string;
    total_orders?: number;
    total_subtotal?: number;
    latest_order?: string;
    reservation_count?: number;
    last_interaction?: string;
    marketing_opt_in?: boolean;
};
export type Summary = {
    todayOrders: number;
    completedToday: number;
    statuses: Record<string, number>;
    drafts: number;
    reservations: number;
    enquiries: number;
    notifications: number;
    todaySubtotal: number;
    weekSubtotal: number;
};
export type Data = {
    analytics?: AnalyticsData;
    cloudConfigured?: boolean;
    deliveryEnabled?: boolean;
    rows?: Row[];
    total?: number;
    summary?: Summary;
    settings?: {
        database: boolean;
        cloud: boolean;
        development: boolean;
        phone: string;
    };
};
export const money = (v: number | null | undefined) => v == null ? 'Price to confirm' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
export const date = (v?: string) => v ? new Date(v).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
export const label = (v?: string) => v === 'whatsapp' ? 'WhatsApp' : (v || '—').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
export const identity = (r: Row) => r.token || r.id;
export const summary = (r: Row) => r.snapshot || r.checkout;
export const name = (r: Row) => r.customer_name || r.name || summary(r)?.customer.name || r.details?.name || 'Guest';
export const phone = (r: Row) => (r.customer_phone || r.phone || summary(r)?.customer.phone || '').replace(/[^0-9]/g, '');
export const reference = (r: Row) => r.public_order_id || r.public_reservation_id || r.public_enquiry_id || r.token || r.id;
export function recordStatus(r: Row, s: Section) { if (r.archived_at)
    return 'archived'; if (s === 'drafts')
    return r.expires_at && new Date(r.expires_at) <= new Date() ? 'expired' : 'active'; if (s === 'enquiries' && r.status === 'pending')
    return 'new'; if (s === 'notifications' && r.status === 'sending')
    return 'retrying'; return r.status || 'new'; }
export function Badge({ value }: {
    value: string;
}) { return <span className={`ma-badge ma-${value}`}>{label(value)}</span>; }
export function Contact({ row }: {
    row: Row;
}) { const p = phone(row); return p ? <span className="ma-contact"><a href={`tel:+${p}`}>Call</a><a href={`https://wa.me/${p}`} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={12}/></a></span> : null; }
export function Modal({ title, children, close, drawer = false }: {
    title: string;
    children: ReactNode;
    close: () => void;
    drawer?: boolean;
}) { const ref = useRef<HTMLDialogElement>(null); useEffect(() => { const d = ref.current; d?.showModal(); return () => d?.close(); }, []); return <dialog ref={ref} className={`ma-dialog ${drawer ? 'ma-drawer' : ''}`} onCancel={e => { e.preventDefault(); close(); }} aria-label={title}><div className="ma-dialog-head"><h2>{title}</h2><button className="ma-icon" aria-label="Close dialog" onClick={close}><X size={20}/></button></div>{children}</dialog>; }
export async function request(url: string, options?: RequestInit) { const r = await fetch(url, { ...options, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...options?.headers } }); const j = await r.json(); if (!r.ok)
    throw Object.assign(new Error(j.error || 'Unable to complete request'), { status: r.status }); return j; }
export function SystemStatus({ data }: {
    data: Data;
}) { return <article className="ma-panel ma-system"><h2>System status</h2><div><span>Database</span><Badge value={data.settings?.database ? 'connected' : 'unavailable'}/></div><div><span>WhatsApp Cloud API</span><Badge value={data.settings?.cloud ? 'configured' : 'not_configured'}/></div><div><span>Notification queue</span><strong>{data.summary?.notifications || 0} pending</strong></div><p className="ma-muted">Configuration status does not verify Meta delivery.</p></article>; }

export function enquiryType(row: Row) { if (row.type) return label(row.type); const details = row.details || {}; if (details.type || details.intent) return label(details.type || details.intent); const text = JSON.stringify(details); return /catering/i.test(text) ? 'Catering' : /book a table|reservation|reserve a table/i.test(text) ? 'Reservation Question' : /location|outlet/i.test(text) ? 'Location' : 'WhatsApp Support'; }
