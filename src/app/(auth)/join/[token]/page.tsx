import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { createAdminClient } from '@/lib/supabase/admin';
import { ROLE_LABEL } from '@/lib/constants';

import { JoinCommunityForm } from './_components/join-community-form';

type Params = Promise<{ token: string }>;

export default async function JoinPage({ params }: { params: Params }) {
  const { token } = await params;
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link } = await (admin as any)
    .from('community_invite_links')
    .select('id, role, expires_at, invalidated_at, community_id, communities(name, address, city)')
    .eq('token', token)
    .maybeSingle();

  if (!link) notFound();

  if (link.invalidated_at) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Enlace revocado</h1>
        <p className="text-sm text-muted-foreground">
          Este enlace ha sido desactivado. Contacta con el administrador para obtener uno nuevo.
        </p>
      </div>
    );
  }

  if (new Date(link.expires_at) < new Date()) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Enlace caducado</h1>
        <p className="text-sm text-muted-foreground">
          Este enlace ha expirado. Pídele al administrador que genere uno nuevo.
        </p>
        <Button asChild variant="outline">
          <a href="/login">Ir a iniciar sesión</a>
        </Button>
      </div>
    );
  }

  const community = Array.isArray(link.communities) ? link.communities[0] : link.communities;
  const roleLabel = ROLE_LABEL[link.role as keyof typeof ROLE_LABEL] ?? link.role;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Únete a {community?.name}</h1>
        {(community?.address || community?.city) && (
          <p className="text-sm text-muted-foreground">
            {community?.address}{community?.city ? ` — ${community.city}` : ''}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Serás registrado como{' '}
          <span className="font-medium text-foreground">{roleLabel}</span>
        </p>
      </div>

      <JoinCommunityForm token={token} communityId={link.community_id} />
    </div>
  );
}
