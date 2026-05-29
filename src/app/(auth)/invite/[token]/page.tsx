import { notFound, redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { createAdminClient } from '@/lib/supabase/admin';

import { AcceptInviteForm } from './_components/accept-invite-form';

type Params = Promise<{ token: string }>;

export default async function InvitePage({ params }: { params: Params }) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: invitation } = await admin
    .from('invitations')
    .select(
      'id, email, role, community_id, expires_at, used_at, communities(name, address, city)',
    )
    .eq('token', token)
    .maybeSingle();

  if (!invitation) notFound();

  if (invitation.used_at) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Esta invitación ya se usó</h1>
        <p className="text-sm text-muted-foreground">
          Si ya tienes cuenta, simplemente entra con tu correo.
        </p>
        <Button asChild>
          <a href="/login">Ir a iniciar sesión</a>
        </Button>
      </div>
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Invitación caducada</h1>
        <p className="text-sm text-muted-foreground">
          Pídele a tu administrador que te envíe una nueva.
        </p>
      </div>
    );
  }

  const community = Array.isArray(invitation.communities)
    ? invitation.communities[0]
    : invitation.communities;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Únete a {community?.name}</h1>
        <p className="text-sm text-muted-foreground">
          {community?.address} — {community?.city}
        </p>
      </div>

      <AcceptInviteForm
        token={token}
        email={invitation.email}
        communityId={invitation.community_id}
      />
    </div>
  );
}
