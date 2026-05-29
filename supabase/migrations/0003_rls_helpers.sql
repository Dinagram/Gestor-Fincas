-- =====================================================================
-- 0003 — RLS helper functions
-- =====================================================================
-- All functions are STABLE + SECURITY DEFINER + set search_path = public.
-- Marked SECURITY DEFINER so they bypass RLS on community_members
-- itself (otherwise reads would recurse). The functions are pure reads
-- and only expose booleans / role, not data.
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
