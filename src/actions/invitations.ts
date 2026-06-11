'use server';

import { revalidatePath } from 'next/cache';

import { getUserRole } from '@/lib/auth/get-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendInvitationEmail } from '@/lib/email';
import { pisoSchema, parsePiso } from '@/lib/validators/piso';
import type { Database } from '@/types/database';

type MemberRole = Database['public']['Enums']['member_role'];

export type ActionResult<T = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

// ─── Helpers ────────────────────────────────────────────────────────────────

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

// =====================================================================
// createInvitation — admin_finca sends an invite to an email
// =====================================================================
export async function createInvitation(
  communityId: string,
  input: { email: string; role: MemberRole; piso: string },
): Promise<ActionResult<{ inviteUrl: string }>> {
  let user, role: MemberRole;
  try {
    ({ user, role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: 'No tienes acceso a esta comunidad' };
  }

  if (!canDo(role, 'member.invite')) {
    return { ok: false, error: 'No tienes permisos para invitar usuarios' };
  }

  // Superadmin can never be assigned through invitations
  if (input.role === 'superadmin') {
    return { ok: false, error: 'El rol superadmin no puede asignarse desde aquí' };
  }

  // Validate piso format
  const pisoResult = pisoSchema.safeParse(input.piso);
  if (!pisoResult.success) {
    return { ok: false, error: pisoResult.error.errors[0]?.message ?? 'Formato de piso inválido' };
  }
  const { floor, door } = parsePiso(input.piso);

  const email = input.email.trim().toLowerCase();

  const supabase = await createServerClient();

  // Look up the unit by floor + door
  const { data: unit } = await supabase
    .from('units')
    .select('id')
    .eq('community_id', communityId)
    .eq('floor', floor)
    .eq('door', door)
    .eq('type', 'vivienda')
    .maybeSingle();

  if (!unit) {
    return { ok: false, error: `No existe ninguna vivienda en el piso ${input.piso.toUpperCase()} en esta comunidad` };
  }

  // Query by profile email match
  const { data: existingByEmail } = await supabase
    .from('community_members')
    .select('id, profile_id, profiles!inner(email)')
    .eq('community_id', communityId)
    .eq('status', 'active');

  const alreadyMember = existingByEmail?.some(
    (m) => (m.profiles as unknown as { email: string } | null)?.email === email,
  );
  if (alreadyMember) {
    return { ok: false, error: 'Este usuario ya es miembro de la comunidad' };
  }

  // Check for existing pending invitation
  const { data: pendingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('community_id', communityId)
    .eq('email', email)
    .is('used_at', null)
    .is('cancelled_at', null)
    .maybeSingle();

  if (pendingInvite) {
    return { ok: false, error: 'Ya existe una invitación pendiente para este correo' };
  }

  // Fetch inviter profile for the email
  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .maybeSingle();

  // Fetch community name for the email
  const { data: community } = await supabase
    .from('communities')
    .select('name')
    .eq('id', communityId)
    .maybeSingle();

  // Create the invitation
  const { data: invitation, error: insertError } = await supabase
    .from('invitations')
    .insert({
      community_id: communityId,
      email,
      role: input.role,
      unit_id: unit.id,
      invited_by: user.id,
    })
    .select('token')
    .single();

  if (insertError || !invitation) {
    return { ok: false, error: 'No se pudo crear la invitación' };
  }

  const inviteUrl = `${siteUrl()}/invite/${invitation.token}`;

  // Send invitation email (best-effort — don't fail the action if email fails)
  if (community && inviterProfile) {
    try {
      await sendInvitationEmail({
        to: email,
        communityName: community.name,
        inviterName: inviterProfile.full_name ?? 'El administrador',
        inviteUrl,
        expiresAt: '', // will use 14-day default
      });
    } catch {
      // Email failure is non-fatal; admin can copy the link manually
    }
  }

  revalidatePath(`/c/${communityId}/usuarios`);
  return { ok: true, inviteUrl };
}

// =====================================================================
// acceptInvitation — PUBLIC (no session required), uses admin client
// =====================================================================
export async function acceptInvitation(
  token: string,
  input: { fullName: string; phone: string; password: string },
): Promise<ActionResult<{ email: string; communityId: string; existingUser: boolean }>> {
  const admin = createAdminClient();

  // Fetch and validate invitation
  const { data: invitation, error: fetchError } = await admin
    .from('invitations')
    .select('id, email, role, community_id, unit_id, expires_at, used_at, cancelled_at, invited_by, created_at')
    .eq('token', token)
    .maybeSingle();

  if (fetchError || !invitation) {
    return { ok: false, error: 'Invitación no encontrada' };
  }
  if (invitation.used_at) {
    return { ok: false, error: 'Esta invitación ya fue utilizada' };
  }
  if (invitation.cancelled_at) {
    return { ok: false, error: 'Esta invitación fue cancelada' };
  }
  if (new Date(invitation.expires_at) < new Date()) {
    return { ok: false, error: 'Esta invitación ha caducado. Solicita una nueva al administrador.' };
  }

  // Create or find the auth user
  let userId: string;
  let existingUser = false;

  const { data: createData, error: createError } = await admin.auth.admin.createUser({
    email: invitation.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });

  if (createError) {
    if (createError.status === 422 || createError.message.toLowerCase().includes('already registered')) {
      // User already exists — find them without changing their password
      existingUser = true;
      const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = listData?.users.find((u) => u.email === invitation.email);
      if (!found) {
        return { ok: false, error: 'No se pudo identificar al usuario existente' };
      }
      userId = found.id;
    } else {
      return { ok: false, error: 'No se pudo crear la cuenta. Inténtalo de nuevo.' };
    }
  } else {
    userId = createData.user.id;
  }

  // Upsert profile (trigger may not have fired yet for new users)
  await admin
    .from('profiles')
    .upsert(
      {
        id: userId,
        email: invitation.email,
        full_name: input.fullName,
        phone: input.phone || null,
      },
      { onConflict: 'id' },
    );

  // Insert community membership
  const { error: memberError } = await admin
    .from('community_members')
    .upsert(
      {
        community_id: invitation.community_id,
        profile_id: userId,
        unit_id: invitation.unit_id,
        role: invitation.role,
        status: 'active',
        joined_at: new Date().toISOString(),
        invited_by: invitation.invited_by,
        invited_at: invitation.created_at,
      },
      { onConflict: 'community_id,profile_id,unit_id' },
    );

  if (memberError) {
    return { ok: false, error: 'No se pudo asociar el usuario a la comunidad' };
  }

  // Mark invitation as used
  await admin
    .from('invitations')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invitation.id);

  return {
    ok: true,
    email: invitation.email,
    communityId: invitation.community_id,
    existingUser,
  };
}

// =====================================================================
// cancelInvitation — admin_finca soft-cancels a pending invitation
// =====================================================================
export async function cancelInvitation(
  communityId: string,
  invitationId: string,
): Promise<ActionResult> {
  let role: MemberRole;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: 'No tienes acceso a esta comunidad' };
  }

  if (!canDo(role, 'member.invite')) {
    return { ok: false, error: 'No tienes permisos para cancelar invitaciones' };
  }

  const supabase = await createServerClient();

  const { data: invite } = await supabase
    .from('invitations')
    .select('id, used_at')
    .eq('id', invitationId)
    .eq('community_id', communityId)
    .maybeSingle();

  if (!invite) {
    return { ok: false, error: 'Invitación no encontrada' };
  }
  if (invite.used_at) {
    return { ok: false, error: 'No se puede cancelar una invitación ya aceptada' };
  }

  const { error } = await supabase
    .from('invitations')
    .update({ cancelled_at: new Date().toISOString() })
    .eq('id', invitationId)
    .eq('community_id', communityId);

  if (error) {
    return { ok: false, error: 'No se pudo cancelar la invitación' };
  }

  revalidatePath(`/c/${communityId}/usuarios`);
  return { ok: true };
}

// =====================================================================
// resendInvitation — cancels old invite, creates a fresh one
// =====================================================================
export async function resendInvitation(
  communityId: string,
  invitationId: string,
): Promise<ActionResult<{ inviteUrl: string }>> {
  let user, role: MemberRole;
  try {
    ({ user, role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: 'No tienes acceso a esta comunidad' };
  }

  if (!canDo(role, 'member.invite')) {
    return { ok: false, error: 'No tienes permisos para reenviar invitaciones' };
  }

  const supabase = await createServerClient();

  const { data: original } = await supabase
    .from('invitations')
    .select('id, email, role, unit_id, used_at')
    .eq('id', invitationId)
    .eq('community_id', communityId)
    .maybeSingle();

  if (!original) {
    return { ok: false, error: 'Invitación no encontrada' };
  }
  if (original.used_at) {
    return { ok: false, error: 'Esta invitación ya fue aceptada, no se puede reenviar' };
  }

  // Soft-cancel the original
  await supabase
    .from('invitations')
    .update({ cancelled_at: new Date().toISOString() })
    .eq('id', invitationId);

  // Create a fresh invitation
  const { data: newInvite, error: insertError } = await supabase
    .from('invitations')
    .insert({
      community_id: communityId,
      email: original.email,
      role: original.role,
      unit_id: original.unit_id,
      invited_by: user.id,
    })
    .select('token')
    .single();

  if (insertError || !newInvite) {
    return { ok: false, error: 'No se pudo crear la nueva invitación' };
  }

  const inviteUrl = `${siteUrl()}/invite/${newInvite.token}`;

  // Fetch community name for email
  const { data: community } = await supabase
    .from('communities')
    .select('name')
    .eq('id', communityId)
    .maybeSingle();

  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (community) {
    try {
      await sendInvitationEmail({
        to: original.email,
        communityName: community.name,
        inviterName: inviterProfile?.full_name ?? 'El administrador',
        inviteUrl,
        expiresAt: '',
      });
    } catch {
      // Non-fatal
    }
  }

  revalidatePath(`/c/${communityId}/usuarios`);
  return { ok: true, inviteUrl };
}

// =====================================================================
// listInvitations — all invitations for a community (latest first)
// =====================================================================
export type InvitationRow = {
  id: string;
  email: string;
  role: MemberRole;
  token: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  cancelledAt: string | null;
  inviterName: string | null;
};

export async function listInvitations(
  communityId: string,
): Promise<ActionResult<{ invitations: InvitationRow[] }>> {
  let role: MemberRole;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: 'No tienes acceso a esta comunidad' };
  }

  if (!canDo(role, 'member.invite')) {
    return { ok: false, error: 'No tienes permisos para ver las invitaciones' };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('invitations')
    .select('id, email, role, token, created_at, expires_at, used_at, cancelled_at, invited_by, profiles(full_name)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) {
    return { ok: false, error: 'No se pudieron cargar las invitaciones' };
  }

  const invitations: InvitationRow[] = (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    token: row.token,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    cancelledAt: row.cancelled_at,
    inviterName: (row.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
  }));

  return { ok: true, invitations };
}
