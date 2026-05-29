'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBrowserClient } from '@/lib/supabase/browser';

interface Props {
  token: string;
  email: string;
  communityId: string;
}

export function AcceptInviteForm({ token, email, communityId }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const supabase = createBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      // Sign up (or sign in) the invited email so the user gets a session.
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/callback?redirect=/c/${communityId}/dashboard`,
          data: { invite_token: token },
        },
      });

      if (signupError && !signupError.message.toLowerCase().includes('already')) {
        setError(signupError.message);
        return;
      }

      // If the account already existed (e.g. user has accounts in other
      // communities), sign in normally so they get a session.
      if (signupError) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          setError(loginError.message);
          return;
        }
      }

      // TODO Phase 2: server action acceptInvitation(token) → inserts
      // community_members + marks invitations.used_at.
      router.replace(`/c/${communityId}/dashboard`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Correo</Label>
        <Input value={email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Elige una contraseña</Label>
        <Input
          id="password"
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
        />
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aceptar invitación'}
      </Button>
    </form>
  );
}
