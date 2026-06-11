'use client';

import { useState, useTransition, useEffect } from 'react';
import { Copy, Check, Link2, RefreshCw, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_LABEL } from '@/lib/constants';
import {
  generateCommunityInviteLink,
  invalidateCommunityInviteLink,
  type CommunityInviteLink,
} from '@/actions/community-invite-links';
import type { Database } from '@/types/database';

type MemberRole = Database['public']['Enums']['member_role'];

const ASSIGNABLE_ROLES: MemberRole[] = ['propietario', 'inquilino', 'junta', 'admin_finca'];

interface Props {
  communityId: string;
  initialLink: CommunityInviteLink | null;
  initialJoinUrl: string | null;
  siteUrl: string;
}

function timeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Caducado';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `Caduca en ${hours}h ${minutes}m`;
  return `Caduca en ${minutes}m`;
}

export function CommunityInviteLink({ communityId, initialLink, initialJoinUrl }: Props) {
  const [link, setLink] = useState<CommunityInviteLink | null>(initialLink);
  const [joinUrl, setJoinUrl] = useState<string | null>(initialJoinUrl);
  const [role, setRole] = useState<MemberRole>('propietario');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();
  const [remaining, setRemaining] = useState<string>('');
  const [pending, startTransition] = useTransition();

  // Update countdown every minute
  useEffect(() => {
    if (!link) return;
    setRemaining(timeRemaining(link.expiresAt));
    const id = setInterval(() => setRemaining(timeRemaining(link.expiresAt)), 60_000);
    return () => clearInterval(id);
  }, [link]);

  function handleCopy() {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleGenerate() {
    setError(undefined);
    startTransition(async () => {
      const result = await generateCommunityInviteLink(communityId, role);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLink(result.link);
      setJoinUrl(result.joinUrl);
    });
  }

  function handleInvalidate() {
    setError(undefined);
    startTransition(async () => {
      const result = await invalidateCommunityInviteLink(communityId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLink(null);
      setJoinUrl(null);
    });
  }

  return (
    <div className="space-y-4">
      {link && joinUrl ? (
        <>
          {/* Active link */}
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-mono text-sm">{joinUrl}</span>
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {remaining} · {ROLE_LABEL[link.role]}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerate}
                disabled={pending}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Regenerar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleInvalidate}
                disabled={pending}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Revocar
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* No active link */
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Rol</p>
            <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={pending}>
            <Link2 className="mr-1.5 h-4 w-4" />
            Generar enlace
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
