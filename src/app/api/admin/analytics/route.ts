import { adminAuthorized, privateJson } from '@/lib/server/security';
import { adminDb, adminError, AdminDatabaseError } from '@/lib/server/admin-data';
import { dateRange } from '@/lib/admin-ui';
import { validDate } from '@/lib/website-requests';
import { cloudReady, logEvent } from '@/lib/server/config';
import { restaurant } from '@/config/restaurant';
import type { AnalyticsData } from '@/types/analytics';
export const runtime='nodejs';
export async function GET(request:Request) {
 if(!adminAuthorized(request)) return privateJson({error:'Unauthorized'},401);
 const input=new URL(request.url).searchParams, defaults=dateRange('week');
 const from=input.get('from') ?? defaults.from, to=input.get('to') ?? defaults.to;
 if(!validDate(from)||!validDate(to)||to<from||Date.parse(to)-Date.parse(from)>365*86400000) return privateJson({error:'Choose a valid date range of up to 366 days.'},400);
 try {
  const {data}=await adminDb<AnalyticsData>('rpc/admin_analytics',{method:'POST',body:JSON.stringify({p_from:from,p_to:to})});
  // Exact server counts add lifecycle information not returned by the applied aggregate RPC.
  // Fetch at most one id per query; no customer details enter the analytics payload.
  const nextDay=new Date(Date.parse(to)+86400000).toISOString().slice(0,10);
  const counts=await Promise.all(['new','contacted','resolved','archived'].map(async status=>{
   const q=new URLSearchParams({select:'id',limit:'1',and:'(created_at.gte.'+from+'T00:00:00+05:30,created_at.lt.'+nextDay+'T00:00:00+05:30)',archived_at:status==='archived'?'not.is.null':'is.null'});
   if(status!=='archived') q.set('status',status==='new'?'in.(new,pending)':'eq.'+status);
   const result=await adminDb<unknown[]>('staff_enquiries?'+q);
   return [status,result.total] as const;
  }));
  return privateJson({analytics:{...data,enquiryStatuses:Object.fromEntries(counts)},cloudConfigured:cloudReady(),deliveryEnabled:restaurant.features.delivery});
 } catch(error) {
  logEvent('admin_analytics_failed',{code:error instanceof AdminDatabaseError?error.code:'NETWORK',status:error instanceof AdminDatabaseError?error.status:503});
  const message=error instanceof AdminDatabaseError && ['PGRST202','42703','42P01'].includes(error.code)?'Analytics setup is incomplete. Apply only the new 202609270001_website_requests_analytics.sql migration.':adminError(error);
  return privateJson({error:message},503);
 }
}
