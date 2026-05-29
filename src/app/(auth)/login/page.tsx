import Link from 'next/link';

import { LoginForm } from './_components/login-form';

type SearchParams = Promise<{ redirect?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-sm text-muted-foreground">
          Accede a tu comunidad con tu correo electrónico
        </p>
      </div>

      <LoginForm redirectTo={params.redirect ?? '/'} initialError={params.error} />

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Solicita acceso
        </Link>
      </p>
    </div>
  );
}
