'use server';

import { revalidatePath } from 'next/cache';

import { ERR_NO_ACCESS, getUserRole } from '@/lib/auth/get-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type MemberRole = Database['public']['Enums']['member_role'];

export type ImportRow = {
  floor: string;
  door: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'propietario' | 'inquilino';
  monthlyFee?: number;
};

export type ImportResult = {
  ok: boolean;
  imported: number;
  errors: string[];
};

export async function importMembers(
  communityId: string,
  rows: ImportRow[],
): Promise<ImportResult> {
  let role;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, imported: 0, errors: [ERR_NO_ACCESS] };
  }
  if (!canDo(role, 'announcement.create')) {
    return { ok: false, imported: 0, errors: ['Solo el administrador puede importar vecinos'] };
  }

  const supabase = await createServerClient();
  const errors: string[] = [];
  let imported = 0;

  for (const row of rows) {
    const label = `${row.floor}º${row.door} (${row.email})`;

    // 1. Buscar la unidad
    const { data: unit } = await supabase
      .from('units')
      .select('id')
      .eq('community_id', communityId)
      .eq('floor', row.floor)
      .eq('door', row.door)
      .maybeSingle();

    if (!unit) {
      errors.push(`${label}: unidad no encontrada`);
      continue;
    }

    // 2. Buscar perfil por email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', row.email.trim().toLowerCase())
      .maybeSingle();

    if (!profile) {
      errors.push(`${label}: no existe ningún usuario con el email "${row.email}"`);
      continue;
    }

    // 3. Upsert en community_members
    const { error } = await supabase
      .from('community_members')
      .upsert(
        {
          community_id: communityId,
          profile_id: profile.id,
          unit_id: unit.id,
          role: row.role as MemberRole,
          status: 'active',
          joined_at: new Date().toISOString(),
          monthly_fee: row.monthlyFee ?? 0,
          payment_status: 'al_dia',
        },
        { onConflict: 'community_id,profile_id,unit_id' },
      );

    if (error) {
      errors.push(`${label}: ${error.message}`);
    } else {
      imported++;
    }
  }

  revalidatePath(`/c/${communityId}/directorio`);
  return { ok: errors.length === 0, imported, errors };
}

// ── Actualizar datos de un vecino ────────────────────────────────────────────

export type UpdateMemberInput = {
  fullName: string;
  phone: string;
  role: 'propietario' | 'inquilino' | 'junta' | 'admin_finca';
  monthlyFee: number;
  paymentStatus: 'al_dia' | 'moroso' | 'pendiente';
  unitId: string | null;
};

export async function updateMember(
  communityId: string,
  memberId: string,
  profileId: string,
  input: UpdateMemberInput,
): Promise<ImportResult> {
  let role;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, imported: 0, errors: [ERR_NO_ACCESS] };
  }
  if (!canDo(role, 'community.edit')) {
    return { ok: false, imported: 0, errors: ['Solo el administrador puede editar vecinos'] };
  }

  // Guard: superadmin role cannot be assigned through this action
  if ((input.role as string) === 'superadmin') {
    return { ok: false, imported: 0, errors: ['El rol superadmin no puede asignarse desde aquí'] };
  }

  const supabase = await createServerClient();

  // Guard: superadmin members cannot be modified through this action
  const { data: target } = await supabase
    .from('community_members')
    .select('role, unit_id')
    .eq('id', memberId)
    .eq('community_id', communityId)
    .maybeSingle();

  if (target?.role === 'superadmin') {
    return { ok: false, imported: 0, errors: ['El rol de superadministrador no puede modificarse desde aquí'] };
  }

  // If unit is changing, check that the target unit is not already occupied by another member
  const unitChanging = input.unitId !== (target?.unit_id ?? null);
  if (unitChanging && input.unitId !== null) {
    const { data: occupant } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('unit_id', input.unitId)
      .eq('status', 'active')
      .neq('id', memberId)
      .maybeSingle();

    if (occupant) {
      return { ok: false, imported: 0, errors: ['Esta vivienda ya tiene un vecino asignado'] };
    }
  }

  const [profileError, memberError] = await Promise.all([
    supabase
      .from('profiles')
      .update({ full_name: input.fullName, phone: input.phone || null })
      .eq('id', profileId)
      .then((r) => r.error),
    supabase
      .from('community_members')
      .update({
        role: input.role as MemberRole,
        monthly_fee: input.monthlyFee,
        payment_status: input.paymentStatus,
        ...(unitChanging ? { unit_id: input.unitId } : {}),
      })
      .eq('id', memberId)
      .eq('community_id', communityId)
      .then((r) => r.error),
  ]);

  if (profileError || memberError) {
    return {
      ok: false,
      imported: 0,
      errors: [profileError?.message ?? memberError?.message ?? 'Error al guardar'],
    };
  }

  revalidatePath(`/c/${communityId}/directorio`);
  revalidatePath(`/c/${communityId}/usuarios`);
  return { ok: true, imported: 1, errors: [] };
}
