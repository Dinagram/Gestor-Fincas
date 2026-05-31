'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { ERR_NO_ACCESS, getUserRole } from '@/lib/auth/get-user';
import { sendAnnouncementEmail } from '@/lib/email';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import { createAnnouncementSchema } from '@/lib/validators/announcement';

export type ActionResult<T = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

// ====================================================================
// Create announcement (admin_finca only)
// ====================================================================
export async function createAnnouncement(
  communityId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createAnnouncementSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  let user, role;
  try {
    ({ user, role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!canDo(role, 'announcement.create')) {
    return { ok: false, error: 'Solo el administrador puede crear comunicados' };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      community_id: communityId,
      title: parsed.data.title,
      body: parsed.data.body,
      type: parsed.data.type as 'aviso' | 'convocatoria' | 'resolucion' | 'urgente',
      requires_ack: parsed.data.requires_ack,
      sent_by: user.id,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Error al crear el comunicado' };
  }

  // Send email notification to all active community members (fire-and-forget)
  try {
    // Two separate queries to avoid ambiguous FK on community_members → profiles
    const [membersRes, communityRes, profileRes] = await Promise.all([
      supabase
        .from('community_members')
        .select('profile_id')
        .eq('community_id', communityId)
        .eq('status', 'active'),
      supabase
        .from('communities')
        .select('name')
        .eq('id', communityId)
        .single(),
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single(),
    ]);

    const profileIds = (membersRes.data ?? []).map((m: { profile_id: string }) => m.profile_id);
    let emails: string[] = [];
    if (profileIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('email')
        .in('id', profileIds);
      emails = (profilesData ?? [])
        .map((p: { email: string | null }) => p.email)
        .filter(Boolean) as string[];
    }

    if (emails.length > 0) {
      await sendAnnouncementEmail({
        to: emails,
        communityName: communityRes.data?.name ?? 'Tu comunidad',
        title: parsed.data.title,
        body: parsed.data.body,
        type: parsed.data.type,
        requiresAck: parsed.data.requires_ack,
        announcementUrl: `${process.env.NEXT_PUBLIC_APP_URL}/c/${communityId}/comunicados/${data.id}`,
        senderName: profileRes.data?.full_name ?? 'El administrador',
      });
    }
  } catch (emailErr) {
    console.error('[email] failed:', emailErr);
  }

  revalidatePath(`/c/${communityId}/comunicados`);
  return { ok: true, id: data.id };
}

// ====================================================================
// Mark announcement as read (any member)
// ====================================================================
export async function markAnnouncementRead(
  communityId: string,
  announcementId: string,
): Promise<ActionResult> {
  let user;
  try {
    ({ user } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from('announcement_reads').upsert(
    {
      announcement_id: announcementId,
      profile_id: user.id,
      community_id: communityId,
      read_at: new Date().toISOString(),
    },
    { onConflict: 'announcement_id,profile_id', ignoreDuplicates: true },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/comunicados`);
  return { ok: true };
}

// ====================================================================
// Acknowledge announcement (any member, only when requires_ack=true)
// ====================================================================
export async function acknowledgeAnnouncement(
  communityId: string,
  announcementId: string,
): Promise<ActionResult> {
  let user;
  try {
    ({ user } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }

  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    null;

  const supabase = await createServerClient();
  const now = new Date().toISOString();

  // Upsert: creates the read record if absent, always sets acknowledged_at
  const { error } = await supabase.from('announcement_reads').upsert(
    {
      announcement_id: announcementId,
      profile_id: user.id,
      community_id: communityId,
      read_at: now,
      acknowledged_at: now,
      acknowledged_from_ip: ip,
    },
    { onConflict: 'announcement_id,profile_id' },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/comunicados`);
  revalidatePath(`/c/${communityId}/comunicados/${announcementId}`);
  return { ok: true };
}

// ====================================================================
// Delete announcement (admin_finca only)
// ====================================================================
export async function deleteAnnouncement(
  communityId: string,
  announcementId: string,
): Promise<ActionResult> {
  let role;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!canDo(role, 'announcement.delete')) {
    return { ok: false, error: 'Solo el administrador puede eliminar comunicados' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', announcementId)
    .eq('community_id', communityId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/comunicados`);
  return { ok: true };
}
