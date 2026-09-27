import { cookieHeader, createSession, loginAllowed, sessionAuthorized, validLogin } from '@/lib/server/admin-session';
import { privateJson, readBody, sameOrigin } from '@/lib/server/security';
export const runtime = 'nodejs';
export async function GET(request: Request) {
    return privateJson({ authenticated: sessionAuthorized(request), development: process.env.NODE_ENV !== 'production' });
}
export async function POST(request: Request) {
    if (!sameOrigin(request)) return privateJson({ error: 'Invalid origin' }, 403);
    if (!loginAllowed(new URL(request.url).host)) return privateJson({ error: 'Too many attempts. Wait one minute and try again.' }, 429);
    try {
        const input = JSON.parse(await readBody(request, 2048));
        if (!validLogin(input.username, input.password)) return privateJson({ error: 'Sign-in failed. Check your credentials or ask your administrator to configure staff access.' }, 401);
        const response = privateJson({ ok: true }); response.headers.set('Set-Cookie', cookieHeader(createSession())); return response;
    } catch { return privateJson({ error: 'Invalid login request' }, 400); }
}
export async function DELETE(request: Request) {
    if (!sameOrigin(request)) return privateJson({ error: 'Invalid origin' }, 403);
    const response = privateJson({ ok: true }); response.headers.set('Set-Cookie', cookieHeader('')); return response;
}
