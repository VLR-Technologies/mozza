-- Additive admin management fields. Apply once after the original migration.
begin;
alter table public.orders add column if not exists archived_at timestamptz;
alter table public.order_drafts add column if not exists archived_at timestamptz;
alter table public.reservations add column if not exists archived_at timestamptz;
alter table public.staff_enquiries add column if not exists archived_at timestamptz;
alter table public.whatsapp_outbox add column if not exists archived_at timestamptz;
alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations add constraint reservations_status_check check(status in ('pending','confirmed','declined','cancelled','completed'));
create index if not exists orders_admin_created on public.orders(created_at desc);
create index if not exists orders_admin_active on public.orders(status,created_at desc) where archived_at is null;
-- Read-only aggregates, restricted to the existing service role.
create or replace function public.admin_dashboard_summary() returns jsonb
language sql stable set search_path=public as $$
with clock as (select (now() at time zone 'Asia/Kolkata')::date as today),
s as (select status,count(*) as n from orders where archived_at is null group by status)
select jsonb_build_object(
 'todayOrders',(select count(*) from orders,clock where (created_at at time zone 'Asia/Kolkata')::date=today),
 'completedToday',(select count(*) from orders,clock where status='completed' and (updated_at at time zone 'Asia/Kolkata')::date=today),
 'statuses',coalesce((select jsonb_object_agg(status,n) from s),'{}'::jsonb),
 'drafts',(select count(*) from order_drafts where consumed_at is null and archived_at is null and expires_at>now()),
 'reservations',(select count(*) from reservations where status in ('pending','confirmed') and archived_at is null),
 'enquiries',(select count(*) from staff_enquiries where status in ('pending','new','contacted') and archived_at is null),
 'notifications',(select count(*) from whatsapp_outbox where status in ('pending','sending','template_required') and archived_at is null),
 'todaySubtotal',(select coalesce(sum(subtotal),0) from orders,clock where status in ('confirmed','preparing','ready','completed') and (created_at at time zone 'Asia/Kolkata')::date=today),
 'weekSubtotal',(select coalesce(sum(subtotal),0) from orders where status in ('confirmed','preparing','ready','completed') and created_at>=date_trunc('week',now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata')
);
$$;
revoke all on function public.admin_dashboard_summary() from public, anon, authenticated;
grant execute on function public.admin_dashboard_summary() to service_role;
create or replace view public.admin_customer_history with (security_invoker=true) as
select c.id,c.name,c.phone,c.marketing_opt_in,c.created_at,
 (select count(*) from orders o where o.customer_id=c.id) as total_orders,
 (select coalesce(sum(subtotal),0) from orders o where o.customer_id=c.id and o.status in ('confirmed','preparing','ready','completed')) as total_subtotal,
 (select max(created_at) from orders o where o.customer_id=c.id) as latest_order,
 (select count(*) from reservations r where r.customer_id=c.id) as reservation_count,
 greatest(c.updated_at,(select max(created_at) from orders o where o.customer_id=c.id),(select max(created_at) from reservations r where r.customer_id=c.id),(select max(created_at) from staff_enquiries e where e.phone=c.phone)) as last_interaction
from customers c;
revoke all on public.admin_customer_history from public,anon,authenticated;
grant select on public.admin_customer_history to service_role;
commit;
