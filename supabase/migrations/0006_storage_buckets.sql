-- =====================================================================
-- 0006 — Storage buckets + policies
-- =====================================================================
-- Path convention: {community_id}/{resource_type}/{resource_id}/{filename}
-- Avatars are an exception: {user_id}/{filename}
-- =====================================================================

insert into storage.buckets (id, name, public)
values
  ('incidence-attachments', 'incidence-attachments', false),
  ('documents',             'documents',             false),
  ('announcement-files',    'announcement-files',    false),
  ('avatars',               'avatars',               true)
on conflict (id) do nothing;

-- Helper: extract the community_id from the first segment of storage path.
create or replace function public.storage_community_id(_name text)
returns uuid
language sql
immutable
as $$
  select nullif(split_part(_name, '/', 1), '')::uuid;
$$;

-- =====================================================================
-- incidence-attachments
-- =====================================================================
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

-- =====================================================================
-- documents
-- =====================================================================
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

-- =====================================================================
-- announcement-files
-- =====================================================================
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

-- =====================================================================
-- avatars — public read; user can only write into their own folder
-- =====================================================================
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
