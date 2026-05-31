import 'server-only';

import { cache } from 'react';

import { createServerClient } from '@/lib/supabase/server';

/**
 * Número de incidencias abiertas en la comunidad.
 * Cacheado por (communityId): el layout y el dashboard comparten el resultado
 * sin hacer dos llamadas a la base de datos.
 */
export const getOpenIssueCount = cache(async (communityId: string): Promise<number> => {
  const supabase = await createServerClient();
  const { count } = await supabase
    .from('issues')
    .select('id', { count: 'exact', head: true })
    .eq('community_id', communityId)
    .in('status', ['abierta', 'en_revision', 'en_curso']);
  return count ?? 0;
});

/**
 * Número de votaciones activas en la comunidad.
 * Cacheado por (communityId): el layout y el dashboard comparten el resultado.
 */
export const getActivePollCount = cache(async (communityId: string): Promise<number> => {
  const supabase = await createServerClient();
  const { count } = await supabase
    .from('polls')
    .select('id', { count: 'exact', head: true })
    .eq('community_id', communityId)
    .eq('status', 'active');
  return count ?? 0;
});
