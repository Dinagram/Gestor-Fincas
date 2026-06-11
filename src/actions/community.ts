'use server';

import { revalidatePath } from 'next/cache';

import { ERR_NO_ACCESS, getUserRole } from '@/lib/auth/get-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import { updateCommunitySchema } from '@/lib/validators/community';

export type ActionResult<T = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

export async function updateCommunity(
  communityId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = updateCommunitySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  let role;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }

  if (!canDo(role, 'community.edit')) {
    return { ok: false, error: 'Solo el administrador puede editar la configuración' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('communities')
    .update({
      name: parsed.data.name,
      address: parsed.data.address,
      city: parsed.data.city ?? null,
      province: parsed.data.province ?? null,
      postal_code: parsed.data.postal_code || null,
      cif: parsed.data.cif ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', communityId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/c/${communityId}/ajustes`);
  revalidatePath(`/c/${communityId}`);
  return { ok: true };
}
