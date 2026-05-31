import Link from 'next/link';
import { CheckCheck, Clock } from 'lucide-react';

import { AcknowledgeButton } from './acknowledge-button';
import { MarkReadButton } from './mark-read-button';
import { AvatarGradient } from '@/components/shared/avatar-gradient';
import { Badge } from '@/components/ui/badge';
import { ANNOUNCEMENT_TYPE_LABEL } from '@/lib/constants';
import { formatDate, relativeTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';

type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];
type AnnouncementType = Database['public']['Enums']['announcement_type'];

export interface AnnouncementWithRead extends AnnouncementRow {
  senderName: string | null;
  readAt: string | null;
  acknowledgedAt: string | null;
}

const TYPE_BORDER: Record<AnnouncementType, string> = {
  urgente: 'border-l-destructive',
  convocatoria: 'border-l-primary',
  resolucion: 'border-l-emerald-500',
  aviso: 'border-l-border',
};

const TYPE_BADGE_VARIANT: Record<
  AnnouncementType,
  'destructive' | 'default' | 'secondary' | 'outline'
> = {
  urgente: 'destructive',
  convocatoria: 'default',
  resolucion: 'secondary',
  aviso: 'outline',
};

interface Props {
  item: AnnouncementWithRead;
  communityId: string;
}

export function AnnouncementCard({ item, communityId }: Props) {
  const isUnread = !item.readAt;
  const isAcknowledged = !!item.acknowledgedAt;
  const needsAck = item.requires_ack && !isAcknowledged;

  return (
    <article
      className={cn(
        'rounded-lg border border-l-4 bg-card transition-colors hover:border-primary/30',
        TYPE_BORDER[item.type],
      )}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5 shrink-0">
            <AvatarGradient name={item.senderName} seed={item.sent_by ?? item.id} className="h-8 w-8 text-[10px]" />
            {isUnread && (
              <span
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-blue-500"
                aria-label="Sin leer"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Badges */}
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <Badge variant={TYPE_BADGE_VARIANT[item.type]} className="text-[11px]">
                {ANNOUNCEMENT_TYPE_LABEL[item.type]}
              </Badge>
              {isUnread && (
                <Badge variant="outline" className="border-blue-500/40 text-[11px] text-blue-600 dark:text-blue-400">
                  Sin leer
                </Badge>
              )}
              {item.requires_ack && (
                isAcknowledged ? (
                  <Badge variant="outline" className="gap-1 border-emerald-500/40 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <CheckCheck className="h-3 w-3" />
                    Acusado el {formatDate(item.acknowledgedAt!, 'd MMM')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 border-amber-500/40 text-[11px] text-amber-600 dark:text-amber-400">
                    <Clock className="h-3 w-3" />
                    Acuse pendiente
                  </Badge>
                )
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>

            {/* Meta */}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.senderName ?? 'Administración'} · {relativeTime(item.sent_at)}
            </p>

            {/* Body preview */}
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <Link
            href={`/c/${communityId}/comunicados/${item.id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Leer comunicado →
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {needsAck && (
              <AcknowledgeButton communityId={communityId} announcementId={item.id} />
            )}
            {isUnread && (
              <MarkReadButton communityId={communityId} announcementId={item.id} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
