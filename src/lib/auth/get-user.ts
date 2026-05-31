import 'server-only';

import { cache } from 'react';
import type { User } from '@supabase/supabase-js';

import type { Database } from '@/types/database';
import { createServerClient } from '@/lib/supabase/server';

type MemberRole = Database['public']['Enums']['member_role'];

/** Mensaje de error canónico para acceso denegado a una comunidad. */
export const ERR_NO_ACCESS = 'No tienes acceso a esta comunidad';

// Un único cliente Supabase por server request (leer cookies es barato,
// pero evitar instancias duplicadas es más limpio).
const getClient = cache(async () => createServerClient());

/**
 * Una sola llamada real a supabase.auth.getUser() por server request.
 * Todas las funciones del módulo comparten este resultado.
 */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await getClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

/**
 * Obtiene el usuario autenticado + su rol y vivienda en la comunidad.
 * Lanza un error si el usuario no está autenticado o no es miembro activo.
 * El resultado se cachea por (communityId) dentro del mismo request.
 */
export const getUserRole = cache(async (
  communityId: string,
): Promise<{ user: User; role: MemberRole; unitId: string | null }> => {
  const user = await getUser();
  if (!user) throw new Error('UNAUTHENTICATED');

  const supabase = await getClient();
  const { data: membership } = await supabase
    .from('community_members')
    .select('role, unit_id')
    .eq('profile_id', user.id)
    .eq('community_id', communityId)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership) throw new Error('NOT_A_MEMBER');
  return { user, role: membership.role as MemberRole, unitId: membership.unit_id };
});

/** Perfil del usuario autenticado. Cacheado por request. */
export const getProfile = cache(async () => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await getClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return data;
});

/** Todas las comunidades activas del usuario. Cacheado por request. */
export const getMemberships = cache(async () => {
  const user = await getUser();
  if (!user) return [];

  const supabase = await getClient();
  const { data } = await supabase
    .from('community_members')
    .select('community_id, role, status, communities(id, name)')
    .eq('profile_id', user.id)
    .eq('status', 'active');

  return data ?? [];
});
