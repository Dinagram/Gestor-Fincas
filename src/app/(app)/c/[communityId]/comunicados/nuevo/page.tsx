import { redirect } from 'next/navigation';

import { NewAnnouncementForm } from '../_components/new-announcement-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireMember } from '@/lib/auth/require-user';
import { canDo } from '@/lib/permissions';

type Params = Promise<{ communityId: string }>;

export default async function NuevoComunicadoPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const { role } = await requireMember(communityId);

  if (!canDo(role, 'announcement.create')) {
    redirect(`/c/${communityId}/comunicados`);
  }

  return (
    <div className="container max-w-2xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo comunicado</h1>
        <p className="text-sm text-muted-foreground">
          Publica un aviso, convocatoria o resolución para todos los vecinos.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Redactar comunicado</CardTitle>
          <CardDescription>
            El comunicado se publicará inmediatamente y aparecerá en el listado de todos los
            miembros de la comunidad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewAnnouncementForm communityId={communityId} />
        </CardContent>
      </Card>
    </div>
  );
}
