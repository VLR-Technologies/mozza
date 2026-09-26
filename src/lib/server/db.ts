import 'server-only';
import { databaseReady } from './config';
export async function db<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!databaseReady())
        throw new Error('Database is not configured');
    const base = process.env.SUPABASE_URL!;
    if (!base.startsWith('https://') && !/^http:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(base))
        throw new Error('Database requires HTTPS');
    const response = await fetch(`${base.replace(/\/$/, '')}/rest/v1/${path}`, { ...options, cache: 'no-store', signal: AbortSignal.timeout(12000), headers: { 'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!, 'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`, 'Content-Type': 'application/json', ...options.headers } });
    if (!response.ok)
        throw new Error(`Database request failed (${response.status})`);
    const body = await response.text();
    return body ? JSON.parse(body) as T : undefined as T;
}
export const rpc = <T>(name: string, args: unknown) => db<T>(`rpc/${name}`, { method: 'POST', body: JSON.stringify(args) });
