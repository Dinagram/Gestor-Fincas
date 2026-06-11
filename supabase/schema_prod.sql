-- =====================================================================
-- GestiónFinca — Schema completo para producción
-- Ejecutar en Supabase SQL Editor (una sola vez, en orden)
-- =====================================================================

-- =====================================================================
-- 0001 — Extensions, enums and utility functions
-- =====================================================================
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";
create extension if not exists citext;

create type public.member_role as enum (
  'superadmin',
  'admin_finca',
  'junta',
  'propietario',
  'inquilino'
);

create type public.member_status as enum ('active', 'invited', 'inactive');

create type public.unit_type as enum ('vivienda', 'local', 'garaje', 'trastero');

create type public.issue_category as enum (
  'ascensor',
  'fontaneria',
  'electricidad',
  'limpieza',
  'ruido',
  'seguridad',
  'jardineria',
  'obras',
  'otros'
);

create type public.issue_priority as enum ('baja', 'media', 'alta', 'urgente');

create type public.issue_status as enum (
  'abierta',
  'en_revision',
  'en_curso',
  'resuelta',
  'cerrada',
  'descartada'
);

create type public.poll_type as enum ('binary', 'multiple', 'budget');

create type public.poll_status as enum ('draft', 'active', 'closed', 'cancelled');

create type public.vote_choice as enum ('favor', 'contra', 'abstencion');

create type public.announcement_type as enum (
  'aviso',
  'convocatoria',
  'resolucion',
  'urgente'
);

create type public.document_folder as enum (
  'actas',
  'estatutos',
  'seguros',
  'contratos',
  'certificados',
  'otros'
);

create type public.budget_kind as enum ('presupuestado', 'ejecutado');

create type public.plan_tier as enum ('free', 'pro', 'enterprise');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =====================================================================
-- 0002 — Core tenancy tables
-- =====================================================================
create table public.communities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text not null,
  cif         text,
  postal_code text,
  city        text,
  province    text,
  plan        plan_tier not null default 'free',
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_communities_updated_at
  before update on public.communities
  for each row execute function public.set_updated_at();

create table public.units (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  floor         text not null,
  door          text not null,
  type          unit_type not null default 'vivienda',
  surface_m2    numeric(7, 2),
  coefficient   numeric(6, 4) not null default 0,
  created_at    timestamptz not null default now(),
  unique (community_id, floor, door, type)
);

create index idx_units_community on public.units (community_id);

create table public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  full_name               text,
  email                   citext unique,
  phone                   text,
  avatar_url              text,
  language                text not null default 'es',
  notifications_settings  jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.community_members (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  unit_id       uuid references public.units(id) on delete set null,
  role          member_role not null,
  status        member_status not null default 'active',
  invited_by      uuid references public.profiles(id),
  invited_at      timestamptz,
  joined_at       timestamptz default now(),
  monthly_fee     numeric(8,2) not null default 0,
  payment_status  text not null default 'al_dia'
    constraint chk_payment_status check (payment_status in ('al_dia', 'moroso', 'pendiente')),
  unique (community_id, profile_id, unit_id)
);

create index idx_members_community         on public.community_members (community_id);
create index idx_members_profile_community on public.community_members (profile_id, community_id);
create index idx_members_profile_active    on public.community_members (profile_id) where status = 'active';

create table public.invitations (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  email         citext not null,
  role          member_role not null,
  unit_id       uuid references public.units(id) on delete set null,
  token         text not null unique default encode(gen_random_bytes(24), 'hex'),
  expires_at    timestamptz not null default (now() + interval '14 days'),
  used_at       timestamptz,
  cancelled_at  timestamptz,
  invited_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now()
);

create index idx_invitations_community on public.invitations (community_id);
create index idx_invitations_pending
  on public.invitations (email)
  where used_at is null and cancelled_at is null;
create index idx_invitations_community_active
  on public.invitations (community_id)
  where used_at is null and cancelled_at is null;

create table public.community_counters (
  community_id  uuid not null references public.communities(id) on delete cascade,
  scope         text not null,
  last_value    integer not null default 0,
  primary key (community_id, scope)
);

-- =====================================================================
-- 0003 — RLS helper functions
-- =====================================================================
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.community_members
     where profile_id = auth.uid()
       and role = 'superadmin'
       and status = 'active'
  );
$$;

create or replace function public.is_member(_community uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.community_members
     where profile_id = auth.uid()
       and community_id = _community
       and status = 'active'
  ) or public.is_platform_admin();
$$;

create or replace function public.current_member_role(_community uuid)
returns public.member_role
language sql
stable
security definer
set search_path = public
as $$
  select role
    from public.community_members
   where profile_id = auth.uid()
     and community_id = _community
     and status = 'active'
   limit 1;
$$;

create or replace function public.has_role(_community uuid, _role public.member_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_member_role(_community) = _role
      or public.is_platform_admin();
$$;

create or replace function public.is_admin_or_junta(_community uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_member_role(_community) in ('admin_finca', 'junta')
      or public.is_platform_admin();
$$;

create or replace function public.can_vote_economic(_community uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_member_role(_community)
         in ('propietario', 'admin_finca', 'junta');
$$;

-- =====================================================================
-- 0004 — Domain tables
-- =====================================================================
create table public.issues (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  code          text not null,
  title         text not null,
  description   text,
  category      issue_category not null default 'otros',
  priority      issue_priority not null default 'media',
  status        issue_status not null default 'abierta',
  location      text,
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

create table public.issue_supports (
  issue_id      uuid not null references public.issues(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  community_id  uuid not null references public.communities(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (issue_id, profile_id)
);

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
  acknowledged_from_ip inet,
  primary key (announcement_id, profile_id)
);

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

-- =====================================================================
-- 0005 — RLS policies
-- =====================================================================
do $$
declare
  t text;
begin
  for t in
    select tablename
      from pg_tables
     where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
  end loop;
end;
$$;

create policy communities_select on public.communities
  for select using (public.is_member(id));

create policy communities_insert on public.communities
  for insert with check (public.is_platform_admin());

create policy communities_update on public.communities
  for update
  using (public.has_role(id, 'admin_finca') or public.is_platform_admin())
  with check (public.has_role(id, 'admin_finca') or public.is_platform_admin());

create policy communities_delete on public.communities
  for delete using (public.is_platform_admin());

create policy units_select on public.units
  for select using (public.is_member(community_id));

create policy units_modify on public.units
  for all
  using (public.has_role(community_id, 'admin_finca') or public.is_platform_admin())
  with check (public.has_role(community_id, 'admin_finca') or public.is_platform_admin());

create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
        from public.community_members m1
        join public.community_members m2 on m1.community_id = m2.community_id
       where m1.profile_id = auth.uid()
         and m2.profile_id = profiles.id
         and m1.status = 'active'
         and m2.status = 'active'
    )
  );

create policy profiles_insert on public.profiles
  for insert with check (id = auth.uid());

create policy profiles_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy members_select on public.community_members
  for select using (public.is_member(community_id));

create policy members_insert on public.community_members
  for insert with check (
    public.has_role(community_id, 'admin_finca') or public.is_platform_admin()
  );

create policy members_update on public.community_members
  for update
  using (public.has_role(community_id, 'admin_finca') or public.is_platform_admin())
  with check (public.has_role(community_id, 'admin_finca') or public.is_platform_admin());

create policy members_delete on public.community_members
  for delete using (
    public.has_role(community_id, 'admin_finca') or public.is_platform_admin()
  );

create policy invitations_select on public.invitations
  for select using (public.is_admin_or_junta(community_id));

create policy invitations_modify on public.invitations
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

create policy counters_select on public.community_counters
  for select using (public.is_admin_or_junta(community_id));

create policy issues_select on public.issues
  for select using (public.is_member(community_id));

create policy issues_insert on public.issues
  for insert with check (
    public.is_member(community_id)
    and created_by = auth.uid()
  );

create policy issues_update on public.issues
  for update
  using (
    public.is_admin_or_junta(community_id)
    or (created_by = auth.uid() and status = 'abierta')
  )
  with check (
    public.is_admin_or_junta(community_id)
    or (created_by = auth.uid() and status = 'abierta')
  );

create policy issues_delete on public.issues
  for delete using (public.has_role(community_id, 'admin_finca'));

create policy issue_comments_select on public.issue_comments
  for select using (public.is_member(community_id));

create policy issue_comments_insert on public.issue_comments
  for insert with check (
    public.is_member(community_id)
    and (
      (author_id = auth.uid() and not is_system)
      or (is_system and public.is_admin_or_junta(community_id))
    )
  );

create policy issue_comments_update on public.issue_comments
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy issue_comments_delete on public.issue_comments
  for delete using (
    author_id = auth.uid() or public.is_admin_or_junta(community_id)
  );

create policy issue_attachments_select on public.issue_attachments
  for select using (public.is_member(community_id));

create policy issue_attachments_insert on public.issue_attachments
  for insert with check (
    public.is_member(community_id) and uploader_id = auth.uid()
  );

create policy issue_attachments_delete on public.issue_attachments
  for delete using (
    uploader_id = auth.uid() or public.is_admin_or_junta(community_id)
  );

create policy issue_history_select on public.issue_status_history
  for select using (public.is_member(community_id));

create policy issue_supports_select on public.issue_supports
  for select using (public.is_member(community_id));

create policy issue_supports_insert on public.issue_supports
  for insert with check (
    public.is_member(community_id) and profile_id = auth.uid()
  );

create policy issue_supports_delete on public.issue_supports
  for delete using (profile_id = auth.uid());

create policy polls_select on public.polls
  for select using (public.is_member(community_id));

create policy polls_modify on public.polls
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

create policy poll_options_select on public.poll_options
  for select using (
    exists (
      select 1 from public.polls p
       where p.id = poll_options.poll_id
         and public.is_member(p.community_id)
    )
  );

create policy poll_options_modify on public.poll_options
  for all
  using (
    exists (
      select 1 from public.polls p
       where p.id = poll_options.poll_id
         and public.is_admin_or_junta(p.community_id)
    )
  )
  with check (
    exists (
      select 1 from public.polls p
       where p.id = poll_options.poll_id
         and public.is_admin_or_junta(p.community_id)
    )
  );

create policy poll_votes_select on public.poll_votes
  for select using (public.is_member(community_id));

create policy poll_votes_insert on public.poll_votes
  for insert with check (
    profile_id = auth.uid()
    and public.is_member(community_id)
    and exists (
      select 1 from public.polls p
       where p.id = poll_votes.poll_id
         and p.status = 'active'
         and now() between p.starts_at and p.ends_at
         and (p.type <> 'budget' or public.can_vote_economic(community_id))
    )
  );

create policy poll_votes_delete on public.poll_votes
  for delete using (
    profile_id = auth.uid()
    and exists (
      select 1 from public.polls p
       where p.id = poll_votes.poll_id
         and p.status = 'active'
    )
  );

create policy poll_participants_select on public.poll_participants
  for select using (public.is_member(community_id));

create policy poll_participants_modify on public.poll_participants
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

create policy announcements_select on public.announcements
  for select using (public.is_member(community_id));

create policy announcements_insert on public.announcements
  for insert with check (
    public.has_role(community_id, 'admin_finca') and sent_by = auth.uid()
  );

create policy announcements_update on public.announcements
  for update
  using (public.has_role(community_id, 'admin_finca'))
  with check (public.has_role(community_id, 'admin_finca'));

create policy announcements_delete on public.announcements
  for delete using (public.has_role(community_id, 'admin_finca'));

create policy announcement_reads_select on public.announcement_reads
  for select using (
    profile_id = auth.uid() or public.is_admin_or_junta(community_id)
  );

create policy announcement_reads_insert on public.announcement_reads
  for insert with check (profile_id = auth.uid());

create policy announcement_reads_update on public.announcement_reads
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy documents_select on public.documents
  for select using (public.is_member(community_id));

create policy documents_modify on public.documents
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

create policy budget_categories_select on public.budget_categories
  for select using (public.is_member(community_id));

create policy budget_categories_modify on public.budget_categories
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

create policy budget_entries_select on public.budget_entries
  for select using (public.is_member(community_id));

create policy budget_entries_modify on public.budget_entries
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

create policy budget_imports_select on public.budget_imports
  for select using (public.is_admin_or_junta(community_id));

create policy budget_imports_modify on public.budget_imports
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

-- =====================================================================
-- 0006 — Storage buckets + policies
-- =====================================================================
insert into storage.buckets (id, name, public)
values
  ('incidence-attachments', 'incidence-attachments', false),
  ('documents',             'documents',             false),
  ('announcement-files',    'announcement-files',    false),
  ('avatars',               'avatars',               true)
on conflict (id) do nothing;

create or replace function public.storage_community_id(_name text)
returns uuid
language sql
immutable
as $$
  select nullif(split_part(_name, '/', 1), '')::uuid;
$$;

create policy "inc_att_read" on storage.objects
  for select using (
    bucket_id = 'incidence-attachments'
    and public.is_member(public.storage_community_id(name))
  );

create policy "inc_att_write" on storage.objects
  for insert with check (
    bucket_id = 'incidence-attachments'
    and public.is_member(public.storage_community_id(name))
    and owner = auth.uid()
  );

create policy "inc_att_delete" on storage.objects
  for delete using (
    bucket_id = 'incidence-attachments'
    and (
      owner = auth.uid()
      or public.is_admin_or_junta(public.storage_community_id(name))
    )
  );

create policy "doc_read" on storage.objects
  for select using (
    bucket_id = 'documents'
    and public.is_member(public.storage_community_id(name))
  );

create policy "doc_write" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and public.is_admin_or_junta(public.storage_community_id(name))
  );

create policy "doc_delete" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and public.is_admin_or_junta(public.storage_community_id(name))
  );

create policy "ann_read" on storage.objects
  for select using (
    bucket_id = 'announcement-files'
    and public.is_member(public.storage_community_id(name))
  );

create policy "ann_write" on storage.objects
  for insert with check (
    bucket_id = 'announcement-files'
    and public.has_role(public.storage_community_id(name), 'admin_finca')
  );

create policy "ann_delete" on storage.objects
  for delete using (
    bucket_id = 'announcement-files'
    and public.has_role(public.storage_community_id(name), 'admin_finca')
  );

create policy "avatar_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatar_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "avatar_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and owner = auth.uid()
  );

create policy "avatar_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and owner = auth.uid()
  );

-- =====================================================================
-- 0007 — Sala Multiusos
-- =====================================================================
create type public.room_status as enum ('disponible', 'fuera_servicio');

create type public.booking_status as enum (
  'pendiente',
  'confirmada',
  'cancelada',
  'completada'
);

create type public.booking_category as enum (
  'reunion',
  'cumpleanos',
  'deporte',
  'taller',
  'otro'
);

create type public.booking_kind as enum ('vecino', 'comunidad', 'bloqueo');

create table public.rooms (
  id                    uuid primary key default gen_random_uuid(),
  community_id          uuid not null references public.communities(id) on delete cascade,
  name                  text not null,
  description           text,
  capacity              integer not null default 0,
  status                room_status not null default 'disponible',
  open_hour             smallint not null default 9,
  close_hour            smallint not null default 22,
  requires_approval     boolean not null default false,
  out_of_service_reason text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (community_id, name),
  check (open_hour >= 0 and close_hour <= 24 and open_hour < close_hour)
);

create index idx_rooms_community on public.rooms (community_id);

create trigger trg_rooms_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

create table public.room_booking_rules (
  id                      uuid primary key default gen_random_uuid(),
  community_id            uuid not null references public.communities(id) on delete cascade,
  room_id                 uuid not null references public.rooms(id) on delete cascade,
  max_per_unit_per_month  smallint not null default 2,
  min_advance_hours       smallint not null default 48,
  max_duration_hours      smallint not null default 4,
  max_attendees           smallint,
  rules_text              text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (room_id)
);

create index idx_booking_rules_community on public.room_booking_rules (community_id);

create trigger trg_room_booking_rules_updated_at
  before update on public.room_booking_rules
  for each row execute function public.set_updated_at();

create table public.room_bookings (
  id                 uuid primary key default gen_random_uuid(),
  community_id       uuid not null references public.communities(id) on delete cascade,
  room_id            uuid not null references public.rooms(id) on delete cascade,
  unit_id            uuid references public.units(id) on delete set null,
  created_by         uuid not null references public.profiles(id),
  starts_at          timestamptz not null,
  ends_at            timestamptz not null,
  purpose            text not null,
  category           booking_category not null default 'otro',
  attendees          smallint,
  status             booking_status not null default 'confirmada',
  kind               booking_kind not null default 'vecino',
  rules_accepted_at  timestamptz,
  cancelled_at       timestamptz,
  cancel_reason      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index idx_bookings_community_room   on public.room_bookings (community_id, room_id, starts_at);
create index idx_bookings_created_by       on public.room_bookings (created_by);
create index idx_bookings_unit             on public.room_bookings (unit_id);
create index idx_bookings_community_status on public.room_bookings (community_id, status);

create trigger trg_room_bookings_updated_at
  before update on public.room_bookings
  for each row execute function public.set_updated_at();

create table public.room_booking_participants (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  booking_id    uuid not null references public.room_bookings(id) on delete cascade,
  profile_id    uuid references public.profiles(id) on delete set null,
  guest_name    text,
  created_at    timestamptz not null default now()
);

create index idx_booking_participants_booking on public.room_booking_participants (booking_id);
create index idx_booking_participants_profile on public.room_booking_participants (profile_id);

alter table public.rooms                     enable row level security;
alter table public.rooms                     force  row level security;
alter table public.room_booking_rules        enable row level security;
alter table public.room_booking_rules        force  row level security;
alter table public.room_bookings             enable row level security;
alter table public.room_bookings             force  row level security;
alter table public.room_booking_participants enable row level security;
alter table public.room_booking_participants force  row level security;

create policy rooms_select on public.rooms
  for select using (public.is_member(community_id));

create policy rooms_modify on public.rooms
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

create policy room_booking_rules_select on public.room_booking_rules
  for select using (public.is_member(community_id));

create policy room_booking_rules_modify on public.room_booking_rules
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

create policy room_bookings_select on public.room_bookings
  for select using (public.is_member(community_id));

create policy room_bookings_insert on public.room_bookings
  for insert with check (
    public.is_member(community_id)
    and created_by = auth.uid()
  );

create policy room_bookings_update on public.room_bookings
  for update
  using (created_by = auth.uid() or public.is_admin_or_junta(community_id))
  with check (created_by = auth.uid() or public.is_admin_or_junta(community_id));

create policy room_bookings_delete on public.room_bookings
  for delete using (public.has_role(community_id, 'admin_finca'));

create policy room_booking_participants_select on public.room_booking_participants
  for select using (public.is_member(community_id));

create policy room_booking_participants_modify on public.room_booking_participants
  for all
  using (
    public.is_admin_or_junta(community_id)
    or exists (
      select 1 from public.room_bookings b
       where b.id = room_booking_participants.booking_id
         and b.created_by = auth.uid()
    )
  )
  with check (
    public.is_admin_or_junta(community_id)
    or exists (
      select 1 from public.room_bookings b
       where b.id = room_booking_participants.booking_id
         and b.created_by = auth.uid()
    )
  );
