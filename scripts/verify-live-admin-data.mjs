// Read-only QA. Uses local credentials without printing them. Never sends WhatsApp.
import nextEnv from '@next/env';
import assert from 'node:assert/strict';
import {load} from './ts-loader.mjs';
nextEnv.loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const {dateRange}=load('src/lib/admin-ui.ts');
const base='http://127.0.0.1:3000';
const headers={authorization:`Bearer ${process.env.ADMIN_ORDER_SECRET}`};
async function api(path,authorized=true){const r=await fetch(base+path,{headers:authorized?headers:{}});return {status:r.status,data:await r.json()};}
async function rows(table,from,to,select){
 const end=new Date(Date.parse(to)+86400000).toISOString().slice(0,10);
 const q=new URLSearchParams({select,and:`(created_at.gte.${from}T00:00:00+05:30,created_at.lt.${end}T00:00:00+05:30)`,limit:'1000'});
 const r=await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}?${q}`,{headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,Prefer:'count=exact'}});
 assert.equal(r.status,200,`${table} read status`);const j=await r.json();assert.equal(j.length,Number(r.headers.get('content-range')?.split('/')[1]),'QA cross-check must not truncate rows');return j;
}
for(const section of ['overview','orders','drafts','reservations','enquiries','notifications','customers','history','settings']){
 const path=`/api/admin/dashboard?section=${section}`;
 assert.equal((await api(path,false)).status,401);const r=await api(path);assert.equal(r.status,200);console.log(`${section}: authorized 200; anonymous 401`);
}
assert.equal((await api('/api/admin/analytics',false)).status,401);
for(const period of ['today','yesterday','week','last30','month','custom']){
 const range=period==='custom'?{from:'2000-01-01',to:'2000-01-07'}:dateRange(period);
 const r=await api('/api/admin/analytics?'+new URLSearchParams(range));assert.equal(r.status,200);const a=r.data.analytics;
 const [o,d,res,e]=await Promise.all([rows('orders',range.from,range.to,'id,status,source,fulfilment_type,subtotal,created_at'),rows('order_drafts',range.from,range.to,'token,consumed_at,expires_at'),rows('reservations',range.from,range.to,'id,status'),rows('staff_enquiries',range.from,range.to,'id,status,archived_at,type,details')]);
 const sold=o.filter(v=>['confirmed','preparing','ready','completed'].includes(v.status));
 assert.equal(a.totals.orders,o.length);assert.equal(a.totals.confirmed,sold.length);assert.equal(a.totals.completed,o.filter(v=>v.status==='completed').length);assert.equal(a.totals.subtotal,sold.reduce((n,v)=>n+Number(v.subtotal||0),0));
 assert.equal(a.totals.drafts,d.length);assert.equal(a.totals.reservations,res.length);assert.equal(a.totals.enquiries,e.length);
 assert.equal(a.trend.reduce((n,v)=>n+v.orders,0),o.length);assert.equal(a.trend.reduce((n,v)=>n+v.subtotal,0),a.totals.subtotal);
 assert.equal(a.enquiryStatuses.new,e.filter(v=>!v.archived_at&&['new','pending'].includes(v.status)).length);assert.equal(a.enquiryStatuses.archived,e.filter(v=>v.archived_at).length);
 assert.equal(a.drafts.active,d.filter(v=>!v.consumed_at&&Date.parse(v.expires_at)>Date.now()).length);
 console.log(JSON.stringify({period,range,verifiedTotals:a.totals}));
}
for(const [section,search] of [['reservations','QA Reservation Test 0927'],['enquiries','QA Catering Test 0927'],['drafts','QA Website Order 0927']]){
 const r=await api('/api/admin/dashboard?'+new URLSearchParams({section,search}));assert.equal(r.status,200);assert.equal(r.data.total,1,'Exactly one UI-created QA record');const v=r.data.rows[0];
 if(section==='drafts'){assert.equal(v.checkout.subtotal,520);assert.equal(v.checkout.lines.length,2);assert.equal(v.checkout.customer.name,search);assert.equal(v.checkout.customer.phone,'919000000091');console.log('Website draft: 2 burger servings + 1 Margarita, subtotal 520, customer and phone verified');}
 else {assert.equal(v.source,'website');assert.equal(v.status,section==='reservations'?'pending':'new');if(section==='enquiries')assert.equal(v.type,'catering');console.log(`${section}: one website record; status ${v.status}; retry did not duplicate`);}
}
console.log('PASS: live reads, auth checks and independent database cross-checks. No Meta calls or writes.');
