import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const sessionCookie = 'mozza_staff';
const lifetime = 8 * 60 * 60;
function equal(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
function credentials() {
    const production = process.env.NODE_ENV === 'production';
    const username = production ? process.env.ADMIN_USERNAME : process.env.ADMIN_TEST_USERNAME;
    const password = production ? process.env.ADMIN_PASSWORD : process.env.ADMIN_TEST_PASSWORD;
    const secret = process.env.ADMIN_ORDER_SECRET;
    if (!username || !password || !secret || secret.length < 32 || (production && (password.length < 16 || password === 'test' || username === 'test')))
        return null;
    return { username, password, secret };
}
export function validLogin(username: unknown, password: unknown) {
    const config = credentials();
    return !!config && typeof username === 'string' && typeof password === 'string' && equal(username, config.username) && equal(password, config.password);
}
function signature(payload: string) {
    const config = credentials();
    return config ? createHmac('sha256', config.secret).update(`${config.username}\0${config.password}\0${payload}`).digest('base64url') : '';
}
export function createSession() {
    const payload = `${Math.floor(Date.now() / 1000) + lifetime}.${randomBytes(24).toString('hex')}`;
    return `${payload}.${signature(payload)}`;
}
export function sessionAuthorized(request: Request) {
    const token = request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(`${sessionCookie}=`))?.slice(sessionCookie.length + 1);
    if (!token || token.length > 256)
        return false;
    const [expires, nonce, signed, extra] = token.split('.');
    const now = Math.floor(Date.now() / 1000);
    if (extra || !/^\d+$/.test(expires) || !/^[a-f0-9]{48}$/.test(nonce || '') || Number(expires) <= now || Number(expires) > now + lifetime)
        return false;
    const expected = signature(`${expires}.${nonce}`);
    return !!expected && !!signed && equal(expected, signed);
}
export function cookieHeader(token: string) {
    return `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}${token ? '' : '; Max-Age=0'}`;
}
// Bounded process-local throttle. Production deployments should also rate-limit at their gateway.
const attempts = new Map<string, {
    count: number;
    until: number;
}>();
export function loginAllowed(host: string) {
    const now = Date.now();
    for (const [key, entry] of attempts)
        if (entry.until < now)
            attempts.delete(key);
    const entry = attempts.get(host) || { count: 0, until: now + 60000 };
    entry.count++;
    attempts.set(host, entry);
    return entry.count <= 10;
}
