import Link from 'next/link';

import { SignupForm } from './_components/signup-form';

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Solicita acceso</h1>
        <p className="text-sm text-muted-foreground">
          Recibirás un enlace por correo para confirmar tu cuenta
        </p>
      </div>

      <SignupForm />

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
