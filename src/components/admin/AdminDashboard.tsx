'use client';
import Image from 'next/image';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { LayoutDashboard, ShoppingBag, FileClock, CalendarDays, MessagesSquare, ChartNoAxesCombined, Bell, Users, History, Settings, Menu, X, RefreshCw, LogOut, ArrowUpRight } from 'lucide-react';
import { dateRange } from '@/lib/admin-ui';
import { type Section, type Row, type Data, request, date, label, reference, Modal, SystemStatus } from './shared';
import { Analytics } from './Analytics';
import { Overview } from './Overview';
import { Records, RecordDetail } from './Records';
import './admin.css';
export type Action = {
    section: string;
    row: Row;
    action: string;
    status?: string;
};
const nav = [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'orders', label: 'Orders', icon: ShoppingBag }, { id: 'drafts', label: 'Website Drafts', icon: FileClock }, { id: 'reservations', label: 'Reservations', icon: CalendarDays }, { id: 'enquiries', label: 'Enquiries', icon: MessagesSquare }, { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined }, { id: 'notifications', label: 'Notifications', icon: Bell }, { id: 'customers', label: 'Customers', icon: Users }, { id: 'history', label: 'History', icon: History }, { id: 'settings', label: 'Settings', icon: Settings }] as const;
export type Filters = {
    search: string;
    status: string;
    source: string;
    fulfilment: string;
    period: string;
    from: string;
    to: string;
    archived: string;
    sort: string;
    page: number;
    size: number;
};
const initial: Filters = { search: '', status: 'all', source: 'all', fulfilment: 'all', period: 'all', from: '', to: '', archived: 'active', sort: 'newest', page: 1, size: 25 };
export function AdminDashboard() {
    const [auth, setAuth] = useState<boolean | null>(null), [development, setDevelopment] = useState(false), [username, setUsername] = useState(''), [password, setPassword] = useState('');
    const [section, setSection] = useState<Section>('overview'), [menu, setMenu] = useState(false), [data, setData] = useState<Data>({}), [busy, setBusy] = useState(false), [error, setError] = useState(''), [toast, setToast] = useState('');
    const [filters, setFilters] = useState(initial), [query, setQuery] = useState(''), [refresh, setRefresh] = useState(0), [refreshed, setRefreshed] = useState('');
    const [actionError, setActionError] = useState('');
    const [selected, setSelected] = useState<Row | null>(null), [pending, setPending] = useState<Action | null>(null), [confirmation, setConfirmation] = useState(''), [actionBusy, setActionBusy] = useState(false);
    useEffect(() => { request('/api/admin/session').then(j => { setAuth(j.authenticated); setDevelopment(j.development); }).catch(() => { setAuth(false); setError('Unable to check your session. Please sign in again.'); }); }, []);
    useEffect(() => { const t = setTimeout(() => setQuery(filters.search), 300); return () => clearTimeout(t); }, [filters.search]);
    useEffect(() => { if (!toast)
        return; const t = setTimeout(() => setToast(''), 7000); return () => clearTimeout(t); }, [toast]);
    const { status, source, fulfilment, period, from, to, archived, sort, page, size } = filters;
    const load = useCallback(async (signal: AbortSignal) => { if (!auth)
        return; setBusy(true); setError(''); const range = period === 'custom' ? { from, to } : dateRange(period); const params = new URLSearchParams({ section, page: String(page), size: String(size), search: query, status, source, fulfilment, archived, sort, ...range }); try {
        const j = await request(`/api/admin/${section === 'analytics' ? 'analytics' : 'dashboard'}?${params}`, { signal });
        if (!signal.aborted) {
            setData(j);
            setRefreshed(new Date().toISOString());
        }
    }
    catch (e) {
        if (!signal.aborted) {
            const err = e as Error & {
                status?: number;
            };
            if (err.status === 401) {
                setAuth(false);
                setData({});
                setSelected(null);
            }
            setError(err.message);
        }
    }
    finally {
        if (!signal.aborted)
            setBusy(false);
    } }, [auth, section, page, size, query, status, source, fulfilment, archived, sort, period, from, to]);
    useEffect(() => { const c = new AbortController(); const timer = setTimeout(() => void load(c.signal), 100); return () => { clearTimeout(timer); c.abort(); }; }, [load, refresh]);
    async function login(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); try {
        await request('/api/admin/session', { method: 'POST', body: JSON.stringify({ username, password }) });
        setPassword('');
        setUsername('');
        setAuth(true);
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    async function logout() { try {
        await request('/api/admin/session', { method: 'DELETE' });
        setAuth(false);
        setData({});
        setSelected(null);
        setPending(null);
        setError('');
    }
    catch (e) {
        setError((e as Error).message);
    } }
    function navigate(next: Section) { if (next === section) { setMenu(false); return; } setBusy(true); setError(''); setSection(next); setMenu(false); setFilters(next === 'history' ? {...initial, archived:'all'} : next === 'analytics' ? {...initial, period:'week', ...dateRange('week')} : initial); setQuery(''); setData({}); setSelected(null); }
    function ask(action: Action) { setActionError(''); setConfirmation(''); setPending(action); }
    async function perform() { if (!pending)
        return; setActionBusy(true); try {
        const { row, action, status: next, section: target } = pending;
        const result = target === 'orders' && action === 'status' ? await request(`/api/admin/orders/${row.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) }) : await request('/api/admin/records', { method: 'PATCH', body: JSON.stringify({ section: target, id: row.token || row.id, action, status: next, confirmation }) });
        setPending(null);
        setSelected(null);
        setToast(result.note || 'Updated successfully');
        setRefresh(v => v + 1);
    }
    catch (e) {
        setActionError((e as Error).message);
    }
    finally {
        setActionBusy(false);
    } }
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
    if (auth === null)
        return <div className="mi-admin ma-login"><p role="status">Opening staff operations…</p></div>;
    if (!auth)
        return <div className="mi-admin ma-login"><div className="ma-login-art"><span>MOZZA ITALIA</span><h1>Good food.<br />Great service.</h1><p>A little care behind every order.</p><div className="ma-art-ring"/></div><div className="ma-login-panel"><div className="ma-login-card"><Image src="/brand/mozza-italia-logo.png" alt="Mozza Italia" width={1600} height={649} sizes="200px" className="ma-login-logo"/><p className="ma-eyebrow">MOZZA ITALIA</p><h1>Staff Operations</h1><p>Welcome back. Let’s get ready for service.</p>{development && <span className="ma-test">DEVELOPMENT</span>}<form onSubmit={login}><label>Username<input autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required maxLength={128}/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={256}/></label>{error && <p className="ma-error" role="alert">{error}</p>}<button className="ma-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowUpRight size={17}/></button></form><small>Authorized staff only · Shadnagar</small></div></div></div>;
    return <div className="mi-admin ma-shell">{menu && <button className="ma-scrim" aria-label="Close navigation" onClick={() => setMenu(false)}/>}
 <aside className={`ma-sidebar ${menu ? 'ma-open' : ''}`}><div className="ma-brand"><Image src="/brand/mozza-italia-logo.png" alt="Mozza Italia" width={1600} height={649} sizes="120px" className="ma-brand-logo"/><div>MOZZA ITALIA<small>STAFF OPERATIONS</small></div><button className="ma-icon ma-mobile" onClick={() => setMenu(false)} aria-label="Close navigation"><X size={20}/></button></div><p className="ma-nav-caption">WORKSPACE</p><nav aria-label="Admin navigation">{nav.map(n => <button key={n.id} className={section === n.id ? 'ma-current' : ''} onClick={() => navigate(n.id)} aria-current={section === n.id ? 'page' : undefined}><n.icon size={18}/>{n.label}{section === n.id && <span className="ma-nav-dot"/>}</button>)}</nav><div className="ma-sidebar-bottom">{development && <span className="ma-test">DEVELOPMENT</span>}<div className="ma-staff"><span>S</span><div>Staff<small>Shadnagar operations</small></div></div><button onClick={() => void logout()}><LogOut size={17}/> Sign out</button></div></aside>
 <div className="ma-workspace"><header className="ma-topbar"><div><button className="ma-icon ma-mobile" aria-label="Open navigation" onClick={() => setMenu(true)}><Menu size={22}/></button><span>Mozza Italia <b> / </b> Shadnagar</span></div><span className="ma-operational"><i /> Staff workspace</span></header><div className="ma-content"><div className="ma-page-heading"><div><p className="ma-eyebrow">{section === 'overview' ? `GOOD ${hour < 12 ? 'MORNING' : hour < 17 ? 'AFTERNOON' : 'EVENING'}, STAFF` : 'MOZZA ITALIA · OPERATIONS'}</p><h1>{nav.find(n => n.id === section)?.label}</h1><p>{section === 'overview' ? 'A clear view of your restaurant.' : 'A little care behind every order.'}</p></div><div className="ma-heading-right"><span>{new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span><button className="ma-secondary" disabled={busy} onClick={() => setRefresh(v => v + 1)}><RefreshCw size={15} className={busy ? 'ma-spin' : ''}/>Refresh data</button>{refreshed && <small>Updated {date(refreshed)} IST</small>}</div></div>
 {error && <div className="ma-error" role="alert"><strong>{section === 'analytics' ? 'Could not load analytics.' : 'We couldn’t load this view.'}</strong><p>{error}</p><button className="ma-secondary" onClick={() => setRefresh(v => v + 1)}>Retry</button></div>}{busy && <div className="ma-loading" role="status" aria-label={section === 'analytics' ? 'Loading analytics' : 'Loading dashboard'}>{section === 'analytics' && <p>Loading analytics…</p>}<span /><span /><span /></div>}
 {!busy && !error && section === 'overview' && <Overview data={data} navigate={navigate}/>}
 {!busy && !error && section === 'settings' && <><SystemStatus data={data}/><article className="ma-panel ma-settings"><h2>Restaurant details</h2><dl><dt>Restaurant</dt><dd>Mozza Italia</dd><dt>Outlet</dt><dd>Shadnagar</dd><dt>WhatsApp</dt><dd>+{data.settings?.phone}</dd><dt>Environment</dt><dd>{development ? 'Development / test' : 'Production'}</dd><dt>Session</dt><dd>Browser session · maximum 8 hours</dd><dt>Notifications</dt><dd>Status updates may notify customers through the existing WhatsApp sender. Queue retry schedules work; it does not send immediately.</dd></dl></article></>}
 {section === 'analytics' && <Analytics data={data} filters={filters} setFilters={setFilters} busy={busy} error={!!error}/>}
 {!['overview', 'settings', 'analytics'].includes(section) && <Records section={section} data={data} busy={busy} error={!!error} filters={filters} setFilters={setFilters} development={development} ask={ask} view={setSelected}/>}
 <footer className="ma-footer">MOZZA ITALIA <span>Made for a smooth service.</span></footer></div></div>
 {selected && <Modal title={section === 'customers' ? 'Customer history' : 'Record details'} drawer close={() => setSelected(null)}><RecordDetail key={selected.id || selected.token} row={selected} section={section} development={development} ask={ask}/></Modal>}
 {pending && <Modal title={pending.action === 'delete' ? 'Delete test record permanently?' : pending.action === 'status' ? `Change status to ${label(pending.status)}?` : `${label(pending.action)} this record?`} close={() => { if (!actionBusy)
        setPending(null); }}><div className="ma-confirm">{actionError && <p role="alert" className="ma-error">{actionError}</p>}<p className="ma-reference">{reference(pending.row)}</p><p>{pending.action === 'delete' ? 'This cannot be undone. Only delete a test record you recognize.' : pending.action === 'status' && pending.section === 'orders' ? 'This updates the order and may notify the customer through WhatsApp.' : pending.action === 'retry' ? 'Queue this notification for the existing sender. A message may be sent when queued work is processed.' : 'Confirm this change to the stored record.'}</p>{pending.action === 'delete' && <label>Type DELETE to continue<input value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="off"/></label>}<div className="ma-actions"><button className="ma-secondary" disabled={actionBusy} onClick={() => setPending(null)}>Cancel</button><button className="ma-primary" disabled={actionBusy || (pending.action === 'delete' && confirmation !== 'DELETE')} onClick={() => void perform()}>{actionBusy ? 'Saving…' : 'Confirm'}</button></div></div></Modal>}
 {toast && <div className="ma-toast" role="status">{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16}/></button></div>}</div>;
}
