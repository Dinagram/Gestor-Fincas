import { requireRole } from '@/lib/auth/require-user';
import { createServerClient } from '@/lib/supabase/server';
import { listInvitations } from '@/actions/invitations';
import { getActiveCommunityInviteLink } from '@/actions/community-invite-links';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { InviteDialog } from './_components/invite-dialog';
import { InvitationsTable } from './_components/invitations-table';
import { MembersSummary, type MemberSummaryEntry } from './_components/members-summary';
import { CommunityInviteLink } from './_components/community-invite-link';

type Params = Promise<{ communityId: string }>;

export default async function UsuariosPage({ params }: { params: Params }) {
  const { communityId } = await params;
  await requireRole(communityId, ['admin_finca']);

  const supabase = await createServerClient();

  const [invitationsResult, membersResult, inviteLinkResult] = await Promise.all([
    listInvitations(communityId),
    supabase
      .from('community_members')
      .select('id, role, profiles!community_members_profile_id_fkey(full_name), units!community_members_unit_id_fkey(floor, door)')
      .eq('community_id', communityId)
      .eq('status', 'active')
      .order('role'),
    getActiveCommunityInviteLink(communityId),
  ]);

  const invitations = invitationsResult.ok ? invitationsResult.invitations : [];

  if (membersResult.error) {
    console.error('MEMBERS_QUERY_ERROR:', JSON.stringify(membersResult.error));
  }

  const members: MemberSummaryEntry[] = (membersResult.data ?? []).map((m) => {
    const unit = m.units as unknown as { floor: string; door: string } | null;
    return {
      memberId: m.id,
      fullName: (m.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
      role: m.role,
      floor: unit?.floor ?? null,
      door: unit?.door ?? null,
    };
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const activeLink = inviteLinkResult.ok ? inviteLinkResult.link : null;
  const activeJoinUrl = inviteLinkResult.ok ? inviteLinkResult.joinUrl : null;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona las invitaciones y los miembros activos de la comunidad.
        </p>
      </div>

      {/* Generic invite link */}
      <Card>
        <CardHeader>
          <CardTitle>Enlace de invitación</CardTitle>
          <CardDescription>
            Genera un enlace que cualquier persona puede usar para unirse a la comunidad. Caduca a las 48 horas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommunityInviteLink
            communityId={communityId}
            initialLink={activeLink}
            initialJoinUrl={activeJoinUrl}
            siteUrl={siteUrl}
          />
        </CardContent>
      </Card>

      {/* Per-email invitations */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Invitaciones</CardTitle>
              <CardDescription>
                Invita a nuevos vecinos por correo electrónico. Los enlaces caducan en 14 días.
              </CardDescription>
            </div>
            <InviteDialog communityId={communityId} />
          </div>
        </CardHeader>
        <CardContent>
          <InvitationsTable
            invitations={invitations}
            communityId={communityId}
            siteUrl={siteUrl}
          />
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros activos</CardTitle>
          <CardDescription>
            {members.length} {members.length === 1 ? 'miembro activo' : 'miembros activos'} en la comunidad.
            Para editar datos de un vecino, usa el Directorio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MembersSummary members={members} communityId={communityId} />
        </CardContent>
      </Card>
    </div>
  );
}
