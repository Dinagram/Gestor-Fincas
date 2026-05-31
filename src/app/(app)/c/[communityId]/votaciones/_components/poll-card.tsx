import Link from 'next/link';
import { CalendarDays, Euro, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { formatDate } from '@/lib/date';
import { POLL_STATUS_LABEL, POLL_TYPE_LABEL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';

type Poll = Database['public']['Tables']['polls']['Row'];
type PollStatus = Database['public']['Enums']['poll_status'];

export interface PollWithVotes extends Poll {
  favor: number;
  contra: number;
  abstencion: number;
  totalVotes: number;
}

const STATUS_BORDER: Record<PollStatus, string> = {
  active: 'border-l-emerald-500',
  draft: 'border-l-amber-400',
  closed: 'border-l-zinc-400',
  cancelled: 'border-l-rose-400',
};

const STATUS_BADGE: Record<PollStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  closed: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

function TimelineBar({ poll }: { poll: Poll }) {
  const start = new Date(poll.starts_at).getTime();
  const end = new Date(poll.ends_at).getTime();
  const now = Date.now();
  const total = end - start;
  const elapsed = Math.max(0, Math.min(now - start, total));
  const pct = total > 0 ? Math.round((elapsed / total) * 100) : 0;
  const daysLeft = Math.max(0, Math.ceil((end - now) / 86_400_000));

  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            poll.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        {poll.status === 'active' && daysLeft > 0
          ? `${daysLeft} día${daysLeft === 1 ? '' : 's'} restante${daysLeft === 1 ? '' : 's'}`
          : poll.status === 'active'
            ? 'Finaliza hoy'
            : `${formatDate(poll.starts_at, 'd MMM')} – ${formatDate(poll.ends_at, 'd MMM yyyy')}`}
      </p>
    </div>
  );
}

function MiniResultBar({ poll }: { poll: PollWithVotes }) {
  if (poll.totalVotes === 0) return null;
  const fPct = Math.round((poll.favor / poll.totalVotes) * 100);
  const cPct = Math.round((poll.contra / poll.totalVotes) * 100);
  const aPct = 100 - fPct - cPct;

  return (
    <div className="space-y-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full">
        <div className="bg-emerald-500 transition-all" style={{ width: `${fPct}%` }} />
        <div className="bg-rose-400 transition-all" style={{ width: `${cPct}%` }} />
        <div className="bg-zinc-300 dark:bg-zinc-600 transition-all" style={{ width: `${aPct}%` }} />
      </div>
      <div className="flex gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {fPct}% sí
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
          {cPct}% no
        </span>
        <span className="text-muted-foreground/60">({poll.totalVotes} votos)</span>
      </div>
    </div>
  );
}

interface Props {
  poll: PollWithVotes;
  communityId: string;
  canVote: boolean;
  userVote?: string | null;
}

export function PollCard({ poll, communityId, canVote, userVote }: Props) {
  const eligible = Math.round((poll.totalVotes / 24) * 100); // approximation
  const quorumReached = eligible >= poll.quorum_percent;
  const href = `/c/${communityId}/votaciones/${poll.id}`;

  return (
    <Card
      className={cn(
        'border-l-4 shadow-sm transition-shadow hover:shadow-md',
        STATUS_BORDER[poll.status],
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                STATUS_BADGE[poll.status],
              )}
            >
              {POLL_STATUS_LABEL[poll.status]}
            </span>
            <Badge variant="outline" className="text-xs">
              {POLL_TYPE_LABEL[poll.type]}
            </Badge>
          </div>
          {poll.amount != null && (
            <span className="flex items-center gap-1 text-sm font-semibold text-dd-terracota">
              <Euro className="h-3.5 w-3.5" />
              {poll.amount.toLocaleString('es-ES')}
            </span>
          )}
        </div>

        <Link href={href} className="group mt-1 block">
          <h3 className="font-medium leading-snug group-hover:text-primary">
            {poll.title}
          </h3>
        </Link>

        {poll.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{poll.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <TimelineBar poll={poll} />
        <MiniResultBar poll={poll} />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDate(poll.starts_at, 'd MMM')} – {formatDate(poll.ends_at, 'd MMM')}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Quórum{' '}
            <span className={cn('font-medium', quorumReached ? 'text-emerald-600' : 'text-amber-600')}>
              {poll.quorum_percent}%
            </span>
          </span>
          {userVote && (
            <span className="text-muted-foreground/70">
              Votaste:{' '}
              <span className="font-medium">
                {userVote === 'favor' ? 'Sí' : userVote === 'contra' ? 'No' : 'Abstención'}
              </span>
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild variant={poll.status === 'active' && canVote && !userVote ? 'default' : 'outline'} size="sm">
          <Link href={href}>
            {poll.status === 'active' && canVote && !userVote ? 'Votar →' : 'Ver resultado →'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
