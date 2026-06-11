'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/require-user';
import { createServerClient } from '@/lib/supabase/server';

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
});

export type ActionResult<T = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

export async function updateProfile(
  communityId: string,
  input: { fullName: string; phone: string },
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = await createServerClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
    })
    .eq('id', user.id);

  if (error) {
    return { ok: false, error: 'No se pudo actualizar el perfil' };
  }

  revalidatePath(`/c/${communityId}/perfil`);
  return { ok: true };
}
