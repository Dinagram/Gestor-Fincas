import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { getUser } from '@/lib/auth/get-user';
import { createServerClient } from '@/lib/supabase/server';
import type { Role } from '@/lib/permissions';

/**
 * Throws redirect to /login if no user. Returns the user otherwise.
 * Cacheado: si varias partes del render llaman a requireUser(), solo
 * se ejecuta una vez por request.
 */
export const requireUser = cache(async () => {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
});

/**
 * Throws redirect if user is not a member of the given community.
 * Returns { user, role }. Cacheado por (communityId) dentro del mismo request.
 */
export const requireMember = cache(async (communityId: string) => {
  const user = await getUser();
  if (!user) redirect('/login');

  const supabase = await createServerClient();
  const { data: membership } = await supabase
    .from('community_members')
    .select('role, status')
    .eq('profile_id', user.id)
    .eq('community_id', communityId)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership) redirect('/');
  return { user, role: membership.role as Role };
});

/**
 * Throws redirect if user is not at least one of the allowed roles.
 */
export async function requireRole(communityId: string, allowed: Role[]) {
  const { user, role } = await requireMember(communityId);
  if (!allowed.includes(role) && role !== 'superadmin') redirect(`/c/${communityId}/dashboard`);
  return { user, role };
}
