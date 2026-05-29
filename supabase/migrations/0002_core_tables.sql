-- =====================================================================
-- 0002 — Core tenancy tables
-- =====================================================================
-- communities, units, profiles, community_members, invitations,
-- community_counters (issue codes). Trigger handle_new_user mirrors
-- auth.users into public.profiles.
-- =====================================================================

-- ---------------------------------------------------------------------
-- communities — root tenant entity
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- units — physical units inside a community
-- ---------------------------------------------------------------------
create table public.units (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  floor         text not null,                -- '1', '2', 'bajo', 'atico', '-1'
  door          text not null,                -- 'A','B','C','D','G1', etc.
  type          unit_type not null default 'vivienda',
  surface_m2    numeric(7, 2),
  coefficient   numeric(6, 4) not null default 0,
  created_at    timestamptz not null default now(),
  unique (community_id, floor, door, type)
);

create index idx_units_community on public.units (community_id);

-- ---------------------------------------------------------------------
-- profiles — mirror of auth.users with personal data
-- ---------------------------------------------------------------------
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

-- Auto-create profile when a new auth user is created.
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

-- ---------------------------------------------------------------------
-- community_members — user ↔ community with role (tenancy join)
-- ---------------------------------------------------------------------
create table public.community_members (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  unit_id       uuid references public.units(id) on delete set null,
  role          member_role not null,
  status        member_status not null default 'active',
  invited_by    uuid references public.profiles(id),
  invited_at    timestamptz,
  joined_at     timestamptz default now(),
  unique (community_id, profile_id, unit_id)
);

create index idx_members_community         on public.community_members (community_id);
create index idx_members_profile_community on public.community_members (profile_id, community_id);
create index idx_members_profile_active    on public.community_members (profile_id) where status = 'active';

-- ---------------------------------------------------------------------
-- invitations — pending invites with single-use token
-- ---------------------------------------------------------------------
create table public.invitations (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  email         citext not null,
  role          member_role not null,
  unit_id       uuid references public.units(id) on delete set null,
  token         text not null unique default encode(gen_random_bytes(24), 'hex'),
  expires_at    timestamptz not null default (now() + interval '14 days'),
  used_at       timestamptz,
  invited_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now()
);

create index idx_invitations_community on public.invitations (community_id);
create index idx_invitations_pending   on public.invitations (email) where used_at is null;

-- ---------------------------------------------------------------------
-- community_counters — per-community sequences (e.g. INC-XXX)
-- ---------------------------------------------------------------------
create table public.community_counters (
  community_id  uuid not null references public.communities(id) on delete cascade,
  scope         text not null,
  last_value    integer not null default 0,
  primary key (community_id, scope)
);
