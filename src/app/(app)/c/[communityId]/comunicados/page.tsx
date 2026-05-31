import Link from 'next/link';
import { Megaphone, Plus } from 'lucide-react';

import type { AnnouncementWithRead } from './_components/announcement-card';
import { AnnouncementCard } from './_components/announcement-card';
import { AnnouncementFilters } from './_components/announcement-filters';
import { EmptyState } from '@/components/shared/empty-state';
import { RoleGate } from '@/components/shared/role-gate';
import { Button } from '@/components/ui/button';
import { requireMember } from '@/lib/auth/require-user';
import { createServerClient } from '@/lib/supabase/server';

type Params = Promise<{ communityId: string }>;
type SearchParams = Promise<{ tipo?: string; sin_leer?: string; acuse?: string }>;

export default async function ComunicadosPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { communityId } = await params;
  const { tipo, sin_leer, acuse } = await searchParams;
  const { user } = await requireMember(communityId);

  const supabase = await createServerClient();

  // Fetch announcements with sender name
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, profiles!announcements_sent_by_fkey(full_name)')
    .eq('community_id', communityId)
    .order('sent_at', { ascending: false });

  // Fetch this user's read/ack records
  const { data: reads } = await supabase
    .from('announcement_reads')
    .select('announcement_id, read_at, acknowledged_at')
    .eq('community_id', communityId)
    .eq('profile_id', user.id);

  const readMap = new Map(reads?.map((r) => [r.announcement_id, r]) ?? []);

  // Build enriched list
  const items: AnnouncementWithRead[] = (announcements ?? []).map((a) => {
    const profile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
    const read = readMap.get(a.id);
    return {
      ...a,
      senderName: (profile as { full_name?: string | null } | null)?.full_name ?? null,
      readAt: read?.read_at ?? null,
      acknowledgedAt: read?.acknowledged_at ?? null,
    };
  });

  // Apply filters
  let filtered = items;
  if (sin_leer === '1') {
    filtered = items.filter((i) => !i.readAt);
  } else if (acuse === '1') {
    filtered = items.filter((i) => i.requires_ack && !i.acknowledgedAt);
  } else if (tipo && tipo !== 'todas') {
    filtered = items.filter((i) => i.type === tipo);
  }

  // Counts for filter badges
  const counts = {
    todas: items.length,
    sin_leer: items.filter((i) => !i.readAt).length,
    urgente: items.filter((i) => i.type === 'urgente').length,
    convocatoria: items.filter((i) => i.type === 'convocatoria').length,
    resolucion: items.filter((i) => i.type === 'resolucion').length,
    aviso: items.filter((i) => i.type === 'aviso').length,
    acuse: items.filter((i) => i.requires_ack && !i.acknowledgedAt).length,
  };

  return (
    <div className="container space-y-6 p-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Comunicados</h1>
          <p className="text-sm text-muted-foreground">
            {counts.sin_leer > 0
              ? `${counts.sin_leer} sin leer · ${items.length} en total`
              : `${items.length} comunicados`}
          </p>
        </div>
        <RoleGate action="announcement.create">
          <Button asChild>
            <Link href={`/c/${communityId}/comunicados/nuevo`}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nuevo comunicado
            </Link>
          </Button>
        </RoleGate>
      </header>

      {/* Filters */}
      <AnnouncementFilters counts={counts} />

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Sin comunicados"
          description="No hay comunicados que coincidan con el filtro seleccionado."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <AnnouncementCard key={item.id} item={item} communityId={communityId} />
          ))}
        </div>
      )}
    </div>
  );
}
