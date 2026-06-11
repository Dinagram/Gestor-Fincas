import { Building2, DoorOpen, Users } from 'lucide-react';

import { KpiCard } from '@/components/shared/kpi-card';
import { requireMember } from '@/lib/auth/require-user';
import { canDo, isAtLeast } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

import { DirectoryView } from './_components/directory-view';

type Params = Promise<{ communityId: string }>;

export type UnitOption = {
  id: string;
  floor: string;
  door: string;
};

export type DirectoryEntry = {
  unitId: string;
  floor: string;
  door: string;
  unitType: Database['public']['Enums']['unit_type'];
  coefficient: number;
  memberId: string | null;
  profileId: string | null;
  memberRole: Database['public']['Enums']['member_role'] | null;
  memberStatus: Database['public']['Enums']['member_status'] | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  joinedAt: string | null;
  monthlyFee: number;
  paymentStatus: 'al_dia' | 'moroso' | 'pendiente';
};

export default async function DirectorioPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const { role } = await requireMember(communityId);

  const supabase = await createServerClient();

  const [membersResult, unitsResult] = await Promise.all([
    supabase
      .from('community_members')
      .select('id, role, status, unit_id, profile_id, joined_at, monthly_fee, payment_status')
      .eq('community_id', communityId)
      .in('status', ['active', 'invited']),
    supabase
      .from('units')
      .select('id, floor, door, type, coefficient')
      .eq('community_id', communityId)
      .eq('type', 'vivienda'),
  ]);

  const members = membersResult.data ?? [];
  const units = unitsResult.data;

  // Fetch profiles separately to avoid PostgREST embed RLS issues
  const profileIds = [...new Set(members.map((m) => m.profile_id).filter(Boolean))] as string[];
  const { data: profileRows } = profileIds.length
    ? await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone')
        .in('id', profileIds)
    : { data: [] };

  const profilesById = new Map((profileRows ?? []).map((p) => [p.id, p]));

  const sortedUnits = (units ?? []).sort((a, b) => {
    const fa = parseInt(a.floor, 10);
    const fb = parseInt(b.floor, 10);
    return fa !== fb ? fa - fb : a.door.localeCompare(b.door);
  });

  const membersByUnit = new Map<string, NonNullable<typeof members>[number]>();
  for (const m of members ?? []) {
    if (m.unit_id) membersByUnit.set(m.unit_id, m);
  }

  const entries: DirectoryEntry[] = sortedUnits.map((unit) => {
    const member = membersByUnit.get(unit.id);
    const profile = member?.profile_id ? (profilesById.get(member.profile_id) ?? null) : null;
    return {
      unitId: unit.id,
      floor: unit.floor,
      door: unit.door,
      unitType: unit.type,
      coefficient: unit.coefficient ?? 0,
      memberId: member?.id ?? null,
      profileId: profile?.id ?? null,
      memberRole: member?.role ?? null,
      memberStatus: member?.status ?? null,
      fullName: profile?.full_name ?? null,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      joinedAt: member?.joined_at ?? null,
      monthlyFee: Number(member?.monthly_fee ?? 0),
      paymentStatus: (member?.payment_status ?? 'al_dia') as DirectoryEntry['paymentStatus'],
    };
  });

  const totalUnidades = entries.length;
  const ocupadas = entries.filter((e) => e.memberId !== null).length;
  const inquilinos = entries.filter((e) => e.memberRole === 'inquilino').length;
  const morosos = entries.filter((e) => e.paymentStatus === 'moroso').length;
  const totalVecinos = (members ?? []).filter((m) =>
    ['propietario', 'inquilino', 'junta'].includes(m.role),
  ).length;
  const canSeeContact = isAtLeast(role, 'junta');
  const canEditMembers = canDo(role, 'community.edit');

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Unidades" value={totalUnidades} icon={Building2} tone="blue" />
        <KpiCard label="Ocupadas" value={ocupadas} icon={DoorOpen} tone="green" />
        <KpiCard label="Inquilinos" value={inquilinos} icon={Users} tone="amber" />
        <KpiCard label="Morosos" value={morosos} icon={Building2} tone="red" />
      </div>

      <DirectoryView entries={entries} units={sortedUnits} canSeeContact={canSeeContact} canEditMembers={canEditMembers} communityId={communityId} viewerRole={role} />
    </div>
  );
}
