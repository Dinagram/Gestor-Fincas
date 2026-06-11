'use client';

import { useTransition } from 'react';
import { Copy, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { ROLE_LABEL } from '@/lib/constants';
import { cancelInvitation, resendInvitation } from '@/actions/invitations';
import type { InvitationRow } from '@/actions/invitations';

type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

function getStatus(inv: InvitationRow): InviteStatus {
  if (inv.usedAt) return 'accepted';
  if (inv.cancelledAt) return 'cancelled';
  if (new Date(inv.expiresAt) < new Date()) return 'expired';
  return 'pending';
}

const STATUS_LABEL: Record<InviteStatus, string> = {
  pending:   'Pendiente',
  accepted:  'Aceptada',
  expired:   'Caducada',
  cancelled: 'Cancelada',
};

const STATUS_BADGE: Record<InviteStatus, string> = {
  pending:   'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
  accepted:  'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400',
  expired:   'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
  cancelled: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface RowActionsProps {
  inv: InvitationRow;
  status: InviteStatus;
  communityId: string;
  siteUrl: string;
}

function RowActions({ inv, status, communityId, siteUrl }: RowActionsProps) {
  const [pending, startTransition] = useTransition();

  async function handleCopy() {
    await navigator.clipboard.writeText(`${siteUrl}/invite/${inv.token}`);
    toast.success('Enlace copiado al portapapeles');
  }

  function handleResend() {
    startTransition(async () => {
      const result = await resendInvitation(communityId, inv.id);
      if (result.ok) {
        toast.success('Nueva invitación enviada');
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCancel() {
    if (!confirm(`¿Cancelar la invitación para ${inv.email}?`)) return;
    startTransition(async () => {
      const result = await cancelInvitation(communityId, inv.id);
      if (result.ok) {
        toast.success('Invitación cancelada');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      {status === 'pending' && (
        <button
          onClick={handleCopy}
          disabled={pending}
          title="Copiar enlace"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
      {(status === 'pending' || status === 'expired') && (
        <button
          onClick={handleResend}
          disabled={pending}
          title="Reenviar invitación"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', pending && 'animate-spin')} />
        </button>
      )}
      {status === 'pending' && (
        <button
          onClick={handleCancel}
          disabled={pending}
          title="Cancelar invitación"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-red-600 disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

interface Props {
  invitations: InvitationRow[];
  communityId: string;
  siteUrl: string;
}

export function InvitationsTable({ invitations, communityId, siteUrl }: Props) {
  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No hay invitaciones todavía. Usa el botón &ldquo;Invitar usuario&rdquo; para enviar la primera.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Correo
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">
                Rol
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">
                Enviada
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">
                Caduca
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estado
              </th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {invitations.map((inv) => {
              const status = getStatus(inv);
              return (
                <tr key={inv.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.email}</p>
                    {inv.inviterName && (
                      <p className="text-xs text-muted-foreground">
                        Invitado por {inv.inviterName}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {ROLE_LABEL[inv.role] ?? inv.role}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                    {formatDate(inv.createdAt)}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                    {status === 'accepted' || status === 'cancelled' ? '—' : formatDate(inv.expiresAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      STATUS_BADGE[status],
                    )}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                      {STATUS_LABEL[status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions inv={inv} status={status} communityId={communityId} siteUrl={siteUrl} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
