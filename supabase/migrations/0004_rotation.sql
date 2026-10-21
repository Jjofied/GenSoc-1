-- groupme · 0004 · rotation helper
-- Run after 0003. Safe to re-run.
-- The daily job (/api/cron/rotate) works out the new roles with lib/rotation.ts, then calls
-- this function once per project. It saves everything in one transaction.

create or replace function public.apply_rotation(p_project_id uuid, p_rows jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_class uuid;
  v_number int;
begin
  -- Claim the project. If another run got here first, rotated_at is already set: do nothing.
  -- The row lock makes a second, simultaneous run wait and then see it as done.
  update public.projects
     set rotated_at = now(), status = 'active'
   where id = p_project_id and rotated_at is null
  returning class_id, number into v_class, v_number;

  if not found then
    return false;
  end if;

  -- Safety net for the main rule: nobody gets the role they had last project.
  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_rows, '[]'::jsonb)) as r (group_id uuid, student_id uuid, role_id uuid)
    join public.assignments a on a.student_id = r.student_id and a.role_id = r.role_id
    join public.projects p on p.id = a.project_id and p.class_id = v_class and p.number = v_number - 1
  ) then
    raise exception 'Rotation would give someone the same role twice in a row' using errcode = '23514';
  end if;

  -- The previous project is finished once the next one starts.
  update public.projects set status = 'done'
   where class_id = v_class and id <> p_project_id and status = 'active';

  -- Picks or overrides the teacher set before the start are kept.
  insert into public.assignments (class_id, project_id, group_id, student_id, role_id, source)
  select v_class, p_project_id, r.group_id, r.student_id, r.role_id, 'rotated'
  from jsonb_to_recordset(coalesce(p_rows, '[]'::jsonb)) as r (group_id uuid, student_id uuid, role_id uuid)
  on conflict (project_id, student_id) do nothing;

  return true;
end;
$$;

-- Only the server (secret key) may run it.
revoke all on function public.apply_rotation(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.apply_rotation(uuid, jsonb) to service_role;
