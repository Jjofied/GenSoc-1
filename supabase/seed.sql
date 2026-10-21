-- groupme · seed · DUMMY DATA ONLY (generated from lib/mock-data.ts — edit that, then run `npm run db:seed`)
-- CS 3A – Software Engineering: Prof. Kim, 27 students, 5 tables, Project 2 of 6 running.
-- Paste into Supabase → SQL Editor → Run, after migrations 0001–0004. Safe to re-run.
-- The dummy people are auth users with no password, so nobody can sign in as them.

begin;

-- People (the sign-up trigger also creates their profiles)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change) values
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:t1')::uuid, 'authenticated', 'authenticated', 'kim@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Prof. Kim', 'user_type', 'admin'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-taylork')::uuid, 'authenticated', 'authenticated', 'taylork@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Taylor K.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-jamies')::uuid, 'authenticated', 'authenticated', 'jamies@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Jamie S.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-averyb')::uuid, 'authenticated', 'authenticated', 'averyb@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Avery B.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-quinnh')::uuid, 'authenticated', 'authenticated', 'quinnh@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Quinn H.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-rowanf')::uuid, 'authenticated', 'authenticated', 'rowanf@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Rowan F.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-skylern')::uuid, 'authenticated', 'authenticated', 'skylern@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Skyler N.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-drewc')::uuid, 'authenticated', 'authenticated', 'drewc@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Drew C.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-reesew')::uuid, 'authenticated', 'authenticated', 'reesew@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Reese W.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-parkerj')::uuid, 'authenticated', 'authenticated', 'parkerj@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Parker J.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-emersong')::uuid, 'authenticated', 'authenticated', 'emersong@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Emerson G.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-haydenv')::uuid, 'authenticated', 'authenticated', 'haydenv@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Hayden V.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-alexr')::uuid, 'authenticated', 'authenticated', 'alexr@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Alex R.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-samt')::uuid, 'authenticated', 'authenticated', 'samt@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Sam T.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-jordanl')::uuid, 'authenticated', 'authenticated', 'jordanl@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Jordan L.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-caseym')::uuid, 'authenticated', 'authenticated', 'caseym@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Casey M.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-rileyp')::uuid, 'authenticated', 'authenticated', 'rileyp@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Riley P.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-morgand')::uuid, 'authenticated', 'authenticated', 'morgand@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Morgan D.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-kaio')::uuid, 'authenticated', 'authenticated', 'kaio@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Kai O.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-logane')::uuid, 'authenticated', 'authenticated', 'logane@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Logan E.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-sagey')::uuid, 'authenticated', 'authenticated', 'sagey@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Sage Y.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-dakotai')::uuid, 'authenticated', 'authenticated', 'dakotai@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Dakota I.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-finleyu')::uuid, 'authenticated', 'authenticated', 'finleyu@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Finley U.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-remya')::uuid, 'authenticated', 'authenticated', 'remya@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Remy A.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-charliez')::uuid, 'authenticated', 'authenticated', 'charliez@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Charlie Z.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-jesseq')::uuid, 'authenticated', 'authenticated', 'jesseq@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Jesse Q.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-ellisn')::uuid, 'authenticated', 'authenticated', 'ellisn@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Ellis N.', 'user_type', 'student'), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', md5('groupme-seed:s-robint')::uuid, 'authenticated', 'authenticated', 'robint@school.example.edu', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', 'Robin T.', 'user_type', 'student'), now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into public.profiles (id, name, user_type) values
  (md5('groupme-seed:t1')::uuid, 'Prof. Kim', 'admin'),
  (md5('groupme-seed:s-taylork')::uuid, 'Taylor K.', 'student'),
  (md5('groupme-seed:s-jamies')::uuid, 'Jamie S.', 'student'),
  (md5('groupme-seed:s-averyb')::uuid, 'Avery B.', 'student'),
  (md5('groupme-seed:s-quinnh')::uuid, 'Quinn H.', 'student'),
  (md5('groupme-seed:s-rowanf')::uuid, 'Rowan F.', 'student'),
  (md5('groupme-seed:s-skylern')::uuid, 'Skyler N.', 'student'),
  (md5('groupme-seed:s-drewc')::uuid, 'Drew C.', 'student'),
  (md5('groupme-seed:s-reesew')::uuid, 'Reese W.', 'student'),
  (md5('groupme-seed:s-parkerj')::uuid, 'Parker J.', 'student'),
  (md5('groupme-seed:s-emersong')::uuid, 'Emerson G.', 'student'),
  (md5('groupme-seed:s-haydenv')::uuid, 'Hayden V.', 'student'),
  (md5('groupme-seed:s-alexr')::uuid, 'Alex R.', 'student'),
  (md5('groupme-seed:s-samt')::uuid, 'Sam T.', 'student'),
  (md5('groupme-seed:s-jordanl')::uuid, 'Jordan L.', 'student'),
  (md5('groupme-seed:s-caseym')::uuid, 'Casey M.', 'student'),
  (md5('groupme-seed:s-rileyp')::uuid, 'Riley P.', 'student'),
  (md5('groupme-seed:s-morgand')::uuid, 'Morgan D.', 'student'),
  (md5('groupme-seed:s-kaio')::uuid, 'Kai O.', 'student'),
  (md5('groupme-seed:s-logane')::uuid, 'Logan E.', 'student'),
  (md5('groupme-seed:s-sagey')::uuid, 'Sage Y.', 'student'),
  (md5('groupme-seed:s-dakotai')::uuid, 'Dakota I.', 'student'),
  (md5('groupme-seed:s-finleyu')::uuid, 'Finley U.', 'student'),
  (md5('groupme-seed:s-remya')::uuid, 'Remy A.', 'student'),
  (md5('groupme-seed:s-charliez')::uuid, 'Charlie Z.', 'student'),
  (md5('groupme-seed:s-jesseq')::uuid, 'Jesse Q.', 'student'),
  (md5('groupme-seed:s-ellisn')::uuid, 'Ellis N.', 'student'),
  (md5('groupme-seed:s-robint')::uuid, 'Robin T.', 'student')
on conflict (id) do update set name = excluded.name, user_type = excluded.user_type;

-- Class
insert into public.classes (id, name, section, term, invite_code, admin_id) values
  (md5('groupme-seed:c1:class')::uuid, 'CS 3A – Software Engineering', '3A', '1st Sem AY 2026–27', 'K7Q2MX', md5('groupme-seed:t1')::uuid)
on conflict (id) do nothing;

insert into public.class_members (class_id, profile_id) values
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-taylork')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-jamies')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-averyb')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-quinnh')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-rowanf')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-skylern')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-drewc')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-reesew')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-parkerj')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-emersong')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-haydenv')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-alexr')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-samt')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-jordanl')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-caseym')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-rileyp')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-morgand')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-kaio')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-logane')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-sagey')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-dakotai')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-finleyu')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-remya')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-charliez')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-jesseq')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-ellisn')::uuid),
  (md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:s-robint')::uuid)
on conflict (class_id, profile_id) do nothing;

-- Roles
insert into public.roles (id, class_id, name, icon, focus, tasks, sort_order) values
  (md5('groupme-seed:c1:r-lead')::uuid, md5('groupme-seed:c1:class')::uuid, 'Team Leader', '★', 'Plans, assigns, keeps the group on track', array['Split the work and set weekly goals', 'Run the check-in meetings', 'Flag blockers to the teacher early']::text[], 0),
  (md5('groupme-seed:c1:r-prog')::uuid, md5('groupme-seed:c1:class')::uuid, 'Lead Programmer', '</>', 'Builds the main code', array['Set up the repo and code structure', 'Build the core features', 'Review teammates'' code']::text[], 1),
  (md5('groupme-seed:c1:r-design')::uuid, md5('groupme-seed:c1:class')::uuid, 'System Designer', '◫', 'Plans screens, flow, structure', array['Sketch the screens and user flow', 'Plan the data and structure', 'Keep the design consistent']::text[], 2),
  (md5('groupme-seed:c1:r-test')::uuid, md5('groupme-seed:c1:class')::uuid, 'Debugger & Tester', '✓', 'Finds and reports bugs, checks it works', array['Write test cases for each feature', 'Log bugs and check fixes', 'Full test pass before the demo']::text[], 3),
  (md5('groupme-seed:c1:r-docs')::uuid, md5('groupme-seed:c1:class')::uuid, 'Documenter', '¶', 'Writes docs, notes, reports', array['Take notes at every check-in', 'Write the user guide and report', 'Keep the docs in sync with the code']::text[], 4),
  (md5('groupme-seed:c1:r-present')::uuid, md5('groupme-seed:c1:class')::uuid, 'Presenter', '▶', 'Presents the work to class', array['Build the demo script and slides', 'Rehearse with the group', 'Present on demo day']::text[], 5)
on conflict (id) do nothing;

-- Projects (1 done, 2 running, 3–6 upcoming)
insert into public.projects (id, class_id, number, name, start_date, due_date, status, rotated_at) values
  (md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:class')::uuid, 1, 'Library System', '2026-08-17', '2026-10-02', 'done', '2026-08-17 00:05+08'),
  (md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:class')::uuid, 2, 'Clinic Booking App', '2026-10-05', '2026-10-30', 'active', '2026-10-05 00:05+08'),
  (md5('groupme-seed:c1:p3')::uuid, md5('groupme-seed:c1:class')::uuid, 3, 'Inventory API', '2026-11-16', '2026-12-11', 'upcoming', null),
  (md5('groupme-seed:c1:p4')::uuid, md5('groupme-seed:c1:class')::uuid, 4, 'Event Ticketing', '2027-01-11', '2027-02-05', 'upcoming', null),
  (md5('groupme-seed:c1:p5')::uuid, md5('groupme-seed:c1:class')::uuid, 5, 'Study Planner', '2027-02-15', '2027-03-12', 'upcoming', null),
  (md5('groupme-seed:c1:p6')::uuid, md5('groupme-seed:c1:class')::uuid, 6, 'Final Showcase', '2027-03-22', '2027-04-23', 'upcoming', null)
on conflict (id) do nothing;

-- Tables and seats
insert into public.groups (id, class_id, name, allow_shared_roles, sort_order) values
  (md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:c1:class')::uuid, 'Table 1', true, 0),
  (md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:c1:class')::uuid, 'Table 2', true, 1),
  (md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:c1:class')::uuid, 'Table 3', true, 2),
  (md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:c1:class')::uuid, 'Table 4', true, 3),
  (md5('groupme-seed:c1:g5')::uuid, md5('groupme-seed:c1:class')::uuid, 'Table 5', true, 4)
on conflict (id) do nothing;

insert into public.seats (id, class_id, group_id, seat_index, student_id) values
  (md5('groupme-seed:c1:g1:seat0')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g1')::uuid, 0, md5('groupme-seed:s-taylork')::uuid),
  (md5('groupme-seed:c1:g1:seat1')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g1')::uuid, 1, md5('groupme-seed:s-jamies')::uuid),
  (md5('groupme-seed:c1:g1:seat2')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g1')::uuid, 2, md5('groupme-seed:s-averyb')::uuid),
  (md5('groupme-seed:c1:g1:seat3')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g1')::uuid, 3, md5('groupme-seed:s-quinnh')::uuid),
  (md5('groupme-seed:c1:g1:seat4')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g1')::uuid, 4, md5('groupme-seed:s-rowanf')::uuid),
  (md5('groupme-seed:c1:g1:seat5')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g1')::uuid, 5, md5('groupme-seed:s-skylern')::uuid),
  (md5('groupme-seed:c1:g2:seat0')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g2')::uuid, 0, md5('groupme-seed:s-drewc')::uuid),
  (md5('groupme-seed:c1:g2:seat1')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g2')::uuid, 1, md5('groupme-seed:s-reesew')::uuid),
  (md5('groupme-seed:c1:g2:seat2')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g2')::uuid, 2, md5('groupme-seed:s-parkerj')::uuid),
  (md5('groupme-seed:c1:g2:seat3')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g2')::uuid, 3, md5('groupme-seed:s-emersong')::uuid),
  (md5('groupme-seed:c1:g2:seat4')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g2')::uuid, 4, md5('groupme-seed:s-haydenv')::uuid),
  (md5('groupme-seed:c1:g2:seat5')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g2')::uuid, 5, null),
  (md5('groupme-seed:c1:g3:seat0')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g3')::uuid, 0, md5('groupme-seed:s-alexr')::uuid),
  (md5('groupme-seed:c1:g3:seat1')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g3')::uuid, 1, md5('groupme-seed:s-samt')::uuid),
  (md5('groupme-seed:c1:g3:seat2')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g3')::uuid, 2, md5('groupme-seed:s-jordanl')::uuid),
  (md5('groupme-seed:c1:g3:seat3')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g3')::uuid, 3, md5('groupme-seed:s-caseym')::uuid),
  (md5('groupme-seed:c1:g3:seat4')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g3')::uuid, 4, md5('groupme-seed:s-rileyp')::uuid),
  (md5('groupme-seed:c1:g3:seat5')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g3')::uuid, 5, md5('groupme-seed:s-morgand')::uuid),
  (md5('groupme-seed:c1:g4:seat0')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g4')::uuid, 0, md5('groupme-seed:s-kaio')::uuid),
  (md5('groupme-seed:c1:g4:seat1')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g4')::uuid, 1, md5('groupme-seed:s-logane')::uuid),
  (md5('groupme-seed:c1:g4:seat2')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g4')::uuid, 2, md5('groupme-seed:s-sagey')::uuid),
  (md5('groupme-seed:c1:g4:seat3')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g4')::uuid, 3, md5('groupme-seed:s-dakotai')::uuid),
  (md5('groupme-seed:c1:g4:seat4')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g4')::uuid, 4, md5('groupme-seed:s-finleyu')::uuid),
  (md5('groupme-seed:c1:g4:seat5')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g4')::uuid, 5, md5('groupme-seed:s-remya')::uuid),
  (md5('groupme-seed:c1:g5:seat0')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g5')::uuid, 0, md5('groupme-seed:s-charliez')::uuid),
  (md5('groupme-seed:c1:g5:seat1')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g5')::uuid, 1, md5('groupme-seed:s-jesseq')::uuid),
  (md5('groupme-seed:c1:g5:seat2')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g5')::uuid, 2, md5('groupme-seed:s-ellisn')::uuid),
  (md5('groupme-seed:c1:g5:seat3')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g5')::uuid, 3, md5('groupme-seed:s-robint')::uuid),
  (md5('groupme-seed:c1:g5:seat4')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g5')::uuid, 4, null),
  (md5('groupme-seed:c1:g5:seat5')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:g5')::uuid, 5, null)
on conflict (id) do nothing;

-- Role history (Project 1 chosen, Project 2 rotated, with two teacher overrides)
insert into public.assignments (id, class_id, project_id, group_id, student_id, role_id, source, override_reason) values
  (md5('groupme-seed:c1:p1:s-taylork')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-taylork')::uuid, md5('groupme-seed:c1:r-docs')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-jamies')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-jamies')::uuid, md5('groupme-seed:c1:r-present')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-averyb')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-averyb')::uuid, md5('groupme-seed:c1:r-lead')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-quinnh')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-quinnh')::uuid, md5('groupme-seed:c1:r-prog')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-rowanf')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-rowanf')::uuid, md5('groupme-seed:c1:r-design')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-skylern')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-skylern')::uuid, md5('groupme-seed:c1:r-test')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p2:s-taylork')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-taylork')::uuid, md5('groupme-seed:c1:r-prog')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-jamies')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-jamies')::uuid, md5('groupme-seed:c1:r-design')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-averyb')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-averyb')::uuid, md5('groupme-seed:c1:r-test')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-quinnh')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-quinnh')::uuid, md5('groupme-seed:c1:r-docs')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-rowanf')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-rowanf')::uuid, md5('groupme-seed:c1:r-present')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-skylern')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g1')::uuid, md5('groupme-seed:s-skylern')::uuid, md5('groupme-seed:c1:r-lead')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p1:s-drewc')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:s-drewc')::uuid, md5('groupme-seed:c1:r-present')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-reesew')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:s-reesew')::uuid, md5('groupme-seed:c1:r-lead')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-parkerj')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:s-parkerj')::uuid, md5('groupme-seed:c1:r-prog')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-emersong')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:s-emersong')::uuid, md5('groupme-seed:c1:r-design')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-haydenv')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:s-haydenv')::uuid, md5('groupme-seed:c1:r-test')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p2:s-drewc')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:s-drewc')::uuid, md5('groupme-seed:c1:r-design')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-reesew')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:s-reesew')::uuid, md5('groupme-seed:c1:r-test')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-parkerj')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:s-parkerj')::uuid, md5('groupme-seed:c1:r-docs')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-emersong')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:s-emersong')::uuid, md5('groupme-seed:c1:r-present')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-haydenv')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g2')::uuid, md5('groupme-seed:s-haydenv')::uuid, md5('groupme-seed:c1:r-lead')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p1:s-alexr')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-alexr')::uuid, md5('groupme-seed:c1:r-prog')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-samt')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-samt')::uuid, md5('groupme-seed:c1:r-lead')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-jordanl')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-jordanl')::uuid, md5('groupme-seed:c1:r-docs')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-caseym')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-caseym')::uuid, md5('groupme-seed:c1:r-design')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-rileyp')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-rileyp')::uuid, md5('groupme-seed:c1:r-present')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-morgand')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-morgand')::uuid, md5('groupme-seed:c1:r-test')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p2:s-alexr')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-alexr')::uuid, md5('groupme-seed:c1:r-test')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-samt')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-samt')::uuid, md5('groupme-seed:c1:r-present')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-jordanl')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-jordanl')::uuid, md5('groupme-seed:c1:r-lead')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-caseym')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-caseym')::uuid, md5('groupme-seed:c1:r-prog')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-rileyp')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-rileyp')::uuid, md5('groupme-seed:c1:r-design')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-morgand')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g3')::uuid, md5('groupme-seed:s-morgand')::uuid, md5('groupme-seed:c1:r-docs')::uuid, 'override', 'Morgan asked to switch for this project. Approved after a table check-in.'),
  (md5('groupme-seed:c1:p1:s-kaio')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-kaio')::uuid, md5('groupme-seed:c1:r-prog')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-logane')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-logane')::uuid, md5('groupme-seed:c1:r-design')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-sagey')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-sagey')::uuid, md5('groupme-seed:c1:r-test')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-dakotai')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-dakotai')::uuid, md5('groupme-seed:c1:r-docs')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-finleyu')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-finleyu')::uuid, md5('groupme-seed:c1:r-present')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-remya')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-remya')::uuid, md5('groupme-seed:c1:r-lead')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p2:s-kaio')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-kaio')::uuid, md5('groupme-seed:c1:r-docs')::uuid, 'override', 'Moved to balance the table after a member changed sections.'),
  (md5('groupme-seed:c1:p2:s-logane')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-logane')::uuid, md5('groupme-seed:c1:r-present')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-sagey')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-sagey')::uuid, md5('groupme-seed:c1:r-lead')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-dakotai')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-dakotai')::uuid, md5('groupme-seed:c1:r-prog')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-finleyu')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-finleyu')::uuid, md5('groupme-seed:c1:r-design')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-remya')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g4')::uuid, md5('groupme-seed:s-remya')::uuid, md5('groupme-seed:c1:r-test')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p1:s-charliez')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g5')::uuid, md5('groupme-seed:s-charliez')::uuid, md5('groupme-seed:c1:r-design')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-jesseq')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g5')::uuid, md5('groupme-seed:s-jesseq')::uuid, md5('groupme-seed:c1:r-test')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-ellisn')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g5')::uuid, md5('groupme-seed:s-ellisn')::uuid, md5('groupme-seed:c1:r-docs')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p1:s-robint')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p1')::uuid, md5('groupme-seed:c1:g5')::uuid, md5('groupme-seed:s-robint')::uuid, md5('groupme-seed:c1:r-present')::uuid, 'chosen', null),
  (md5('groupme-seed:c1:p2:s-charliez')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g5')::uuid, md5('groupme-seed:s-charliez')::uuid, md5('groupme-seed:c1:r-present')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-jesseq')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g5')::uuid, md5('groupme-seed:s-jesseq')::uuid, md5('groupme-seed:c1:r-lead')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-ellisn')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g5')::uuid, md5('groupme-seed:s-ellisn')::uuid, md5('groupme-seed:c1:r-prog')::uuid, 'rotated', null),
  (md5('groupme-seed:c1:p2:s-robint')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:c1:p2')::uuid, md5('groupme-seed:c1:g5')::uuid, md5('groupme-seed:s-robint')::uuid, md5('groupme-seed:c1:r-design')::uuid, 'rotated', null)
on conflict (id) do nothing;

-- Posts, and calendar events for meetings + deadlines
insert into public.posts (id, class_id, author_id, type, title, body, posted_at, attachment_name, attachment_size, date_time, location) values
  (md5('groupme-seed:c1:post-demo')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:t1')::uuid, 'deadline', 'Clinic app demo', 'Each table demos the booking flow. 10 minutes per table.', '2026-10-06 09:00+08', null, null, '2026-10-30 13:00+08', 'Room 304'),
  (md5('groupme-seed:c1:post-l08')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:t1')::uuid, 'file', 'Lecture 8 — Unit testing', 'Slides from Thursday''s lecture.', '2026-10-16 10:00+08', 'L08_UnitTesting.pdf', '2.1 MB', null, null),
  (md5('groupme-seed:c1:post-checkin')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:t1')::uuid, 'meeting', 'Sprint check-in moved to Room 304', 'Bring your table''s progress board.', '2026-10-19 08:30+08', 'Sprint_Checklist.pdf', '180 KB', '2026-10-22 14:00+08', 'Room 304 · meet link'),
  (md5('groupme-seed:c1:post-template')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:t1')::uuid, 'file', 'Test plan template', 'Use this for Friday''s test plan.', '2026-10-20 09:00+08', 'TestPlan_Template.docx', '42 KB', null, null),
  (md5('groupme-seed:c1:post-testplan')::uuid, md5('groupme-seed:c1:class')::uuid, md5('groupme-seed:t1')::uuid, 'deadline', 'Test plan due Friday', 'One test plan per table. Submit it here in Posts.', '2026-10-20 09:05+08', 'TestPlan_Template.docx', '42 KB', '2026-10-23 23:59+08', 'Submit in Posts')
on conflict (id) do nothing;

insert into public.events (id, class_id, type, title, start_at, location, post_id) values
  (md5('groupme-seed:c1:ev-post-demo')::uuid, md5('groupme-seed:c1:class')::uuid, 'deadline', 'Clinic app demo', '2026-10-30 13:00+08', 'Room 304', md5('groupme-seed:c1:post-demo')::uuid),
  (md5('groupme-seed:c1:ev-post-checkin')::uuid, md5('groupme-seed:c1:class')::uuid, 'meeting', 'Sprint check-in moved to Room 304', '2026-10-22 14:00+08', 'Room 304 · meet link', md5('groupme-seed:c1:post-checkin')::uuid),
  (md5('groupme-seed:c1:ev-post-testplan')::uuid, md5('groupme-seed:c1:class')::uuid, 'deadline', 'Test plan due Friday', '2026-10-23 23:59+08', 'Submit in Posts', md5('groupme-seed:c1:post-testplan')::uuid)
on conflict (id) do nothing;

commit;
