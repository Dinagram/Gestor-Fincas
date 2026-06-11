import { notFound } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { requireMember } from '@/lib/auth/require-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';

import { CommunitySettingsForm } from './_components/community-settings-form';

type Params = Promise<{ communityId: string }>;


export default async function AjustesPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const { role } = await requireMember(communityId);

  const supabase = await createServerClient();
  const { data: community } = await supabase
    .from('communities')
    .select('id, name, address, city, province, postal_code, cif')
    .eq('id', communityId)
    .maybeSingle();

  if (!community) notFound();

  const isEditable = canDo(role, 'community.edit');

  const defaultValues = {
    name: community.name,
    address: community.address,
    city: community.city ?? '',
    province: community.province ?? '',
    postal_code: community.postal_code ?? '',
    cif: community.cif ?? '',
  };

  return (
    <div className="container max-w-2xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Información y ajustes de la comunidad.
        </p>
      </header>

      {/* Información del edificio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información del edificio</CardTitle>
          <CardDescription>
            {isEditable
              ? 'Edita los datos identificativos de la comunidad.'
              : 'Datos identificativos de la comunidad.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommunitySettingsForm
            communityId={communityId}
            defaultValues={defaultValues}
            canEdit={isEditable}
          />
        </CardContent>
      </Card>

    </div>
  );
}
