-- groupme · 0001 · tables
-- Paste into Supabase → SQL Editor → Run. Safe to re-run (creates only what's missing).
-- Matches lib/types.ts. There is deliberately NO gender column anywhere.

-- People. One row per Supabase auth user, created by the sign-up trigger in 0002.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 120),
  -- "admin" is shown as "Teacher". Picked at sign-up for now; later: faculty email → admin,
  -- student number → student (add columns + trigger logic then; nothing here blocks it).
  user_type text not null check (user_type in ('admin', 'student')),
  -- Full access to everything. Only ever set in SQL (see supabase/dev-access.sql).
  is_dev boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  section text not null default '',
  term text not null default '',
  invite_code text not null unique check (invite_code ~ '^[A-Z0-9]{6}$'),
  admin_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, profile_id)
);

-- Group roles, per class. Removing a role archives it so past history still reads correctly.
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  icon text not null default '●',
  focus text not null default '',
  tasks text[] not null default '{}',
  archived boolean not null default false,
  sort_order int not null default 0,
  unique (id, class_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  number int not null check (number > 0),
  name text not null check (char_length(trim(name)) between 1 and 120),
  start_date date not null,
  due_date date not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'done')),
  -- Set once by the rotation job when the project starts. Null = not started/rotated yet.
  rotated_at timestamptz,
  check (due_date >= start_date),
  unique (class_id, number),
  unique (id, class_id)
);

-- "Tables" in the UI.
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  allow_shared_roles boolean not null default true,
  sort_order int not null default 0,
  unique (id, class_id)
);

create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null,
  group_id uuid not null,
  seat_index int not null check (seat_index >= 0),
  student_id uuid references public.profiles (id) on delete set null,
  foreign key (group_id, class_id) references public.groups (id, class_id) on delete cascade,
  unique (group_id, seat_index),
  -- One seat per student per class.
  unique (class_id, student_id)
);

-- One student's role in one project = role history.
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null,
  project_id uuid not null,
  -- Kept as history if the table is later removed.
  group_id uuid,
  student_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null,
  source text not null check (source in ('chosen', 'rotated', 'override')),
  override_reason text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, class_id) references public.projects (id, class_id) on delete cascade,
  foreign key (group_id, class_id) references public.groups (id, class_id) on delete set null (group_id),
  foreign key (role_id, class_id) references public.roles (id, class_id) on delete restrict,
  unique (project_id, student_id),
  constraint override_needs_reason
    check (source <> 'override' or char_length(trim(coalesce(override_reason, ''))) > 0)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  type text not null check (type in ('announcement', 'file', 'meeting', 'deadline')),
  title text not null check (char_length(trim(title)) between 1 and 200),
  body text not null default '',
  posted_at timestamptz not null default now(),
  -- File name + size for now; a Storage path comes with step 8 (files).
  attachment_name text,
  attachment_size text,
  date_time timestamptz,
  location text,
  check (type not in ('meeting', 'deadline') or date_time is not null)
);

-- Calendar. Meetings and deadlines come from posts; project starts can be listed here too.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  type text not null check (type in ('meeting', 'deadline', 'project-start')),
  title text not null check (char_length(trim(title)) between 1 and 200),
  start_at timestamptz not null,
  location text,
  post_id uuid references public.posts (id) on delete cascade
);

-- Indexes for the access-rule lookups and common screens.
create index if not exists class_members_profile_idx on public.class_members (profile_id);
create index if not exists classes_admin_idx on public.classes (admin_id);
create index if not exists roles_class_idx on public.roles (class_id);
create index if not exists projects_class_idx on public.projects (class_id);
create index if not exists projects_due_rotation_idx on public.projects (start_date) where rotated_at is null;
create index if not exists groups_class_idx on public.groups (class_id);
create index if not exists seats_class_idx on public.seats (class_id);
create index if not exists seats_student_idx on public.seats (student_id);
create index if not exists assignments_class_idx on public.assignments (class_id);
create index if not exists assignments_student_idx on public.assignments (student_id);
create index if not exists posts_class_idx on public.posts (class_id, posted_at desc);
create index if not exists events_class_idx on public.events (class_id, start_at);
