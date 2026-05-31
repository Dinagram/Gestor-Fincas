import { Building2, DoorOpen, Users } from 'lucide-react';

import { KpiCard } from '@/components/shared/kpi-card';
import { requireMember } from '@/lib/auth/require-user';
import { isAtLeast } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

import { DirectoryView } from './_components/directory-view';

type Params = Promise<{ communityId: string }>;

export type DirectoryEntry = {
  unitId: string;
  floor: string;
  door: string;
  unitType: Database['public']['Enums']['unit_type'];
  coefficient: number;
  memberId: string | null;
  memberRole: Database['public']['Enums']['member_role'] | null;
  memberStatus: Database['public']['Enums']['member_status'] | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
};

export default async function DirectorioPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const { role } = await requireMember(communityId);

  const supabase = await createServerClient();

  const [{ data: members }, { data: units }] = await Promise.all([
    supabase
      .from('community_members')
      .select('id, role, status, unit_id, profiles(id, full_name, email, avatar_url, phone)')
      .eq('community_id', communityId)
      .in('status', ['active', 'invited']),
    supabase
      .from('units')
      .select('id, floor, door, type, coefficient')
      .eq('community_id', communityId)
      .order('floor')
      .order('door'),
  ]);

  const membersByUnit = new Map<string, NonNullable<typeof members>[number]>();
  for (const m of members ?? []) {
    if (m.unit_id) membersByUnit.set(m.unit_id, m);
  }

  const entries: DirectoryEntry[] = (units ?? []).map((unit) => {
    const member = membersByUnit.get(unit.id);
    const rawProfile = member?.profiles;
    const profile = rawProfile
      ? Array.isArray(rawProfile)
        ? rawProfile[0]
        : rawProfile
      : null;
    return {
      unitId: unit.id,
      floor: unit.floor,
      door: unit.door,
      unitType: unit.type,
      coefficient: unit.coefficient,
      memberId: member?.id ?? null,
      memberRole: member?.role ?? null,
      memberStatus: member?.status ?? null,
      fullName: profile?.full_name ?? null,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    };
  });

  const totalVecinos = (members ?? []).filter((m) =>
    ['propietario', 'inquilino', 'junta'].includes(m.role),
  ).length;
  const ocupadas = entries.filter((e) => e.memberId !== null).length;
  const libres = entries.filter((e) => e.memberId === null && e.unitType === 'vivienda').length;
  const canSeeContact = isAtLeast(role, 'junta');

  return (
    <div className="container space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Directorio</h1>
          <p className="text-sm text-muted-foreground">
            {entries.length} unidades · {totalVecinos} vecinos registrados
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCard label="Vecinos activos" value={totalVecinos} icon={Users} tone="blue" />
        <KpiCard label="Ocupadas" value={ocupadas} icon={Building2} tone="green" />
        <KpiCard label="Libres" value={libres} icon={DoorOpen} tone="amber" />
      </div>

      <DirectoryView entries={entries} canSeeContact={canSeeContact} />
    </div>
  );
}
