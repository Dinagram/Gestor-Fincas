import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCheck, Clock, Shield } from 'lucide-react';

import { AutoMarkRead } from './_components/auto-mark-read';
import { AcknowledgeButton } from '../_components/acknowledge-button';
import { AvatarGradient } from '@/components/shared/avatar-gradient';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ANNOUNCEMENT_TYPE_LABEL } from '@/lib/constants';
import { formatDate, formatDateTime, relativeTime } from '@/lib/date';
import { requireMember } from '@/lib/auth/require-user';
import { isAtLeast } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type Params = Promise<{ communityId: string; id: string }>;
type AnnouncementType = Database['public']['Enums']['announcement_type'];

const TYPE_BADGE_VARIANT: Record<
  AnnouncementType,
  'destructive' | 'default' | 'secondary' | 'outline'
> = {
  urgente: 'destructive',
  convocatoria: 'default',
  resolucion: 'secondary',
  aviso: 'outline',
};

export default async function AnnouncementDetailPage({ params }: { params: Params }) {
  const { communityId, id } = await params;
  const { user, role } = await requireMember(communityId);

  const supabase = await createServerClient();

  const canManage = isAtLeast(role, 'junta');

  const [{ data: announcement }, { data: readRecord }, ackRecordsRes] = await Promise.all([
    supabase
      .from('announcements')
      .select('*, profiles!announcements_sent_by_fkey(full_name)')
      .eq('id', id)
      .eq('community_id', communityId)
      .maybeSingle(),
    supabase
      .from('announcement_reads')
      .select('read_at, acknowledged_at')
      .eq('announcement_id', id)
      .eq('profile_id', user.id)
      .maybeSingle(),
    canManage
      ? supabase
          .from('announcement_reads')
          .select('acknowledged_at, acknowledged_from_ip, profiles(full_name)')
          .eq('announcement_id', id)
          .not('acknowledged_at', 'is', null)
          .order('acknowledged_at', { ascending: true })
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (!announcement) notFound();

  const profile = Array.isArray(announcement.profiles)
    ? announcement.profiles[0]
    : announcement.profiles;
  const senderName = (profile as { full_name?: string | null } | null)?.full_name ?? 'Administración';
  const isAcknowledged = !!readRecord?.acknowledged_at;
  const needsAck = announcement.requires_ack && !isAcknowledged;

  const ackRecords = canManage && announcement.requires_ack
    ? (ackRecordsRes.data ?? [])
    : null;

  return (
    <div className="container max-w-2xl space-y-6 p-6">
      {/* Auto-mark as read on mount */}
      {!readRecord?.read_at && (
        <AutoMarkRead communityId={communityId} announcementId={id} />
      )}

      {/* Back */}
      <Link
        href={`/c/${communityId}/comunicados`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a comunicados
      </Link>

      <Card>
        <CardHeader className="space-y-3 pb-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={TYPE_BADGE_VARIANT[announcement.type]}>
              {ANNOUNCEMENT_TYPE_LABEL[announcement.type]}
            </Badge>
            {announcement.requires_ack && (
              isAcknowledged ? (
                <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Acusado el {formatDate(readRecord!.acknowledged_at!, 'd MMM yyyy')}
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                  Requiere acuse de recibo
                </Badge>
              )
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold leading-snug">{announcement.title}</h1>

          {/* Sender + date */}
          <div className="flex items-center gap-2">
            <AvatarGradient
              name={senderName}
              seed={announcement.sent_by ?? announcement.id}
              className="h-7 w-7 text-[10px]"
            />
            <div>
              <p className="text-sm font-medium">{senderName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(announcement.sent_at)} · {relativeTime(announcement.sent_at)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 border-t pt-4">
          {/* Body */}
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{announcement.body}</p>

          {/* Acknowledge action */}
          {needsAck && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-4 dark:bg-amber-950/20">
              <p className="mb-3 text-sm font-medium text-amber-800 dark:text-amber-300">
                Este comunicado requiere tu acuse de recibo.
              </p>
              <AcknowledgeButton communityId={communityId} announcementId={id} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acknowledgement registry — only for junta/admin when requires_ack=true */}
      {ackRecords !== null && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Registro de acuses de recibo</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {ackRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ningún vecino ha acusado recibo todavía.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="pb-2 pr-4 text-left font-medium">Vecino</th>
                      <th className="pb-2 pr-4 text-left font-medium">Fecha y hora</th>
                      <th className="pb-2 text-left font-medium">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ackRecords.map((record, i) => {
                      const p = Array.isArray(record.profiles)
                        ? record.profiles[0]
                        : record.profiles;
                      const name = (p as { full_name?: string | null } | null)?.full_name ?? '—';
                      return (
                        <tr key={i} className="text-sm">
                          <td className="py-2 pr-4 font-medium">{name}</td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {record.acknowledged_at
                              ? formatDateTime(record.acknowledged_at)
                              : '—'}
                          </td>
                          <td className="py-2 font-mono text-xs text-muted-foreground">
                            {(record.acknowledged_from_ip as string | null) ?? '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
