import 'server-only';
import { randomBytes, createHash, timingSafeEqual, createHmac } from 'node:crypto';
export const publicId = (prefix = 'MI', now = new Date()) => `${prefix}-${new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now).replace(/-/g, '')}-${randomBytes(6).toString('hex').toUpperCase()}`;
export const draftToken = () => `MI-DRAFT-${randomBytes(16).toString('hex').toUpperCase()}`;
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function constantEqual(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
export function validSignature(raw: string, signature: string | null, secret: string) { return !!secret && !!signature && constantEqual(`sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`, signature); }
export function adminAuthorized(request: Request) { const secret = process.env.ADMIN_ORDER_SECRET; return !!secret && secret.length >= 32 && constantEqual(request.headers.get('authorization') || '', `Bearer ${secret}`); }
export function sameOrigin(request: Request) {
    const origin = request.headers.get('origin');
    if (!origin)
        return false;
    try {
        const parsed = new URL(origin);
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin)
            return false;
        // Next may construct an internal localhost URL behind a reverse proxy.
        // Host is the browser-facing request authority; do not trust forwarded-origin headers.
        return origin === new URL(request.url).origin || (parsed.host === request.headers.get('host') && parsed.protocol === new URL(request.url).protocol);
    }
    catch {
        return false;
    }
}
export async function readBody(request: Request, limit = 32768): Promise<string> {
    if (Number(request.headers.get('content-length') || 0) > limit)
        throw new Error('Request too large');
    const reader = request.body?.getReader();
    if (!reader)
        return '';
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        size += value.length;
        if (size > limit) {
            await reader.cancel();
            throw new Error('Request too large');
        }
        chunks.push(value);
    }
    return Buffer.concat(chunks).toString('utf8');
}
export const privateJson = (value: unknown, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
