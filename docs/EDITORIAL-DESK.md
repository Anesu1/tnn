# TNN Editorial Desk: setup

The Desk is the private workspace at `/desk` for the CEO and the Managing Editor. Its data lives in a
Supabase Postgres database (the `desk` schema), separate from Sanity. Only the website's server
talks to that database (with the `pg` driver); nothing is exposed to browsers or to Supabase's
public API.

## 1. Create the database

1. Create a free project at supabase.com (region: London, `eu-west-2`).
2. In Supabase click **Connect** and copy the **Session pooler** connection string (port 5432).
   Put your database password in it and add `?sslmode=require` to the end.
3. In **Project Settings → Database → SSL Configuration**, click **Download certificate** and save
   the file as `db/supabase-ca.crt` in this project. The site checks the database's certificate
   against it, so nobody can impersonate the database. (It is a public certificate; it's fine to commit.)
4. Put the connection string in `.env.local` as `DESK_DATABASE_URL`, then create the tables:

   ```bash
   node --env-file=.env.local scripts/desk-migrate.mjs
   ```

Use the **session** pooler (5432) everywhere, including on Netlify. The Desk sets the schema and
time zone once per connection, which the transaction pooler (6543) wouldn't keep.

## 2. Settings on Netlify

In **Site configuration → Environment variables**, add these with the scope set to **Functions**:

| Name | Value |
|---|---|
| `DESK_DATABASE_URL` | The same session pooler string as in `.env.local` (port 5432) |
| `DESK_SECRET` | A random string of 40+ characters. Encrypts authenticator secrets. Don't change it later, or everyone has to set their authenticator up again. |
| `DESK_CRON_SECRET` | Another random string of 32+ characters. Lets the hourly reminder job run. |

Reminder emails are off until you add all three of these (after the review with the Editor):

| Name | Value |
|---|---|
| `RESEND_API_KEY` | From resend.com (free plan) |
| `DESK_EMAIL_FROM` | e.g. `TNN Desk <desk@thenarrativenetwork.org>` (the domain must be verified in Resend) |
| `DESK_REMINDERS_ENABLED` | `true` |

Redeploy after changing these.

## 3. Create the two accounts

```bash
node --env-file=.env.local scripts/desk-user.mjs create --email ceo@… --name "Full Name" --role ceo
node --env-file=.env.local scripts/desk-user.mjs create --email editor@… --name "Full Name" --role editor
```

With `RESEND_API_KEY` and `DESK_EMAIL_FROM` set, each command emails the person an invitation in
the site's design. Its link works once, for 3 days, and takes them straight to choosing a password
and connecting an authenticator app (Google or Microsoft Authenticator). No password is ever
emailed. Without email set up, or with `--no-email`, the command prints a temporary password
instead; give it to the person in person or by phone.

After that, the CEO can add, reset, re-invite or switch off accounts on the **Accounts** page.
To send someone a fresh invitation: `node --env-file=.env.local scripts/desk-user.mjs invite --email …`.
If the CEO loses their phone, run `node --env-file=.env.local scripts/desk-user.mjs reset --email …`.

## How it fits together

- **Tracker** items are the single source of truth. Daily, weekly and monthly reports read from them,
  and status changes made inside a report update the tracker.
- **Targets**: the Editor proposes them (on the Targets page or in Next Month's Plan); the CEO agrees,
  which locks them, or sends them back. Measures marked "counted automatically" come from the tracker
  and from stories published on the website.
- **History**: every change, report, decision and sign-in is in `desk.audit_log`. The database refuses
  to edit or delete those rows, and submitted reports can't be changed (resubmitting saves a new version).
- **Reminders**: `netlify/functions/desk-reminders.mts` runs hourly and calls `/desk/cron`. Times are
  in `SCHEDULE` in `lib/desk/config.ts`; lists of types, platforms and statuses are there too.
- **Backups**: the free Supabase plan has no automatic backups. Move to Pro before routine use, or
  export regularly with `pg_dump`.

## Local development

No Docker needed. Run Postgres in-process with PGlite:

```bash
npx pglite-server --db=./.desk-db --port=5544
DESK_DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5544/postgres" node scripts/desk-migrate.mjs
DESK_DATABASE_POOL=1 DESK_DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5544/postgres" DESK_SECRET="any-local-string-at-least-32-characters" npx next dev
```
