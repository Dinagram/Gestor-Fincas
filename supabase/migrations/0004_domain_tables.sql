-- =====================================================================
-- 0004 — Domain tables: issues, polls, announcements, documents, budget
-- =====================================================================
-- community_id is denormalized in every child table so RLS doesn't need
-- joins. Triggers keep referential consistency where it could drift.
-- =====================================================================

-- =====================================================================
-- Incidencias
-- =====================================================================

create table public.issues (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  code          text not null,                              -- INC-001
  title         text not null,
  description   text,
  category      issue_category not null default 'otros',
  priority      issue_priority not null default 'media',
  status        issue_status not null default 'abierta',
  location      text,                                       -- e.g. "Portal", "Escalera B"
  created_by    uuid not null references public.profiles(id),
  assigned_to   uuid references public.profiles(id),
  resolved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (community_id, code)
);

create index idx_issues_community_created on public.issues (community_id, created_at desc);
create index idx_issues_community_status  on public.issues (community_id, status);

create trigger trg_issues_updated_at
  before update on public.issues
  for each row execute function public.set_updated_at();

-- ---- INC-XXX code generation (per community counter) ----------------
create or replace function public.assign_issue_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
begin
  insert into public.community_counters (community_id, scope, last_value)
       values (new.community_id, 'issue', 1)
  on conflict (community_id, scope)
  do update set last_value = community_counters.last_value + 1
  returning last_value into v_next;

  new.code := 'INC-' || lpad(v_next::text, 3, '0');
  return new;
end;
$$;

create trigger trg_issue_assign_code
  before insert on public.issues
  for each row
  when (new.code is null or new.code = '')
  execute function public.assign_issue_code();

-- ---- Comments ------------------------------------------------------
create table public.issue_comments (
  id            uuid primary key default gen_random_uuid(),
  issue_id      uuid not null references public.issues(id) on delete cascade,
  community_id  uuid not null references public.communities(id) on delete cascade,
  author_id     uuid references public.profiles(id),
  body          text not null,
  is_system     boolean not null default false,
  created_at    timestamptz not null default now()
);
create index idx_issue_comments_issue     on public.issue_comments (issue_id, created_at);
create index idx_issue_comments_community on public.issue_comments (community_id);

-- ---- Attachments --------------------------------------------------
create table public.issue_attachments (
  id            uuid primary key default gen_random_uuid(),
  issue_id      uuid not null references public.issues(id) on delete cascade,
  comment_id    uuid references public.issue_comments(id) on delete cascade,
  community_id  uuid not null references public.communities(id) on delete cascade,
  uploader_id   uuid references public.profiles(id),
  storage_path  text not null,
  file_name     text not null,
  mime_type     text,
  size_bytes    bigint,
  created_at    timestamptz not null default now()
);
create index idx_issue_attachments_issue on public.issue_attachments (issue_id);

-- ---- Status history (written by trigger only) ----------------------
create table public.issue_status_history (
  id            uuid primary key default gen_random_uuid(),
  issue_id      uuid not null references public.issues(id) on delete cascade,
  community_id  uuid not null references public.communities(id) on delete cascade,
  from_status   issue_status,
  to_status     issue_status not null,
  changed_by    uuid references public.profiles(id),
  note          text,
  created_at    timestamptz not null default now()
);
create index idx_issue_history_issue on public.issue_status_history (issue_id, created_at);

create or replace function public.log_issue_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_label_from text;
  v_label_to   text;
begin
  if tg_op = 'INSERT' then
    insert into public.issue_status_history (issue_id, community_id, to_status, changed_by)
    values (new.id, new.community_id, new.status, new.created_by);
  elsif new.status is distinct from old.status then
    insert into public.issue_status_history
      (issue_id, community_id, from_status, to_status, changed_by)
    values
      (new.id, new.community_id, old.status, new.status, auth.uid());

    -- Side-effect: append a system comment so the chat thread reflects
    -- the transition without the client needing extra writes.
    v_label_from := old.status::text;
    v_label_to   := new.status::text;
    insert into public.issue_comments (issue_id, community_id, author_id, body, is_system)
    values (
      new.id,
      new.community_id,
      auth.uid(),
      'Estado cambiado: ' || v_label_from || ' → ' || v_label_to,
      true
    );

    if new.status = 'resuelta' and new.resolved_at is null then
      new.resolved_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_issue_status_after_ins
  after insert on public.issues
  for each row execute function public.log_issue_status_change();

create trigger trg_issue_status_before_upd
  before update of status on public.issues
  for each row execute function public.log_issue_status_change();

-- ---- Supports (vecinos sumándose) ---------------------------------
create table public.issue_supports (
  issue_id      uuid not null references public.issues(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  community_id  uuid not null references public.communities(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (issue_id, profile_id)
);

-- =====================================================================
-- Votaciones
-- =====================================================================

create table public.polls (
  id              uuid primary key default gen_random_uuid(),
  community_id    uuid not null references public.communities(id) on delete cascade,
  title           text not null,
  description     text,
  type            poll_type not null,
  status          poll_status not null default 'draft',
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  quorum_percent  numeric(5, 2) not null default 50,
  amount          numeric(12, 2),
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (ends_at > starts_at),
  check (type <> 'budget' or amount is not null)
);
create index idx_polls_community_status on public.polls (community_id, status);

create trigger trg_polls_updated_at
  before update on public.polls
  for each row execute function public.set_updated_at();

create table public.poll_options (
  id        uuid primary key default gen_random_uuid(),
  poll_id   uuid not null references public.polls(id) on delete cascade,
  label     text not null,
  "order"   integer not null default 0
);
create index idx_poll_options_poll on public.poll_options (poll_id);

create table public.poll_votes (
  poll_id       uuid not null references public.polls(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  community_id  uuid not null references public.communities(id) on delete cascade,
  choice        vote_choice,
  option_id     uuid references public.poll_options(id),
  weight        numeric(6, 4) not null default 1,
  voted_at      timestamptz not null default now(),
  primary key (poll_id, profile_id),
  check (choice is not null or option_id is not null)
);
create index idx_poll_votes_poll on public.poll_votes (poll_id);

create table public.poll_participants (
  poll_id       uuid not null references public.polls(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  community_id  uuid not null references public.communities(id) on delete cascade,
  weight        numeric(6, 4) not null default 1,
  primary key (poll_id, profile_id)
);

-- =====================================================================
-- Comunicados
-- =====================================================================

create table public.announcements (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  type          announcement_type not null default 'aviso',
  title         text not null,
  body          text not null,
  sent_by       uuid references public.profiles(id),
  sent_at       timestamptz not null default now(),
  requires_ack  boolean not null default false,
  created_at    timestamptz not null default now()
);
create index idx_announcements_community on public.announcements (community_id, sent_at desc);

create table public.announcement_reads (
  announcement_id  uuid not null references public.announcements(id) on delete cascade,
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  community_id     uuid not null references public.communities(id) on delete cascade,
  read_at          timestamptz not null default now(),
  acknowledged_at  timestamptz,
  primary key (announcement_id, profile_id)
);

-- =====================================================================
-- Documentos
-- =====================================================================

create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  folder        document_folder not null default 'otros',
  name          text not null,
  storage_path  text not null,
  size_bytes    bigint,
  mime_type     text,
  year          integer,
  uploaded_by   uuid references public.profiles(id),
  uploaded_at   timestamptz not null default now()
);
create index idx_documents_community_folder on public.documents (community_id, folder);
create index idx_documents_community_date   on public.documents (community_id, uploaded_at desc);

-- =====================================================================
-- Presupuesto
-- =====================================================================

create table public.budget_categories (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  name          text not null,
  color         text,
  parent_id     uuid references public.budget_categories(id) on delete set null,
  unique (community_id, name)
);
create index idx_budget_categories_community on public.budget_categories (community_id);

create table public.budget_entries (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  category_id   uuid references public.budget_categories(id) on delete set null,
  year          integer not null,
  month         integer check (month between 1 and 12),
  amount_eur    numeric(12, 2) not null,
  kind          budget_kind not null,
  description   text,
  source        text not null default 'manual',
  entry_date    date not null default current_date,
  created_at    timestamptz not null default now()
);
create index idx_budget_entries_community_period on public.budget_entries (community_id, year, month);
create index idx_budget_entries_community_kind   on public.budget_entries (community_id, kind);

create table public.budget_imports (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  file_path     text not null,
  status        text not null default 'pending',
  rows_imported integer default 0,
  imported_by   uuid references public.profiles(id),
  imported_at   timestamptz not null default now()
);
