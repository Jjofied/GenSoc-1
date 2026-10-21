-- groupme · dev access
-- Gives ONE account full access to everything (both views, all classes).
-- 1. Sign up in the app with your own email first.
-- 2. Replace YOUR_EMAIL_HERE below, then paste into Supabase → SQL Editor → Run.

update public.profiles set is_dev = true
where id = (select id from auth.users where lower(email) = lower('jonjosephmay20@gmail.com'));

-- Should show exactly one row: your account, is_dev = true.
select u.email, p.name, p.user_type, p.is_dev
from public.profiles p
join auth.users u on u.id = p.id
where p.is_dev;
