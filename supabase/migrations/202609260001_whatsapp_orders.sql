-- Apply once in Supabase SQL editor or via `supabase db push`.
-- Operational tables are accessible ONLY through the server service role.
create extension if not exists pgcrypto;
create table public.customers (
 id uuid primary key default gen_random_uuid(), phone text unique not null, whatsapp_id text,
 name text not null, marketing_opt_in boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_drafts (
 token text primary key, request_key text unique not null, request_hash text not null,
 checkout jsonb not null, customer_phone text not null, expires_at timestamptz not null default now()+interval '24 hours',
 consumed_at timestamptz, created_at timestamptz not null default now()
);
create index on public.order_drafts(customer_phone,created_at);
create table public.orders (
 id uuid primary key default gen_random_uuid(), public_order_id text unique not null,
 customer_id uuid not null references public.customers(id), branch text not null,
 fulfilment_type text not null check (fulfilment_type in ('pickup','dine-in','delivery')),
 status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','completed','cancelled')),
 subtotal numeric(12,2), total numeric(12,2), customer_name text not null, customer_phone text not null,
 delivery_address text, customer_notes text, source text not null check(source in ('website','whatsapp')),
 snapshot jsonb not null, draft_token text unique references public.order_drafts(token),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 menu_item_id text not null, item_name_snapshot text not null, variant text not null,
 quantity integer not null check(quantity between 1 and 20), unit_price numeric(12,2), line_total numeric(12,2),
 check(unit_price is null or unit_price>=0), check(line_total is null or line_total=unit_price*quantity)
);
create table public.conversation_sessions (
 phone text primary key, state_payload jsonb not null, version integer not null default 1,
 last_customer_message_at timestamptz not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.reservations (
 id uuid primary key default gen_random_uuid(), public_reservation_id text unique not null,
 customer_id uuid not null references public.customers(id), branch text not null default 'shadnagar',
 reservation_date date not null, reservation_time time not null, party_size integer not null check(party_size between 1 and 50),
 name text not null, phone text not null, notes text, status text not null default 'pending' check(status in ('pending','confirmed','declined','cancelled')),
 created_at timestamptz not null default now()
);
create table public.staff_enquiries (
 id uuid primary key default gen_random_uuid(), phone text not null, details jsonb not null,
 status text not null default 'pending', created_at timestamptz not null default now()
);
create table public.processed_messages (message_id text primary key, phone text not null, created_at timestamptz not null default now());
create table public.whatsapp_outbox (
 id uuid primary key default gen_random_uuid(), message_key text unique not null, phone text not null,
 replies jsonb not null, next_reply integer not null default 0, last_customer_message_at timestamptz,
 status text not null default 'pending' check(status in ('pending','sending','sent','template_required')),
 lease_until timestamptz, attempts integer not null default 0, created_at timestamptz not null default now()
);
create index on public.whatsapp_outbox(status,created_at);

create function public.create_order_draft(p_key text,p_hash text,p_token text,p_checkout jsonb) returns jsonb
language plpgsql set search_path=public as $$
declare existing order_drafts;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_checkout->'customer'->>'phone',0));
 select * into existing from order_drafts where request_key=p_key;
 if found then
   if existing.request_hash<>p_hash or existing.expires_at<now() or existing.consumed_at is not null then return '{"conflict":true}'::jsonb; end if;
   return jsonb_build_object('token',existing.token);
 end if;
 if (select count(*) from order_drafts where customer_phone=p_checkout->'customer'->>'phone' and created_at>now()-interval '1 hour')>=10 then return '{"limited":true}'::jsonb;end if;
 insert into order_drafts(token,request_key,request_hash,checkout,customer_phone) values(p_token,p_key,p_hash,p_checkout,p_checkout->'customer'->>'phone');
 return jsonb_build_object('token',p_token);
end $$;

-- One transaction commits deduplication, optimistic session state, business effects and replies.
create function public.apply_whatsapp_event(p_message_id text,p_phone text,p_version integer,p_session jsonb,p_effect jsonb,p_replies jsonb,p_received_at timestamptz) returns jsonb
language plpgsql set search_path=public as $$
declare current_version integer; last_time timestamptz; customer_uuid uuid; order_uuid uuid; line jsonb; checkout jsonb; draft order_drafts;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_phone,0));
 if exists(select 1 from processed_messages where message_id=p_message_id) then return '{"duplicate":true}'::jsonb;end if;
 select version,last_customer_message_at into current_version,last_time from conversation_sessions where phone=p_phone;
 if coalesce(current_version,0)<>p_version then return '{"retry":true}'::jsonb;end if;
 if last_time is not null and p_received_at<last_time then
   insert into processed_messages values(p_message_id,p_phone,now());return '{"stale":true}'::jsonb;
 end if;
 if p_effect->>'type'='order' then
   checkout:=p_effect->'checkout';
   if p_effect->>'draftToken' is not null then
     select * into draft from order_drafts where token=p_effect->>'draftToken' for update;
     if not found or draft.expires_at<now() or draft.consumed_at is not null or draft.customer_phone<>p_phone then return '{"draftInvalid":true}'::jsonb;end if;
     update order_drafts set consumed_at=now() where token=draft.token;
   end if;
   insert into customers(phone,whatsapp_id,name) values(p_phone,p_phone,checkout->'customer'->>'name') on conflict(phone) do update set name=excluded.name,whatsapp_id=excluded.whatsapp_id,updated_at=now() returning id into customer_uuid;
   insert into orders(public_order_id,customer_id,branch,fulfilment_type,subtotal,total,customer_name,customer_phone,delivery_address,customer_notes,source,snapshot,draft_token)
   values(p_effect->>'reference',customer_uuid,checkout->>'branch',checkout->>'fulfilment',(checkout->>'subtotal')::numeric,(checkout->>'subtotal')::numeric,checkout->'customer'->>'name',p_phone,checkout->'customer'->>'address',checkout->'customer'->>'notes',p_effect->>'source',checkout,p_effect->>'draftToken') returning id into order_uuid;
   for line in select * from jsonb_array_elements(checkout->'lines') loop
     insert into order_items(order_id,menu_item_id,item_name_snapshot,variant,quantity,unit_price,line_total) values(order_uuid,line->>'menuItemId',line->>'name',line->>'size',(line->>'quantity')::integer,(line->>'unitPrice')::numeric,(line->>'lineTotal')::numeric);
   end loop;
 elsif p_effect->>'type'='reservation' then
   insert into customers(phone,whatsapp_id,name) values(p_phone,p_phone,p_effect->'reservation'->>'name') on conflict(phone) do update set name=excluded.name,updated_at=now() returning id into customer_uuid;
   insert into reservations(public_reservation_id,customer_id,reservation_date,reservation_time,party_size,name,phone,notes) values(p_effect->>'reference',customer_uuid,(p_effect->'reservation'->>'date')::date,(p_effect->'reservation'->>'time')::time,(p_effect->'reservation'->>'guests')::integer,p_effect->'reservation'->>'name',p_phone,p_effect->'reservation'->>'notes');
 elsif p_effect->>'type'='handoff' then
   insert into staff_enquiries(phone,details) values(p_phone,p_effect->'details');
 end if;
 insert into conversation_sessions(phone,state_payload,last_customer_message_at) values(p_phone,p_session,p_received_at)
 on conflict(phone) do update set state_payload=excluded.state_payload,version=conversation_sessions.version+1,last_customer_message_at=greatest(conversation_sessions.last_customer_message_at,excluded.last_customer_message_at),updated_at=now();
 insert into processed_messages values(p_message_id,p_phone,now());
 if jsonb_array_length(p_replies)>0 then insert into whatsapp_outbox(message_key,phone,replies,last_customer_message_at) values(p_message_id,p_phone,p_replies,p_received_at);end if;
 return '{"ok":true}'::jsonb;
end $$;

create function public.claim_whatsapp_outbox(p_key text default null) returns setof whatsapp_outbox
language sql set search_path=public as $$
 update whatsapp_outbox set status='sending',lease_until=now()+interval '5 minutes',attempts=attempts+1
 where id in (select id from whatsapp_outbox where (p_key is null or message_key=p_key) and (status='pending' or (status='sending' and lease_until<now())) order by created_at limit 10 for update skip locked)
 returning *;
$$;

create function public.update_order_status(p_id uuid,p_status text) returns jsonb
language plpgsql set search_path=public as $$
declare item orders; last_message timestamptz;
begin
 select * into item from orders where id=p_id for update;
 if not found then return '{"missing":true}'::jsonb;end if;
 if item.status=p_status then return '{"unchanged":true}'::jsonb;end if;
 if not ((item.status='pending' and p_status in ('confirmed','cancelled')) or (item.status='confirmed' and p_status in ('preparing','cancelled')) or (item.status='preparing' and p_status in ('ready','cancelled')) or (item.status='ready' and p_status in ('completed','cancelled'))) then return '{"invalid":true}'::jsonb;end if;
 if item.total is null and p_status='confirmed' then return '{"unpriced":true}'::jsonb;end if;
 update orders set status=p_status,updated_at=now() where id=p_id;
 select last_customer_message_at into last_message from conversation_sessions where phone=item.customer_phone;
 insert into whatsapp_outbox(message_key,phone,replies,last_customer_message_at) values('status:'||p_id||':'||p_status,item.customer_phone,jsonb_build_array(jsonb_build_object('kind','status','reference',item.public_order_id,'status',p_status)),last_message) on conflict(message_key) do nothing;
 return '{"ok":true}'::jsonb;
end $$;

-- No anon/authenticated access, including RPCs. No public RLS policies.
do $$ declare t text; f record; begin
 foreach t in array array['customers','order_drafts','orders','order_items','conversation_sessions','reservations','staff_enquiries','processed_messages','whatsapp_outbox'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant select, insert, update, delete on public.%I to service_role',t);
 end loop;
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('create_order_draft','apply_whatsapp_event','claim_whatsapp_outbox','update_order_status') loop
 execute format('revoke all on function %s from public, anon, authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
