'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBrowserClient } from '@/lib/supabase/browser';
import { acceptCommunityInviteLink } from '@/actions/community-invite-links';
import { pisoSchema } from '@/lib/validators/piso';

interface Props {
  token: string;
  communityId: string;
}

export function JoinCommunityForm({ token, communityId: _communityId }: Props) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [piso, setPiso] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>();
  const [existingUserWarning, setExistingUserWarning] = useState(false);
  const [pending, startTransition] = useTransition();

  const supabase = createBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setExistingUserWarning(false);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (fullName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    const pisoCheck = pisoSchema.safeParse(piso.trim());
    if (!pisoCheck.success) {
      setError(pisoCheck.error.errors[0]?.message ?? 'Formato de piso inválido');
      return;
    }

    startTransition(async () => {
      const result = await acceptCommunityInviteLink(token, {
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        password,
        piso: piso.trim(),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (result.existingUser) {
        setExistingUserWarning(true);
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(
          result.existingUser
            ? 'Tu cuenta ya existía. Entra con tu contraseña habitual.'
            : 'Cuenta creada. Entra con tu correo y contraseña.',
        );
        return;
      }

      window.location.replace(`/c/${result.communityId}/dashboard`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {existingUserWarning && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          Tu cuenta ya existía. Hemos vinculado tu email a esta comunidad.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">
          Correo electrónico <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          disabled={pending}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">
          Nombre completo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="full_name"
          required
          minLength={2}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="María García López"
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Teléfono <span className="text-muted-foreground text-xs">(opcional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+34 600 000 000"
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="piso">
          Piso <span className="text-destructive">*</span>
        </Label>
        <Input
          id="piso"
          required
          value={piso}
          onChange={(e) => setPiso(e.target.value.toUpperCase())}
          placeholder="Ej: 1A, 5J, 14E"
          disabled={pending}
          maxLength={3}
        />
        <p className="text-xs text-muted-foreground">
          Número de piso (1–14) seguido de letra (A–J; A–E para el piso 14).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Elige una contraseña <span className="text-destructive">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">
          Confirmar contraseña <span className="text-destructive">*</span>
        </Label>
        <Input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={pending}
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}{' '}
          {(error.includes('habitual') || error.includes('correo y contraseña')) && (
            <Link href="/login" className="font-medium underline">
              Ir a iniciar sesión
            </Link>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unirse a la comunidad'}
      </Button>
    </form>
  );
}
