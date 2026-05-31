'use server';

import { revalidatePath } from 'next/cache';

import { ERR_NO_ACCESS, getUserRole } from '@/lib/auth/get-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import { castVoteSchema, createPollSchema } from '@/lib/validators/poll';
import type { Database } from '@/types/database';

export type ActionResult<T = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

type PollStatus = Database['public']['Enums']['poll_status'];
type PollType = Database['public']['Enums']['poll_type'];

// ====================================================================
// Create poll (junta + admin_finca only) — starts as draft
// ====================================================================
export async function createPoll(
  communityId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createPollSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  let user, role;
  try {
    ({ user, role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!canDo(role, 'poll.create')) {
    return { ok: false, error: 'Solo la junta o el administrador pueden crear votaciones' };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('polls')
    .insert({
      community_id: communityId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      type: parsed.data.type as PollType,
      status: 'draft',
      starts_at: parsed.data.starts_at,
      ends_at: parsed.data.ends_at,
      quorum_percent: parsed.data.quorum_percent,
      amount: parsed.data.amount ?? null,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Error al crear la votación' };
  }

  revalidatePath(`/c/${communityId}/votaciones`);
  return { ok: true, id: data.id };
}

// ====================================================================
// Activate poll: draft → active (junta + admin_finca)
// ====================================================================
export async function activatePoll(
  communityId: string,
  pollId: string,
): Promise<ActionResult> {
  let role;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!canDo(role, 'poll.create')) {
    return { ok: false, error: 'Sin permisos para activar votaciones' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('polls')
    .update({ status: 'active' as PollStatus })
    .eq('id', pollId)
    .eq('community_id', communityId)
    .eq('status', 'draft');

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/votaciones`);
  revalidatePath(`/c/${communityId}/votaciones/${pollId}`);
  return { ok: true };
}

// ====================================================================
// Cast vote (any member with permission)
// ====================================================================
export async function castVote(
  communityId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = castVoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  let user, role;
  try {
    ({ user, role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }

  const supabase = await createServerClient();

  // Verify poll is active and exists
  const { data: poll } = await supabase
    .from('polls')
    .select('id, type, status, starts_at, ends_at')
    .eq('id', parsed.data.pollId)
    .eq('community_id', communityId)
    .maybeSingle();

  if (!poll) return { ok: false, error: 'Votación no encontrada' };
  if (poll.status !== 'active') return { ok: false, error: 'La votación no está activa' };

  const now = new Date();
  if (now < new Date(poll.starts_at) || now > new Date(poll.ends_at)) {
    return { ok: false, error: 'La votación no está en período de voto' };
  }

  // Budget polls: inquilinos cannot vote
  if (poll.type === 'budget' && !canDo(role, 'poll.vote_economic')) {
    return { ok: false, error: 'Los inquilinos no pueden votar en votaciones de presupuesto' };
  }

  const { error } = await supabase.from('poll_votes').upsert(
    {
      poll_id: parsed.data.pollId,
      profile_id: user.id,
      community_id: communityId,
      choice: parsed.data.choice,
      weight: 1,
    },
    { onConflict: 'poll_id,profile_id' },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/votaciones/${parsed.data.pollId}`);
  revalidatePath(`/c/${communityId}/votaciones`);
  return { ok: true };
}

// ====================================================================
// Close poll: active → closed (junta + admin_finca)
// ====================================================================
export async function closePoll(
  communityId: string,
  pollId: string,
): Promise<ActionResult> {
  let role;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!canDo(role, 'poll.create')) {
    return { ok: false, error: 'Sin permisos' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('polls')
    .update({ status: 'closed' as PollStatus })
    .eq('id', pollId)
    .eq('community_id', communityId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/votaciones`);
  revalidatePath(`/c/${communityId}/votaciones/${pollId}`);
  return { ok: true };
}

// ====================================================================
// Cancel poll (junta + admin_finca)
// ====================================================================
export async function cancelPoll(
  communityId: string,
  pollId: string,
): Promise<ActionResult> {
  let role;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!canDo(role, 'poll.create')) {
    return { ok: false, error: 'Sin permisos' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('polls')
    .update({ status: 'cancelled' as PollStatus })
    .eq('id', pollId)
    .eq('community_id', communityId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/votaciones`);
  revalidatePath(`/c/${communityId}/votaciones/${pollId}`);
  return { ok: true };
}
