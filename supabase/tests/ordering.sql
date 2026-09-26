-- Run after migration in a disposable/test Supabase project. All fixture writes roll back.
begin;
do $$
declare checkout jsonb; result jsonb; v_token text:='MI-DRAFT-00000000000000000000000000000000'; msg text:='mozza-sql-smoke-message';
begin
 checkout:='{"branch":"shadnagar","fulfilment":"pickup","customer":{"name":"SQL smoke test","phone":"919876543210"},"items":[{"menuItemId":"margarita","variant":0,"quantity":1}],"lines":[{"menuItemId":"margarita","name":"Margarita","size":"Regular 7 inch","variant":0,"quantity":1,"unitPrice":200,"lineTotal":200}],"subtotal":200}'::jsonb;
 result:=public.create_order_draft('smoke-key','smoke-hash',v_token,checkout);
 assert result->>'token'=v_token,'draft creation failed';
 result:=public.create_order_draft('smoke-key','smoke-hash','different-token',checkout);
 assert result->>'token'=v_token,'draft retry duplicated';
 result:=public.create_order_draft('smoke-key','changed-hash',v_token,checkout);
 assert (result->>'conflict')::boolean,'changed checkout key accepted';
 result:=public.apply_whatsapp_event(msg,'919876543210',0,'{"state":"ORDER_CREATED","cart":{"items":[],"branch":"shadnagar"}}'::jsonb,jsonb_build_object('type','order','checkout',checkout,'source','website','draftToken',v_token,'reference','MI-SQL-SMOKE'),'[{"kind":"text","text":"Received"}]'::jsonb,now());
 assert (result->>'ok')::boolean,'order transaction failed';
 result:=public.apply_whatsapp_event(msg,'919876543210',0,'{}'::jsonb,null,'[]'::jsonb,now());
 assert (result->>'duplicate')::boolean,'duplicate webhook not detected';
 assert (select count(*) from public.orders where public_order_id='MI-SQL-SMOKE')=1,'duplicate order';
 assert (select count(*) from public.order_items i join public.orders o on o.id=i.order_id where o.public_order_id='MI-SQL-SMOKE')=1,'missing snapshot';
 assert (select consumed_at is not null from public.order_drafts where token=v_token),'draft not consumed';
 assert not has_table_privilege('anon','public.orders','SELECT'),'anonymous orders access';
 assert not has_function_privilege('anon','public.create_order_draft(text,text,text,jsonb)','EXECUTE'),'anonymous RPC access';
end $$;
rollback;
