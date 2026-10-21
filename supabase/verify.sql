-- groupme · verify
-- Paste into Supabase → SQL Editor → Run after the migrations (and seed). Every row should say "ok".

with expected_tables (t) as (
  values ('profiles'), ('classes'), ('class_members'), ('roles'), ('projects'),
         ('groups'), ('seats'), ('assignments'), ('posts'), ('events')
),
expected_functions (f) as (
  values ('is_dev'), ('is_class_admin'), ('is_class_member'), ('can_view_class'), ('can_manage_class'),
         ('groups_locked'), ('shares_class_with'), ('handle_new_user'), ('protect_profile_fields'),
         ('join_class_by_code'), ('generate_invite_code'), ('apply_rotation')
),
checks (sort, item, result) as (
  select 1, 'table: ' || t,
         case when to_regclass('public.' || t) is not null then 'ok' else 'missing' end
  from expected_tables
  union all
  select 2, 'access rules (RLS) on: ' || t,
         case when coalesce((select c.relrowsecurity from pg_class c where c.oid = to_regclass('public.' || t)), false)
              then 'ok' else 'missing' end
  from expected_tables
  union all
  select 3, 'policies on: ' || t,
         case when exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = t)
              then 'ok' else 'missing' end
  from expected_tables
  union all
  select 4, 'function: ' || f,
         case when exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                           where n.nspname = 'public' and p.proname = f)
              then 'ok' else 'missing' end
  from expected_functions
  union all
  select 5, 'no gender column anywhere',
         coalesce((select 'FOUND: ' || string_agg(table_name || '.' || column_name, ', ')
                   from information_schema.columns
                   where table_schema in ('public', 'auth') and column_name ilike '%gender%'), 'ok')
  union all
  select 6, 'sign-up trigger creates profiles',
         case when exists (select 1 from pg_trigger where tgname = 'on_auth_user_created' and not tgisinternal)
              then 'ok' else 'missing' end
  union all
  select 7, 'users can''t change their own user_type / is_dev',
         case when exists (select 1 from pg_trigger where tgname = 'protect_profile_fields' and not tgisinternal)
                   and not has_column_privilege('authenticated', 'public.profiles', 'user_type', 'UPDATE')
                   and not has_column_privilege('authenticated', 'public.profiles', 'is_dev', 'UPDATE')
              then 'ok' else 'missing' end
  union all
  select 8, 'rotation can only be run by the server',
         case when to_regprocedure('public.apply_rotation(uuid, jsonb)') is null then 'missing'
              when has_function_privilege('authenticated', 'public.apply_rotation(uuid, jsonb)', 'EXECUTE')
                or has_function_privilege('anon', 'public.apply_rotation(uuid, jsonb)', 'EXECUTE') then 'missing'
              else 'ok' end
  union all
  select 9, 'dummy data loaded (seed.sql)',
         case when exists (select 1 from public.classes where invite_code = 'K7Q2MX') then 'ok' else 'missing' end
  union all
  select 10, 'dev account set (dev-access.sql)',
         case when exists (select 1 from public.profiles where is_dev) then 'ok' else 'missing' end
)
select item as "check", result from checks order by sort, item;
