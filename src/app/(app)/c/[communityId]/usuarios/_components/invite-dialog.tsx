'use client';

import { useState, useTransition } from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createInvitation } from '@/actions/invitations';
import { pisoSchema } from '@/lib/validators/piso';

const ROLE_OPTIONS = [
  { value: 'propietario', label: 'Propietario' },
  { value: 'inquilino',   label: 'Inquilino' },
  { value: 'junta',       label: 'Miembro de junta' },
  { value: 'admin_finca', label: 'Administrador de finca' },
] as const;

interface Props {
  communityId: string;
}

export function InviteDialog({ communityId }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('propietario');
  const [piso, setPiso] = useState('');
  const [pisoError, setPisoError] = useState<string>();
  const [error, setError] = useState<string>();
  const [inviteUrl, setInviteUrl] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleOpen() {
    setOpen(true);
    setEmail('');
    setRole('propietario');
    setPiso('');
    setPisoError(undefined);
    setError(undefined);
    setInviteUrl(undefined);
    setCopied(false);
  }

  function handleClose() {
    if (pending) return;
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setPisoError(undefined);

    const pisoCheck = pisoSchema.safeParse(piso.trim());
    if (!pisoCheck.success) {
      setPisoError(pisoCheck.error.errors[0]?.message ?? 'Formato de piso inválido');
      return;
    }

    startTransition(async () => {
      const result = await createInvitation(communityId, {
        email: email.trim(),
        role: role as 'propietario' | 'inquilino' | 'junta' | 'admin_finca',
        piso: piso.trim(),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setInviteUrl(result.inviteUrl);
      toast.success('Invitación creada correctamente');
    });
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button onClick={handleOpen} className="gap-2">
        <UserPlus className="h-4 w-4" />
        Invitar usuario
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invitar nuevo usuario</DialogTitle>
          </DialogHeader>

          {!inviteUrl ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Correo electrónico</Label>
                <Input
                  id="invite-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vecino@ejemplo.es"
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">Rol inicial</Label>
                <Select value={role} onValueChange={setRole} disabled={pending}>
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  El rol se puede cambiar más adelante desde el Directorio.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-piso">
                  Piso <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invite-piso"
                  required
                  value={piso}
                  onChange={(e) => { setPiso(e.target.value.toUpperCase()); setPisoError(undefined); }}
                  placeholder="Ej: 1A, 5J, 14E"
                  disabled={pending}
                  maxLength={3}
                />
                <p className="text-xs text-muted-foreground">
                  Número de piso (1–14) + letra (A–J; A–E para el 14).
                </p>
                {pisoError && (
                  <p className="text-xs text-destructive">{pisoError}</p>
                )}
              </div>

              {error && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? 'Enviando…' : 'Enviar invitación'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                La invitación se ha creado. Comparte este enlace con el usuario:
              </p>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <span className="flex-1 truncate text-xs font-mono text-muted-foreground">
                  {inviteUrl}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 shrink-0 gap-1 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                El enlace caduca en 14 días.
              </p>
              <DialogFooter>
                <Button onClick={handleClose}>Cerrar</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
