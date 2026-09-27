-- Apply after 202609260002. This file is safe to retry; do not rerun previous migrations.
begin;
alter table public.reservations add column if not exists source text not null default 'whatsapp' check(source in ('website','whatsapp'));
alter table public.reservations add column if not exists request_key text unique;
alter table public.reservations add column if not exists request_hash text;
-- The compact website planner does not collect identity. Preserve missing data as NULL.
alter table public.reservations alter column customer_id drop not null;
alter table public.reservations alter column name drop not null;
alter table public.reservations alter column phone drop not null;
alter table public.staff_enquiries add column if not exists source text not null default 'whatsapp' check(source in ('website','whatsapp'));
alter table public.staff_enquiries add column if not exists type text;
alter table public.staff_enquiries add column if not exists public_enquiry_id text unique;
alter table public.staff_enquiries add column if not exists request_key text unique;
alter table public.staff_enquiries add column if not exists request_hash text;
alter table public.staff_enquiries alter column phone drop not null;

create or replace function public.create_website_request(p_key text,p_hash text,p_reference text,p_request jsonb) returns jsonb
language plpgsql set search_path=public as $$
declare existing_hash text; existing_reference text; customer_uuid uuid; contact text:=nullif(p_request->>'phone','');
begin
 perform pg_advisory_xact_lock(hashtextextended('website-request:'||p_key,0));
 if p_request->>'kind'='reservation' then
  select request_hash,public_reservation_id into existing_hash,existing_reference from reservations where request_key=p_key;
 else
  select request_hash,public_enquiry_id into existing_hash,existing_reference from staff_enquiries where request_key=p_key;
 end if;
 if found then
  if existing_hash<>p_hash then return '{"conflict":true}'::jsonb; end if;
  return jsonb_build_object('reference',existing_reference,'duplicate',true);
 end if;
 perform pg_advisory_xact_lock(hashtextextended('website-contact:'||coalesce(contact,p_hash),0));
 if (select count(*) from reservations where source='website' and created_at>now()-interval '1 hour' and ((contact is not null and phone=contact) or (contact is null and request_hash=p_hash)))+
    (select count(*) from staff_enquiries where source='website' and created_at>now()-interval '1 hour' and ((contact is not null and phone=contact) or (contact is null and request_hash=p_hash)))>=10 then return '{"limited":true}'::jsonb;end if;
 if p_request->>'kind'='reservation' then
  if contact is not null and nullif(p_request->>'name','') is not null then
   insert into customers(phone,name) values(contact,p_request->>'name')
   on conflict(phone) do update set name=excluded.name,updated_at=now() returning id into customer_uuid;
  end if;
  insert into reservations(public_reservation_id,customer_id,branch,reservation_date,reservation_time,party_size,name,phone,notes,status,source,request_key,request_hash)
  values(p_reference,customer_uuid,p_request->>'branch',(p_request->>'date')::date,(p_request->>'time')::time,(p_request->>'guests')::integer,nullif(p_request->>'name',''),contact,p_request->>'notes','pending','website',p_key,p_hash);
 elsif p_request->>'kind'='enquiry' and p_request->>'type' in ('catering','bulk_order') then
  insert into staff_enquiries(phone,details,status,source,type,public_enquiry_id,request_key,request_hash)
  values(contact,p_request-'kind','new','website',p_request->>'type',p_reference,p_key,p_hash);
 else raise exception 'Invalid request kind';
 end if;
 return jsonb_build_object('reference',p_reference);
end;
$$;
revoke all on function public.create_website_request(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.create_website_request(text,text,text,jsonb) to service_role;

create or replace function public.admin_analytics(p_from date,p_to date) returns jsonb
language plpgsql stable set search_path=public as $$
declare result jsonb;
begin
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>365 then raise exception 'Choose a range of up to 366 days';end if;
 with bounds(lo, hi) as (select p_from::timestamp at time zone 'Asia/Kolkata',(p_to+1)::timestamp at time zone 'Asia/Kolkata'),
 o as (select orders.* from orders,bounds where created_at>=lo and created_at<hi),
 sold as (select * from o where status in ('confirmed','preparing','ready','completed')),
 r as (select reservations.* from reservations,bounds where created_at>=lo and created_at<hi),
 e as (select staff_enquiries.* from staff_enquiries,bounds where created_at>=lo and created_at<hi),
 d as (select order_drafts.* from order_drafts,bounds where created_at>=lo and created_at<hi),
 days(day_date) as (
  select generate_series(p_from::timestamp,p_to::timestamp,interval '1 day')::date
 ),
 daily(day_date, order_count, menu_subtotal) as (
  select (created_at at time zone 'Asia/Kolkata')::date, count(*),
   coalesce(sum(subtotal) filter(where status in ('confirmed','preparing','ready','completed')),0)
  from o group by 1
 ),
 items as (select i.menu_item_id,i.item_name_snapshot,i.variant,sum(i.quantity) quantity,
   case when count(*) filter(where i.line_total is null)>0 then null else sum(i.line_total) end subtotal
   from order_items i join sold on sold.id=i.order_id group by i.menu_item_id,i.item_name_snapshot,i.variant order by quantity desc,i.item_name_snapshot,i.variant limit 10)
 select jsonb_build_object(
  'from',p_from,'to',p_to,
  'totals',jsonb_build_object('orders',(select count(*) from o),'confirmed',(select count(*) from sold),'completed',(select count(*) from o where status='completed'),
   'subtotal',(select coalesce(sum(subtotal),0) from sold),'unpricedOrders',(select count(*) from sold where subtotal is null),
   'drafts',(select count(*) from d),'reservations',(select count(*) from r),'enquiries',(select count(*) from e)),
  'trend',(select jsonb_agg(jsonb_build_object('date',days.day_date,'orders',coalesce(daily.order_count,0),'subtotal',coalesce(daily.menu_subtotal,0)) order by days.day_date) from days left join daily using(day_date)),
  'statuses',coalesce((select jsonb_object_agg(status,n) from (select status,count(*) n from o group by status) s),'{}'::jsonb),
  'sources',coalesce((select jsonb_object_agg(source,n) from (select source,count(*) n from o group by source) s),'{}'::jsonb),
  'fulfilment',coalesce((select jsonb_object_agg(fulfilment_type,n) from (select fulfilment_type,count(*) n from o group by fulfilment_type) s),'{}'::jsonb),
  'topItems',coalesce((select jsonb_agg(jsonb_build_object('id',menu_item_id,'name',item_name_snapshot,'variant',variant,'quantity',quantity,'subtotal',subtotal) order by quantity desc,item_name_snapshot,variant) from items),'[]'::jsonb),
  'reservations',coalesce((select jsonb_object_agg(status,n) from (select status,count(*) n from r group by status) s),'{}'::jsonb),
  'enquiries',coalesce((select jsonb_object_agg(category,n) from (select coalesce(nullif(type,''),nullif(details->>'type',''),'unclassified') category,count(*) n from e group by 1) s),'{}'::jsonb),
  'drafts',jsonb_build_object('created',(select count(*) from d),'active',(select count(*) from d where consumed_at is null and expires_at>now()),
    'expired',(select count(*) from d where consumed_at is null and expires_at<=now()),'consumed',(select count(*) from d where consumed_at is not null),
    'linkedConfirmed',(select count(*) from d where exists(select 1 from orders x where x.draft_token=d.token and x.status in ('confirmed','preparing','ready','completed'))))
 ) into result;
 return result;
end;
$$;
revoke all on function public.admin_analytics(date,date) from public,anon,authenticated;
grant execute on function public.admin_analytics(date,date) to service_role;
create index if not exists reservations_created_at_idx on public.reservations(created_at);
create index if not exists staff_enquiries_created_at_idx on public.staff_enquiries(created_at);
create index if not exists order_drafts_created_at_idx on public.order_drafts(created_at);
commit;
