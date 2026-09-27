import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from './ts-loader.mjs';
const {validateWebsiteRequest,validDate}=load('src/lib/website-requests.ts');
const {dateRange}=load('src/lib/admin-ui.ts');
const website=load('src/app/api/website-requests/route.ts');
const analytics=load('src/app/api/admin/analytics/route.ts');
const {buildListQuery}=load('src/lib/server/admin-data.ts');
const original={...process.env}, realFetch=globalThis.fetch;
const reservation={kind:'reservation',name:'QA Reservation',phone:'9000000091',branch:'shadnagar',date:'2099-10-15',time:'19:00',guests:'2',notes:'QA only'};
const enquiry={kind:'enquiry',name:'QA Catering',phone:'9000000091',branch:'shadnagar',eventType:'Birthday',eventDate:'2099-10-15',guestRange:'21–30',service:'Pickup'};
function setup(){process.env.SUPABASE_URL='https://example.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='test-server-only';process.env.ADMIN_ORDER_SECRET='qa-only-secret-at-least-32-characters';}
function req(body,key='qa-idempotency-key-001',origin='http://localhost:3000'){return new Request('http://localhost:3000/api/website-requests',{method:'POST',headers:{origin,'idempotency-key':key,'content-type':'application/json'},body:JSON.stringify(body)});}
function admin(query=''){return new Request('http://localhost:3000/api/admin/analytics'+query,{headers:{authorization:'Bearer '+process.env.ADMIN_ORDER_SECRET}});}
test.afterEach(()=>{globalThis.fetch=realFetch;for(const k of Object.keys(process.env))if(!(k in original))delete process.env[k];Object.assign(process.env,original);});
test('reservation normalization and compact planner preserve available data',()=>{
 const r=validateWebsiteRequest(reservation);assert.equal(r.phone,'919000000091');assert.equal(r.guests,2);
 const p=validateWebsiteRequest({...reservation,form:'planner',name:undefined,phone:undefined,guests:'13+'});assert.equal(p.name,null);assert.equal(p.phone,null);assert.match(p.notes,/13\+/);
});
test('invalid dates, stale requests, unknown outlets and bad phone are rejected',()=>{
 assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2028-02-29'),true);
 for(const change of [{date:'2026-02-30'},{date:'2001-01-01'},{time:'24:00'},{guests:0},{branch:'unknown'},{phone:'abc'}])assert.throws(()=>validateWebsiteRequest({...reservation,...change}));
});
test('catering and bulk classification follows the submitted event type',()=>{
 assert.equal(validateWebsiteRequest(enquiry).type,'catering');assert.equal(validateWebsiteRequest({...enquiry,eventType:'Bulk Food Order'}).type,'bulk_order');
 assert.throws(()=>validateWebsiteRequest({...enquiry,service:'unknown'}));
});
test('public reservation saves via privileged RPC before returning pending handoff',async()=>{
 setup();let body;globalThis.fetch=async(url,options)=>{assert.match(url,/rpc\/create_website_request$/);assert.equal(options.headers.apikey,'test-server-only');body=JSON.parse(options.body);return Response.json({reference:'MR-QA-1'});};
 const r=await website.POST(req(reservation));const j=await r.json();assert.equal(r.status,200);assert.equal(body.p_request.phone,'919000000091');assert.equal(j.status,'pending');assert.match(decodeURIComponent(j.whatsappUrl),/MR-QA-1/);assert.doesNotMatch(JSON.stringify(j),/test-server-only/);
});
test('catering save returns new status and structured event details',async()=>{
 setup();globalThis.fetch=async(_url,options)=>{const v=JSON.parse(options.body).p_request;assert.equal(v.type,'catering');assert.equal(v.guestRange,'21–30');return Response.json({reference:'ME-QA-1'});};
 const r=await website.POST(req(enquiry));assert.equal(r.status,200);assert.equal((await r.json()).status,'new');
});
test('retries send identical hashed idempotency keys and return the existing reference',async()=>{
 setup();const bodies=[];globalThis.fetch=async(_url,options)=>{bodies.push(JSON.parse(options.body));return Response.json({reference:'MR-QA-1',duplicate:bodies.length>1});};
 const a=await (await website.POST(req(reservation))).json(),b=await (await website.POST(req(reservation))).json();assert.equal(a.reference,b.reference);assert.equal(bodies[0].p_key,bodies[1].p_key);assert.equal(bodies[0].p_hash,bodies[1].p_hash);assert.notEqual(bodies[0].p_key,'qa-idempotency-key-001');
});
test('database failure, conflicts and rate limits never return a handoff or false success',async()=>{
 setup();for(const [result,status] of [[{conflict:true},409],[{limited:true},429],[{},503]]){globalThis.fetch=async()=>Response.json(result);const r=await website.POST(req(reservation));assert.equal(r.status,status);assert.equal((await r.json()).whatsappUrl,undefined);}
 globalThis.fetch=async()=>{throw Error('SECRET');};const r=await website.POST(req(reservation));assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/SECRET/);
});
test('bad origin, key and malformed data fail before any database operation',async()=>{
 setup();globalThis.fetch=()=>{throw Error('must not access database');};assert.equal((await website.POST(req(reservation,'qa-idempotency-key-001','https://other.invalid'))).status,403);assert.equal((await website.POST(req(reservation,'short'))).status,400);assert.equal((await website.POST(req({...reservation,date:'bad'}))).status,400);
});
test('analytics presets use IST across midnight and month/year boundaries',()=>{
 const now=new Date('2026-12-31T19:00:00Z');assert.deepEqual(dateRange('today',now),{from:'2027-01-01',to:'2027-01-01'});assert.deepEqual(dateRange('yesterday',now),{from:'2026-12-31',to:'2026-12-31'});assert.deepEqual(dateRange('week',now),{from:'2026-12-26',to:'2027-01-01'});assert.deepEqual(dateRange('last30',now),{from:'2026-12-03',to:'2027-01-01'});assert.deepEqual(dateRange('month',now),{from:'2027-01-01',to:'2027-01-01'});
});
test('analytics rejects anonymous and malformed/reversed/oversized ranges before querying',async()=>{
 setup();globalThis.fetch=()=>{throw Error('must not access database');};assert.equal((await analytics.GET(new Request('http://localhost/api/admin/analytics'))).status,401);
 for(const q of ['?from=2026-02-30&to=2026-03-01','?from=2026-10-01&to=2026-09-01','?from=2020-01-01&to=2026-01-01','?from=&to='])assert.equal((await analytics.GET(admin(q))).status,400);
});
test('analytics preserves aggregate values, null item subtotal and exact enquiry lifecycle counts',async()=>{
 setup();const aggregate={from:'2026-09-01',to:'2026-09-02',totals:{orders:3,subtotal:650},topItems:[{id:'pizza',quantity:2,subtotal:null}],trend:[{date:'2026-09-01',orders:3,subtotal:650}]};
 globalThis.fetch=async(url,options)=>{if(url.includes('rpc/')){assert.deepEqual(JSON.parse(options.body),{p_from:'2026-09-01',p_to:'2026-09-02'});return Response.json(aggregate);}const u=new URL(url);assert.match(u.searchParams.get('and'),/created_at.lt.2026-09-03T00:00:00\+05:30/);assert.equal(u.searchParams.get('limit'),'1');return Response.json([{id:'qa'}],{headers:{'content-range':'0-0/2'}});};
 const r=await analytics.GET(admin('?from=2026-09-01&to=2026-09-02')),j=await r.json();assert.equal(r.status,200);assert.equal(j.analytics.totals.subtotal,650);assert.equal(j.analytics.topItems[0].subtotal,null);assert.deepEqual(j.analytics.enquiryStatuses,{new:2,contacted:2,resolved:2,archived:2});assert.equal(r.headers.get('cache-control'),'no-store');
});
test('website and legacy new enquiries share New filter; internal request hashes stay server-side',()=>{
 const q=decodeURIComponent(buildListQuery(new URLSearchParams({section:'enquiries',status:'new'})).path);assert.match(q,/status.in.\(new,pending\)/);assert.match(q,/source/);assert.doesNotMatch(q,/request_key|request_hash/);
});
