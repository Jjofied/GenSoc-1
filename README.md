# GenSoc-1 · groupme

Class group-work app where group roles rotate every project, so nobody gets stuck in the same role.
No gender field anywhere. Built for a Gender & Society (BSCS) finals project.

- **`/demo`** — the full prototype on dummy data. No sign-in, no keys needed. Prototype tools always on.
- **Main routes** (`/`, `/student`, `/admin`, …) — the real app. Still on dummy data + a mock sign-in until the next backend brief.
- Project log, decisions and briefs: [`docs/`](docs/README.md)

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000/demo works with no setup
npm test           # rotation rules, rotation job, and the database rules (on an in-memory Postgres)
npm run lint
npm run build
```

## Set up Supabase + Vercel (by hand, once)

Full click-by-click steps: [`docs/supabase-setup.md`](docs/supabase-setup.md). In short:

1. **Create a Supabase project.** Copy the Project URL, publishable key and secret key (Project Settings → API Keys).
2. **Env vars.** Copy `.env.example` to `.env.local` and fill it in. Add the same names in Vercel → Settings → Environment Variables. The secret key is server-only: never prefix it with `NEXT_PUBLIC_`.
3. **Run the SQL** in Supabase → SQL Editor, one file at a time, in this order:
   1. `supabase/migrations/0001_tables.sql`
   2. `supabase/migrations/0002_functions.sql`
   3. `supabase/migrations/0003_access_rules.sql`
   4. `supabase/migrations/0004_rotation.sql`
   5. `supabase/seed.sql` (dummy CS 3A data)
4. **Dev account.** Sign up in the app with your own email, then run `supabase/dev-access.sql` with your email filled in.
5. **Check.** Run `supabase/verify.sql`. Every row should say `ok`.
6. **Deploy.** Redeploy on Vercel so the env vars load. `vercel.json` adds a daily cron that calls `/api/cron/rotate` with `CRON_SECRET`.

The dummy data in `supabase/seed.sql` is generated from `lib/mock-data.ts`. Change that file, then run `npm run db:seed`.
