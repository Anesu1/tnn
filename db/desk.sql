-- TNN Editorial Desk database. Safe to run more than once: `node scripts/desk-migrate.mjs`.
-- Everything lives in the "desk" schema, which Supabase does not expose through its public
-- REST/GraphQL API. Only the website's server connects, with the database connection string.

create schema if not exists desk;
set search_path = desk;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  role text not null check (role in ('ceo', 'editor')),
  password_hash text not null,
  must_change_password boolean not null default true,
  -- Authenticator app secret, encrypted with DESK_SECRET (AES-256-GCM)
  totp_secret text,
  totp_enabled boolean not null default false,
  totp_last_step bigint not null default 0,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Invitation link: single use, expires. Only its SHA-256 is stored.
alter table users add column if not exists invite_token_hash text;
alter table users add column if not exists invite_expires_at timestamptz;

-- Only a SHA-256 of each session token is stored, so a database leak can't be replayed as a login
create table if not exists sessions (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  mfa_passed boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ip text,
  user_agent text
);
create index if not exists sessions_user on sessions(user_id);

-- One record per story, video, show, documentary or special report
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null,
  format text,
  platforms text[] not null default '{}',
  priority text not null default 'normal',
  lead text,
  contributors text,
  owner text,
  deadline date,
  status text not null default 'planned',
  next_action text,
  blocked boolean not null default false,
  blocker text,
  risk text,
  evidence_url text,
  sanity_id text,
  success_measure text,
  -- Monday of the week and first day of the month the item was planned for
  planned_week date,
  planned_month date,
  -- Documentaries and special reports only
  stage text,
  completed_at timestamptz,
  archived boolean not null default false,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists items_deadline on items(deadline) where not archived;
create index if not exists items_week on items(planned_week);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  name text not null,
  due date,
  owner text,
  risk text,
  done_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists milestones_item on milestones(item_id);

-- Submitted reports are fixed copies. Editing a report submits a new version.
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('daily', 'weekly_plan', 'weekly_report', 'scorecard', 'next_month')),
  period_start date not null,
  version int not null default 1,
  data jsonb not null,
  submitted_by uuid not null references users(id),
  submitted_at timestamptz not null default now(),
  review_status text not null default 'submitted' check (review_status in ('submitted', 'reviewed', 'changes_requested')),
  review_note text,
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  unique (kind, period_start, version)
);

-- Monthly targets: the editor proposes, the CEO agrees (which locks them) or sends them back
create table if not exists target_sets (
  month date primary key,
  status text not null default 'draft' check (status in ('draft', 'proposed', 'agreed', 'changes_requested')),
  note text,
  proposed_by uuid references users(id),
  proposed_at timestamptz,
  agreed_by uuid references users(id),
  agreed_at timestamptz
);

create table if not exists targets (
  id uuid primary key default gen_random_uuid(),
  month date not null references target_sets(month) on delete cascade,
  metric text not null,
  label text not null,
  target numeric not null,
  -- Actual for metrics that can't be counted automatically (audience figures, corrections)
  manual_actual numeric,
  position int not null default 0
);
create index if not exists targets_month on targets(month);

create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  context text,
  item_id uuid references items(id) on delete set null,
  report_id uuid references reports(id) on delete set null,
  due date,
  status text not null default 'open' check (status in ('open', 'decided')),
  answer text,
  raised_by uuid references users(id),
  raised_at timestamptz not null default now(),
  decided_by uuid references users(id),
  decided_at timestamptz
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  entity text not null check (entity in ('item', 'report', 'targets')),
  entity_id text not null,
  user_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_entity on comments(entity, entity_id);

-- Record of every change, submission and sign-in. Rows can be added, never changed or removed.
create table if not exists audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  user_id uuid references users(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  summary text,
  changes jsonb,
  ip text
);
create index if not exists audit_entity on audit_log(entity, entity_id);
create index if not exists audit_at on audit_log(at desc);

-- Reminder emails already sent, so each one goes out once
create table if not exists reminders_sent (
  key text primary key,
  sent_at timestamptz not null default now()
);

create or replace function desk.reject_change() returns trigger language plpgsql as $$
begin
  raise exception '% rows cannot be changed or deleted', tg_table_name;
end $$;

drop trigger if exists audit_log_append_only on audit_log;
create trigger audit_log_append_only before update or delete on audit_log
  for each row execute function desk.reject_change();

-- A submitted report's content can't be edited; only the CEO's review fields can change
create or replace function desk.protect_report() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' or new.data is distinct from old.data or new.kind <> old.kind
     or new.period_start <> old.period_start or new.version <> old.version
     or new.submitted_by <> old.submitted_by or new.submitted_at <> old.submitted_at then
    raise exception 'submitted reports cannot be changed';
  end if;
  return new;
end $$;

drop trigger if exists reports_fixed on reports;
create trigger reports_fixed before update or delete on reports
  for each row execute function desk.protect_report();

-- Supabase's public API roles get nothing, even if the schema were exposed by mistake
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'desk' loop
    execute format('alter table desk.%I enable row level security', t);
  end loop;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema desk from anon, authenticated';
    execute 'revoke all on all tables in schema desk from anon, authenticated';
  end if;
end $$;
