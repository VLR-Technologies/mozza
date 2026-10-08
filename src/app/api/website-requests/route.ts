import { validateWebsiteRequest, websiteRequestMessage } from '@/lib/website-requests';
import { hash, publicId, privateJson, readBody, sameOrigin } from '@/lib/server/security';
import { rpc } from '@/lib/server/db';
import { serverWhatsappUrl, logEvent } from '@/lib/server/config';
export const runtime = 'nodejs';
export async function POST(request: Request) {
 if (!sameOrigin(request)) return privateJson({error:'Invalid request origin.'},403);
 const key = request.headers.get('idempotency-key');
 if (!key || !/^[a-zA-Z0-9-]{16,80}$/.test(key)) return privateJson({error:'Invalid request key. Please reload the form.'},400);
 let input;
 try { input = validateWebsiteRequest(JSON.parse(await readBody(request,8192))); }
 catch(error) { return privateJson({error: error instanceof Error ? error.message : 'Invalid form.'},400); }
 try {
  const stored = await rpc<{reference:string;conflict?:boolean;limited?:boolean}>('create_website_request',{p_key:hash(key),p_hash:hash(JSON.stringify(input)),p_reference:publicId(input.kind==='reservation'?'MR':'ME'),p_request:input});
  if (stored.conflict) return privateJson({error:'This request has changed. Please review the form and submit again.'},409);
  if (stored.limited) return privateJson({error:'Too many requests. Please contact the restaurant directly or try again later.'},429);
  if (!stored.reference) throw new Error('Missing saved reference');
  return privateJson({reference:stored.reference,status:input.kind==='reservation'?'pending':'new',whatsappUrl:serverWhatsappUrl(input.branch, websiteRequestMessage(input,stored.reference))});
 } catch { logEvent('website_request_save_failed',{kind:input.kind}); return privateJson({error:'We could not save your request. Please retry. No booking has been confirmed.'},503); }
}
