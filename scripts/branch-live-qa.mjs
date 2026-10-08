// Explicit local/test-project QA. Creates clearly labelled test records; never calls Meta.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
if(!process.argv.includes('--test-project')) throw Error('Requires explicit --test-project acknowledgement');
const base='http://127.0.0.1:3000';
const contacts={hyderabad:'918712357688',shadnagar:'919949799488',jadcherla:'919951047424',guntur:'919246769769'};
console.log({supabaseUrlDetected:!!process.env.SUPABASE_URL,serviceKeyDetected:!!process.env.SUPABASE_SERVICE_ROLE_KEY});
const date=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
const run=randomUUID().slice(0,8);
const headers={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY};
async function rows(path){const r=await fetch(process.env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/'+path,{headers});assert.equal(r.status,200,'Supabase read status');return r.json();}
for(const [index,[branch,phone]] of Object.entries(contacts).entries()){
 const name='Branch QA '+run+' '+branch,customer={name,phone:'900000008'+index};
 const items=[{menuItemId:'margarita',variant:0,quantity:2},{menuItemId:'chicken-zinger-burger',variant:0,quantity:1},{menuItemId:'veg-fingers',variant:0,quantity:3}];
 for(const kind of ['order','reservation','enquiry']){
  const payload=kind==='order'?{branch,items,fulfilment:'pickup',customer}:kind==='reservation'?{kind,branch,...customer,form:'full',date,time:'19:30',guests:4,notes:'Automated branch-routing test; not a real booking.'}:{kind,branch,...customer,eventType:'Bulk Food Order',eventDate:date,guestRange:'21–30',service:'Pickup',food:'Mixed',notes:'Automated branch-routing test; not a real enquiry.'};
  const r=await fetch(base+(kind==='order'?'/api/orders':'/api/website-requests'),{method:'POST',headers:{origin:base,'content-type':'application/json','idempotency-key':randomUUID()},body:JSON.stringify(payload)});
  const body=await r.json();assert.equal(r.status,200,kind+' HTTP '+r.status);assert.ok(body.whatsappUrl,kind+' response must include continuation');const url=new URL(body.whatsappUrl);assert.equal(url.pathname,'/'+phone);assert.ok(url.searchParams.get('text').includes('Outlet: '+branch[0].toUpperCase()+branch.slice(1)));
  let saved;
  if(kind==='order'){assert.equal(body.mode,'stored-fallback');saved=await rows('order_drafts?customer_phone=eq.91'+customer.phone+'&select=checkout');saved=saved.find(row=>row.checkout.customer.name===name)?.checkout;assert.equal(saved?.branch,branch);assert.equal(saved.subtotal,905);}
  else if(kind==='reservation'){saved=await rows('reservations?public_reservation_id=eq.'+encodeURIComponent(body.reference)+'&select=branch,status');assert.equal(saved[0]?.branch,branch);assert.equal(saved[0]?.status,'pending');}
  else {saved=await rows('staff_enquiries?public_enquiry_id=eq.'+encodeURIComponent(body.reference)+'&select=details,status');assert.equal(saved[0]?.details.branch,branch);assert.equal(saved[0]?.status,'new');}
  console.log({branch,kind,http:r.status,recipient:phone,persistedBranch:branch,result:'PASS'});
 }
}
console.log('PASS: 12 labelled test records created and verified. No Meta calls or real messages. QA batch '+run);
