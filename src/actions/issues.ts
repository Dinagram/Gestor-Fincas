'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ERR_NO_ACCESS, getUserRole } from '@/lib/auth/get-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import {
  changeStatusSchema,
  commentIssueSchema,
  createIssueSchema,
} from '@/lib/validators/issue';
import type { Database } from '@/types/database';

// ====================================================================
// Create issue
// ====================================================================
export type CreateIssueResult = { ok: true; id: string } | { ok: false; error: string };

export async function createIssue(
  communityId: string,
  input: unknown,
): Promise<CreateIssueResult> {
  const parsed = createIssueSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  let user, role;
  try {
    ({ user, role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!canDo(role, 'issue.create')) {
    return { ok: false, error: 'Tu rol no permite crear incidencias' };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('issues')
    .insert({
      community_id: communityId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      category: parsed.data.category as Database['public']['Enums']['issue_category'],
      priority: parsed.data.priority as Database['public']['Enums']['issue_priority'],
      location: parsed.data.location || null,
      created_by: user.id,
      code: '', // trg_issue_assign_code (BEFORE INSERT) overwrites this with INC-XXX
    })
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'No se pudo crear la incidencia' };
  }

  revalidatePath(`/c/${communityId}/incidencias`);
  redirect(`/c/${communityId}/incidencias/${data.id}`);
}

// ====================================================================
// Add comment
// ====================================================================
export async function commentIssue(input: unknown) {
  const parsed = commentIssueSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'No autenticado' };

  // Fetch the issue to capture community_id (also enforces RLS).
  const { data: issue } = await supabase
    .from('issues')
    .select('community_id')
    .eq('id', parsed.data.issueId)
    .maybeSingle();
  if (!issue) return { ok: false, error: 'Incidencia no encontrada' };

  const { error } = await supabase.from('issue_comments').insert({
    issue_id: parsed.data.issueId,
    community_id: issue.community_id,
    author_id: user.id,
    body: parsed.data.body,
    is_system: false,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${issue.community_id}/incidencias/${parsed.data.issueId}`);
  return { ok: true as const };
}

// ====================================================================
// Change status
// ====================================================================
export async function changeIssueStatus(input: unknown) {
  const parsed = changeStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = await createServerClient();
  const { data: issue } = await supabase
    .from('issues')
    .select('community_id, status')
    .eq('id', parsed.data.issueId)
    .maybeSingle();
  if (!issue) return { ok: false, error: 'Incidencia no encontrada' };

  let role;
  try {
    ({ role } = await getUserRole(issue.community_id));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!canDo(role, 'issue.change_status')) {
    return { ok: false, error: 'Solo administrador o junta pueden cambiar el estado' };
  }

  if (issue.status === parsed.data.newStatus) {
    return { ok: true as const };
  }

  const { error } = await supabase
    .from('issues')
    .update({ status: parsed.data.newStatus as Database['public']['Enums']['issue_status'] })
    .eq('id', parsed.data.issueId);
  if (error) return { ok: false, error: error.message };

  // The DB trigger `log_issue_status_change` already records this in
  // issue_status_history AND appends a system message to the chat.

  revalidatePath(`/c/${issue.community_id}/incidencias/${parsed.data.issueId}`);
  revalidatePath(`/c/${issue.community_id}/incidencias`);
  return { ok: true as const };
}

// ====================================================================
// Toggle support
// ====================================================================
export async function toggleIssueSupport(issueId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'No autenticado' };

  const { data: issue } = await supabase
    .from('issues')
    .select('community_id')
    .eq('id', issueId)
    .maybeSingle();
  if (!issue) return { ok: false, error: 'Incidencia no encontrada' };

  const { data: existing } = await supabase
    .from('issue_supports')
    .select('issue_id')
    .eq('issue_id', issueId)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('issue_supports')
      .delete()
      .eq('issue_id', issueId)
      .eq('profile_id', user.id);
  } else {
    await supabase.from('issue_supports').insert({
      issue_id: issueId,
      profile_id: user.id,
      community_id: issue.community_id,
    });
  }

  revalidatePath(`/c/${issue.community_id}/incidencias/${issueId}`);
  return { ok: true, supported: !existing };
}

// ====================================================================
// Sign attachment URL
// ====================================================================
export async function signAttachmentUrl(path: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.storage
    .from('incidence-attachments')
    .createSignedUrl(path, 60);
  if (error || !data) return { ok: false, error: error?.message ?? 'Error firmando URL' };
  return { ok: true, url: data.signedUrl };
}

// ====================================================================
// Register an uploaded attachment row (after browser upload)
// ====================================================================
export async function registerAttachment(input: {
  issueId: string;
  storagePath: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'No autenticado' };

  const { data: issue } = await supabase
    .from('issues')
    .select('community_id')
    .eq('id', input.issueId)
    .maybeSingle();
  if (!issue) return { ok: false, error: 'Incidencia no encontrada' };

  const { error } = await supabase.from('issue_attachments').insert({
    issue_id: input.issueId,
    community_id: issue.community_id,
    uploader_id: user.id,
    storage_path: input.storagePath,
    file_name: input.fileName,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${issue.community_id}/incidencias/${input.issueId}`);
  return { ok: true as const };
}
