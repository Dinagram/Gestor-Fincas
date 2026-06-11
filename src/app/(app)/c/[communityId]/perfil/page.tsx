import { notFound } from 'next/navigation';
import { Building2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { requireMember } from '@/lib/auth/require-user';
import { ROLE_LABEL } from '@/lib/constants';
import { createServerClient } from '@/lib/supabase/server';

import { ProfileForm } from './_components/profile-form';

type Params = Promise<{ communityId: string }>;

export default async function PerfilPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const { user } = await requireMember(communityId);

  const supabase = await createServerClient();

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('community_members')
      .select('role, units!community_members_unit_id_fkey(floor, door)')
      .eq('profile_id', user.id)
      .eq('community_id', communityId)
      .eq('status', 'active')
      .maybeSingle(),
  ]);

  if (!profile) notFound();

  const unit = membership?.units as unknown as { floor: string; door: string } | null;
  const pisoLabel = unit ? `${unit.floor}º${unit.door}` : null;
  const roleLabel = membership?.role ? (ROLE_LABEL[membership.role] ?? membership.role) : '—';

  return (
    <div className="container max-w-2xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">
          Información de tu cuenta en esta comunidad.
        </p>
      </header>

      {/* Community membership info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos en la comunidad</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Correo electrónico</dt>
              <dd className="font-medium">{profile.email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Rol</dt>
              <dd className="font-medium">{roleLabel}</dd>
            </div>
            {pisoLabel && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  Piso
                </dt>
                <dd className="font-semibold">{pisoLabel}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Editable profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información personal</CardTitle>
          <CardDescription>
            Actualiza tu nombre y teléfono de contacto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            communityId={communityId}
            defaultValues={{
              fullName: profile.full_name ?? '',
              phone: profile.phone ?? '',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
