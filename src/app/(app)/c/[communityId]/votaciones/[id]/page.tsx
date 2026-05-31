import { notFound } from 'next/navigation';
import { CalendarDays, Euro } from 'lucide-react';

import { PollActions } from '../_components/poll-actions';
import { PollResults } from '../_components/poll-results';
import { VotePanel } from '../_components/vote-panel';
import { RoleGate } from '@/components/shared/role-gate';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/date';
import { requireMember } from '@/lib/auth/require-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import { POLL_STATUS_BADGE_CLASSES, POLL_STATUS_LABEL, POLL_TYPE_LABEL } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Params = Promise<{ communityId: string; id: string }>;

export default async function PollDetailPage({ params }: { params: Params }) {
  const { communityId, id } = await params;
  const { user, role } = await requireMember(communityId);

  const supabase = await createServerClient();

  const { data: poll } = await supabase
    .from('polls')
    .select('*, profiles!polls_created_by_fkey(full_name)')
    .eq('id', id)
    .eq('community_id', communityId)
    .maybeSingle();

  if (!poll) notFound();

  // Fetch vote counts
  const { data: votes } = await supabase
    .from('poll_votes')
    .select('choice')
    .eq('poll_id', id)
    .eq('community_id', communityId);

  const favor = votes?.filter((v) => v.choice === 'favor').length ?? 0;
  const contra = votes?.filter((v) => v.choice === 'contra').length ?? 0;
  const abstencion = votes?.filter((v) => v.choice === 'abstencion').length ?? 0;
  const totalVotes = favor + contra + abstencion;

  // Fetch eligible voters (all active members)
  const { count: eligibleCount } = await supabase
    .from('community_members')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', communityId)
    .eq('status', 'active');

  // Fetch user's own vote
  const { data: myVoteRow } = await supabase
    .from('poll_votes')
    .select('choice')
    .eq('poll_id', id)
    .eq('profile_id', user.id)
    .maybeSingle();

  const myVote = myVoteRow?.choice ?? null;
  const creatorProfile = Array.isArray(poll.profiles) ? poll.profiles[0] : poll.profiles;
  const canVoteEconomic = canDo(role, 'poll.vote_economic');
  const canManage = canDo(role, 'poll.create');
  const isActive = poll.status === 'active';
  const now = new Date();
  const inPeriod = isActive && now >= new Date(poll.starts_at) && now <= new Date(poll.ends_at);
  const canVote = inPeriod && !myVote;

  // Timeline progress
  const start = new Date(poll.starts_at).getTime();
  const end = new Date(poll.ends_at).getTime();
  const elapsed = Math.max(0, Math.min(Date.now() - start, end - start));
  const timelinePct = end > start ? Math.round((elapsed / (end - start)) * 100) : 0;

  return (
    <div className="container space-y-6 p-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              POLL_STATUS_BADGE_CLASSES[poll.status] ?? POLL_STATUS_BADGE_CLASSES.closed,
            )}
          >
            {POLL_STATUS_LABEL[poll.status]}
          </span>
          <Badge variant="outline" className="text-xs">
            {POLL_TYPE_LABEL[poll.type]}
          </Badge>
          {poll.amount != null && (
            <span className="flex items-center gap-1 text-sm font-semibold text-dd-terracota">
              <Euro className="h-3.5 w-3.5" />
              {poll.amount.toLocaleString('es-ES')} €
            </span>
          )}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">{poll.title}</h1>

        {poll.description && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{poll.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDate(poll.starts_at)} – {formatDate(poll.ends_at)}
          </span>
          {creatorProfile && (
            <span>Creada por {(creatorProfile as { full_name?: string | null }).full_name}</span>
          )}
        </div>
      </header>

      {/* Admin actions */}
      {canManage && (
        <RoleGate action="poll.create">
          <PollActions
            communityId={communityId}
            pollId={poll.id}
            status={poll.status}
          />
        </RoleGate>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <PollResults
              favor={favor}
              contra={contra}
              abstencion={abstencion}
              quorumPercent={poll.quorum_percent}
              eligibleCount={eligibleCount ?? 24}
              status={poll.status}
            />
          </CardContent>
        </Card>

        {/* Voting panel + timeline */}
        <div className="space-y-4">
          {/* Vote panel */}
          {isActive && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tu voto</CardTitle>
              </CardHeader>
              <CardContent>
                {canVote ? (
                  <VotePanel
                    communityId={communityId}
                    pollId={poll.id}
                    existingVote={null}
                    canVoteEconomic={canVoteEconomic}
                    pollType={poll.type}
                  />
                ) : myVote ? (
                  <VotePanel
                    communityId={communityId}
                    pollId={poll.id}
                    existingVote={myVote as 'favor' | 'contra' | 'abstencion'}
                    canVoteEconomic={canVoteEconomic}
                    pollType={poll.type}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {!inPeriod
                      ? 'El período de votación no ha comenzado aún.'
                      : 'No tienes permiso para votar en esta votación.'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Período de votación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      poll.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400',
                    )}
                    style={{ width: `${timelinePct}%` }}
                  />
                </div>
                {/* Today marker */}
                {poll.status === 'active' && (
                  <div
                    className="absolute -top-0.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-600 shadow-sm"
                    style={{ left: `${timelinePct}%` }}
                    aria-label="Hoy"
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatDate(poll.starts_at, 'd MMM yyyy')}</span>
                <span>{formatDate(poll.ends_at, 'd MMM yyyy')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-muted/40 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Votos emitidos</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{totalVotes}</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Quórum requerido</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{poll.quorum_percent}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
