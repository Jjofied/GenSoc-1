-- groupme · 0003 · access rules (Row Level Security)
-- Run after 0002. Safe to re-run (each policy is dropped and recreated).
--
-- Students: read their own classes (groups, members, posts, events, role history).
--           Write only their own seat while no project is running, and their own Project 1 pick.
-- Teachers: manage the classes they own.
-- Dev:      everything (profiles.is_dev, set in SQL only).
-- Anonymous visitors: nothing.

alter table public.profiles      enable row level security;
alter table public.classes       enable row level security;
alter table public.class_members enable row level security;
alter table public.roles         enable row level security;
alter table public.projects      enable row level security;
alter table public.groups        enable row level security;
alter table public.seats         enable row level security;
alter table public.assignments   enable row level security;
alter table public.posts         enable row level security;
alter table public.events        enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
drop policy if exists "profiles: see people you share a class with" on public.profiles;
create policy "profiles: see people you share a class with" on public.profiles
  for select to authenticated
  using (public.is_dev() or public.shares_class_with(id));

-- Only the name column is updatable (see 0002), and the trigger blocks type/dev changes.
drop policy if exists "profiles: edit your own" on public.profiles;
create policy "profiles: edit your own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or public.is_dev())
  with check (id = (select auth.uid()) or public.is_dev());

-- ── classes ─────────────────────────────────────────────────────────────────
-- No "list every class" for students: they only see classes they're in. Joining uses join_class_by_code().
drop policy if exists "classes: see your classes" on public.classes;
create policy "classes: see your classes" on public.classes
  for select to authenticated
  using (public.can_view_class(id));

drop policy if exists "classes: teachers create their own" on public.classes;
create policy "classes: teachers create their own" on public.classes
  for insert to authenticated
  with check (
    public.is_dev()
    or (admin_id = (select auth.uid())
        and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.user_type = 'admin'))
  );

drop policy if exists "classes: teachers edit their own" on public.classes;
create policy "classes: teachers edit their own" on public.classes
  for update to authenticated
  using (public.can_manage_class(id))
  with check (public.is_dev() or admin_id = (select auth.uid()));

drop policy if exists "classes: teachers delete their own" on public.classes;
create policy "classes: teachers delete their own" on public.classes
  for delete to authenticated
  using (public.can_manage_class(id));

-- ── class_members ───────────────────────────────────────────────────────────
drop policy if exists "class_members: see classmates" on public.class_members;
create policy "class_members: see classmates" on public.class_members
  for select to authenticated
  using (public.can_view_class(class_id));

drop policy if exists "class_members: teacher adds" on public.class_members;
create policy "class_members: teacher adds" on public.class_members
  for insert to authenticated
  with check (public.can_manage_class(class_id));

drop policy if exists "class_members: teacher removes, or you leave" on public.class_members;
create policy "class_members: teacher removes, or you leave" on public.class_members
  for delete to authenticated
  using (public.can_manage_class(class_id) or profile_id = (select auth.uid()));

-- ── Class content the teacher manages and members read ──────────────────────
-- roles, projects, groups, posts, events: same rule set.
do $$
declare
  t text;
begin
  foreach t in array array['roles', 'projects', 'groups', 'posts', 'events'] loop
    execute format('drop policy if exists "%1$s: class can read" on public.%1$I', t);
    execute format(
      'create policy "%1$s: class can read" on public.%1$I for select to authenticated using (public.can_view_class(class_id))', t);
    execute format('drop policy if exists "%1$s: teacher manages" on public.%1$I', t);
    execute format(
      'create policy "%1$s: teacher manages" on public.%1$I for all to authenticated '
      'using (public.can_manage_class(class_id)) with check (public.can_manage_class(class_id))', t);
  end loop;
end;
$$;

-- ── seats ───────────────────────────────────────────────────────────────────
drop policy if exists "seats: class can read" on public.seats;
create policy "seats: class can read" on public.seats
  for select to authenticated
  using (public.can_view_class(class_id));

drop policy if exists "seats: teacher manages" on public.seats;
create policy "seats: teacher manages" on public.seats
  for all to authenticated
  using (public.can_manage_class(class_id))
  with check (public.can_manage_class(class_id));

-- Sit in an empty seat, or leave your own, while no project is running.
-- Only student_id is updatable (column grant in 0002).
drop policy if exists "seats: students take or leave their own seat" on public.seats;
create policy "seats: students take or leave their own seat" on public.seats
  for update to authenticated
  using (
    public.is_class_member(class_id)
    and not public.groups_locked(class_id)
    and (student_id is null or student_id = (select auth.uid()))
  )
  with check (
    public.is_class_member(class_id)
    and not public.groups_locked(class_id)
    and (student_id is null or student_id = (select auth.uid()))
  );

-- ── assignments (role history) ──────────────────────────────────────────────
drop policy if exists "assignments: class can read" on public.assignments;
create policy "assignments: class can read" on public.assignments
  for select to authenticated
  using (public.can_view_class(class_id));

-- Teachers set, rotate and override. The table itself requires a reason for overrides.
drop policy if exists "assignments: teacher manages" on public.assignments;
create policy "assignments: teacher manages" on public.assignments
  for all to authenticated
  using (public.can_manage_class(class_id))
  with check (public.can_manage_class(class_id));

-- A student picks their own role for Project 1, before it starts, for the table they sit at.
drop policy if exists "assignments: students pick their Project 1 role" on public.assignments;
create policy "assignments: students pick their Project 1 role" on public.assignments
  for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and source = 'chosen'
    and override_reason is null
    and public.is_class_member(class_id)
    and exists (select 1 from public.projects p
                where p.id = project_id and p.number = 1 and p.status = 'upcoming')
    and exists (select 1 from public.seats s
                where s.class_id = assignments.class_id and s.group_id = assignments.group_id
                  and s.student_id = (select auth.uid()))
  );

drop policy if exists "assignments: students change their Project 1 pick" on public.assignments;
create policy "assignments: students change their Project 1 pick" on public.assignments
  for update to authenticated
  using (
    student_id = (select auth.uid())
    and source = 'chosen'
    and exists (select 1 from public.projects p
                where p.id = project_id and p.number = 1 and p.status = 'upcoming')
  )
  with check (
    student_id = (select auth.uid())
    and source = 'chosen'
    and override_reason is null
    and exists (select 1 from public.projects p
                where p.id = project_id and p.number = 1 and p.status = 'upcoming')
    and exists (select 1 from public.seats s
                where s.class_id = assignments.class_id and s.group_id = assignments.group_id
                  and s.student_id = (select auth.uid()))
  );
