-- groupme · 0002 · helper functions + triggers
-- Run after 0001. Safe to re-run.
-- Helpers are SECURITY DEFINER with an empty search_path so access rules can call them
-- without recursion, and nobody can hijack them with their own objects.

-- ── Access helpers ──────────────────────────────────────────────────────────

create or replace function public.is_dev()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_dev from public.profiles p where p.id = (select auth.uid())), false);
$$;

create or replace function public.is_class_admin(p_class_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.classes c where c.id = p_class_id and c.admin_id = (select auth.uid())
  );
$$;

create or replace function public.is_class_member(p_class_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.class_members m where m.class_id = p_class_id and m.profile_id = (select auth.uid())
  );
$$;

-- Can see a class at all: dev, its teacher, or a member.
create or replace function public.can_view_class(p_class_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_dev() or public.is_class_admin(p_class_id) or public.is_class_member(p_class_id);
$$;

-- Can change a class's setup and content: dev or its teacher.
create or replace function public.can_manage_class(p_class_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_dev() or public.is_class_admin(p_class_id);
$$;

-- Group switching closes while a project is running (D08).
create or replace function public.groups_locked(p_class_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.projects p where p.class_id = p_class_id and p.status = 'active');
$$;

-- True if I can see this person: it's me, or we share a class (as member or teacher).
create or replace function public.shares_class_with(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select p_profile_id = (select auth.uid()) or exists (
    select 1 from public.classes c
    where (c.admin_id = p_profile_id
           or exists (select 1 from public.class_members m where m.class_id = c.id and m.profile_id = p_profile_id))
      and (c.admin_id = (select auth.uid())
           or exists (select 1 from public.class_members m where m.class_id = c.id and m.profile_id = (select auth.uid())))
  );
$$;

-- ── Sign-up: create the profile ─────────────────────────────────────────────
-- The sign-up form sends { name, user_type } as user metadata. is_dev is never read from it.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_type text := coalesce(new.raw_user_meta_data ->> 'user_type', 'student');
begin
  if v_type not in ('admin', 'student') then
    v_type := 'student';
  end if;
  -- Later: decide v_type from a faculty email domain or a student number here.
  insert into public.profiles (id, name, user_type)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(new.email, ''), '@', 1)),
    v_type
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Users can't change their own type or dev flag ───────────────────────────
-- App users (JWT role authenticated/anon) are blocked. The SQL Editor and the server's
-- secret key can still change them on purpose.

create or replace function public.protect_profile_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (new.user_type is distinct from old.user_type or new.is_dev is distinct from old.is_dev)
     and coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    raise exception 'user_type and is_dev can only be changed in SQL by an administrator'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- App users may only edit their display name (column-level, on top of the trigger).
revoke update on public.profiles from anon, authenticated;
grant update (name) on public.profiles to authenticated;

-- ── Seats: only the student column changes after setup ──────────────────────
revoke update on public.seats from anon, authenticated;
grant update (student_id) on public.seats to authenticated;

-- ── Keep assignments.updated_at fresh ───────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists assignments_touch on public.assignments;
create trigger assignments_touch
  before update on public.assignments
  for each row execute function public.touch_updated_at();

-- ── Invite codes ────────────────────────────────────────────────────────────
-- 6 characters, no 0/O or 1/I so they read well off a projector.
create or replace function public.generate_invite_code()
returns text language sql volatile set search_path = '' as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1), '')
  from generate_series(1, 6);
$$;

alter table public.classes alter column invite_code set default public.generate_invite_code();

-- Join a class by code. Students can't list classes, so this is the only way in.
-- Returns { class_id, class_name, already_member }, or null when the code didn't work.
create or replace function public.join_class_by_code(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_class_id uuid;
  v_class_name text;
  v_added int;
begin
  if v_uid is null then
    raise exception 'Sign in first' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles p where p.id = v_uid and p.user_type = 'student') then
    raise exception 'Only students join with a code' using errcode = '42501';
  end if;

  select c.id, c.name into v_class_id, v_class_name
  from public.classes c
  where c.invite_code = upper(trim(coalesce(p_code, '')));
  if v_class_id is null then
    return null;
  end if;

  insert into public.class_members (class_id, profile_id)
  values (v_class_id, v_uid)
  on conflict do nothing;
  get diagnostics v_added = row_count;

  return jsonb_build_object('class_id', v_class_id, 'class_name', v_class_name, 'already_member', v_added = 0);
end;
$$;

-- Who can call what. Helpers are for signed-in users; nothing here is for anonymous visitors.
revoke all on function public.is_dev() from public, anon;
revoke all on function public.is_class_admin(uuid) from public, anon;
revoke all on function public.is_class_member(uuid) from public, anon;
revoke all on function public.can_view_class(uuid) from public, anon;
revoke all on function public.can_manage_class(uuid) from public, anon;
revoke all on function public.groups_locked(uuid) from public, anon;
revoke all on function public.shares_class_with(uuid) from public, anon;
revoke all on function public.join_class_by_code(text) from public, anon;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.is_dev() to authenticated;
grant execute on function public.is_class_admin(uuid) to authenticated;
grant execute on function public.is_class_member(uuid) to authenticated;
grant execute on function public.can_view_class(uuid) to authenticated;
grant execute on function public.can_manage_class(uuid) to authenticated;
grant execute on function public.groups_locked(uuid) to authenticated;
grant execute on function public.shares_class_with(uuid) to authenticated;
grant execute on function public.join_class_by_code(text) to authenticated;
