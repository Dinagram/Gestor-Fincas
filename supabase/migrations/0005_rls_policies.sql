-- =====================================================================
-- 0005 — Enable + force RLS on all public tables, declare policies
-- =====================================================================
-- Rule of thumb:
--   SELECT  → is_member(community_id)
--   INSERT  → is_member + check author identity
--   UPDATE  → role-gated (admin_finca/junta or author)
--   DELETE  → typically admin_finca only
-- =====================================================================

-- ---- Enable + FORCE RLS on every table ------------------------------
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

-- =====================================================================
-- communities
-- =====================================================================
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

-- =====================================================================
-- units
-- =====================================================================
create policy units_select on public.units
  for select using (public.is_member(community_id));

create policy units_modify on public.units
  for all
  using (public.has_role(community_id, 'admin_finca') or public.is_platform_admin())
  with check (public.has_role(community_id, 'admin_finca') or public.is_platform_admin());

-- =====================================================================
-- profiles
-- =====================================================================
-- A user sees their own profile, plus profiles of co-members of any
-- community they share.
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

-- =====================================================================
-- community_members
-- =====================================================================
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

-- =====================================================================
-- invitations
-- =====================================================================
create policy invitations_select on public.invitations
  for select using (public.is_admin_or_junta(community_id));

create policy invitations_modify on public.invitations
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

-- =====================================================================
-- community_counters — written only via SECURITY DEFINER trigger
-- =====================================================================
create policy counters_select on public.community_counters
  for select using (public.is_admin_or_junta(community_id));
-- no insert/update/delete policies → trigger (SECURITY DEFINER) bypasses

-- =====================================================================
-- issues
-- =====================================================================
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

-- =====================================================================
-- issue_comments
-- =====================================================================
create policy issue_comments_select on public.issue_comments
  for select using (public.is_member(community_id));

-- Two flavours of allowed inserts:
--   1) Normal comment: author = self, not is_system.
--   2) System comment: only valid through admin/junta context (the
--      status-change trigger inserts these on behalf of the actor).
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

-- =====================================================================
-- issue_attachments
-- =====================================================================
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

-- =====================================================================
-- issue_status_history — read-only for clients (trigger writes)
-- =====================================================================
create policy issue_history_select on public.issue_status_history
  for select using (public.is_member(community_id));
-- no other policies → only SECURITY DEFINER triggers can write

-- =====================================================================
-- issue_supports
-- =====================================================================
create policy issue_supports_select on public.issue_supports
  for select using (public.is_member(community_id));

create policy issue_supports_insert on public.issue_supports
  for insert with check (
    public.is_member(community_id) and profile_id = auth.uid()
  );

create policy issue_supports_delete on public.issue_supports
  for delete using (profile_id = auth.uid());

-- =====================================================================
-- polls + options
-- =====================================================================
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

-- =====================================================================
-- poll_votes — inquilino CANNOT vote on 'budget' polls
-- =====================================================================
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

-- =====================================================================
-- announcements + reads
-- =====================================================================
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

-- =====================================================================
-- documents
-- =====================================================================
create policy documents_select on public.documents
  for select using (public.is_member(community_id));

create policy documents_modify on public.documents
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

-- =====================================================================
-- budget_*
-- =====================================================================
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
