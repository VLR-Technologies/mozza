import { adminAuthorized, privateJson, sameOrigin } from '@/lib/server/security';
import { drainOutbox } from '@/lib/whatsapp/outbox';
export const runtime = 'nodejs';
export async function POST(request: Request) {
    if (!adminAuthorized(request))
        return privateJson({ error: 'Unauthorized' }, 401);
    if (!sameOrigin(request))
        return privateJson({ error: 'Invalid origin' }, 403);
    try {
        await drainOutbox();
        return privateJson({ ok: true });
    }
    catch {
        return privateJson({ error: 'Some notifications remain pending. Check Meta configuration and retry.' }, 503);
    }
}
