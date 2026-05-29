import Link from 'next/link';
import { Building2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth/require-user';
import { getMemberships } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  await requireUser();
  const memberships = await getMemberships();
  if (memberships.length > 0) redirect(`/c/${memberships[0]!.community_id}/dashboard`);

  return (
    <div className="container max-w-2xl py-16">
      <div className="mb-8 flex items-center gap-2">
        <Building2 className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">GestiónFinca</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido</CardTitle>
          <CardDescription>
            Tu cuenta está lista, pero aún no perteneces a ninguna comunidad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para acceder a una comunidad necesitas una invitación de su administrador. Pídele que te
            envíe el correo de invitación a tu dirección.
          </p>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-medium">¿Eres administrador?</p>
            <p className="mt-1 text-muted-foreground">
              La creación de comunidades por autoservicio estará disponible próximamente. Mientras
              tanto, escríbenos para crear la tuya.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <a href="mailto:hola@gestionfinca.app">
                <Mail className="h-4 w-4" />
                Contactar
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Salir</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
