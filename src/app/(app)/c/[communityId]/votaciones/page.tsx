import Link from 'next/link';
import { Plus, Vote } from 'lucide-react';

import { PollCard } from './_components/poll-card';
import { PollFilters } from './_components/poll-filters';
import type { PollWithVotes } from './_components/poll-card';
import { EmptyState } from '@/components/shared/empty-state';
import { RoleGate } from '@/components/shared/role-gate';
import { Button } from '@/components/ui/button';
import { requireMember } from '@/lib/auth/require-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';

type Params = Promise<{ communityId: string }>;
type SearchParams = Promise<{ estado?: string }>;

export default async function VotacionesPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { communityId } = await params;
  const { estado } = await searchParams;
  const { user, role } = await requireMember(communityId);

  const supabase = await createServerClient();

  // Fetch all polls
  const { data: polls } = await supabase
    .from('polls')
    .select('*')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  // Fetch vote counts per poll
  const { data: votes } = await supabase
    .from('poll_votes')
    .select('poll_id, choice')
    .eq('community_id', communityId);

  // Fetch current user's votes
  const { data: myVotes } = await supabase
    .from('poll_votes')
    .select('poll_id, choice')
    .eq('community_id', communityId)
    .eq('profile_id', user.id);

  const myVoteMap = new Map(myVotes?.map((v) => [v.poll_id, v.choice]) ?? []);

  // Build vote count map
  const voteCountMap = new Map<string, { favor: number; contra: number; abstencion: number }>();
  for (const v of votes ?? []) {
    const existing = voteCountMap.get(v.poll_id) ?? { favor: 0, contra: 0, abstencion: 0 };
    if (v.choice === 'favor') existing.favor++;
    else if (v.choice === 'contra') existing.contra++;
    else if (v.choice === 'abstencion') existing.abstencion++;
    voteCountMap.set(v.poll_id, existing);
  }

  const allPolls: PollWithVotes[] = (polls ?? []).map((p) => {
    const counts = voteCountMap.get(p.id) ?? { favor: 0, contra: 0, abstencion: 0 };
    return {
      ...p,
      ...counts,
      totalVotes: counts.favor + counts.contra + counts.abstencion,
    };
  });

  // Counts for filter badges
  const filterCounts = {
    todas: allPolls.length,
    active: allPolls.filter((p) => p.status === 'active').length,
    draft: allPolls.filter((p) => p.status === 'draft').length,
    closed: allPolls.filter((p) => p.status === 'closed').length,
    cancelled: allPolls.filter((p) => p.status === 'cancelled').length,
  };

  // Apply filter
  let filtered = allPolls;
  if (estado && estado !== 'todas') {
    filtered = allPolls.filter((p) => p.status === estado);
  }

  const canCreatePoll = canDo(role, 'poll.create');
  const canVoteEconomic = canDo(role, 'poll.vote_economic');

  return (
    <div className="container space-y-6 p-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Votaciones</h1>
          <p className="text-sm text-muted-foreground">
            {filterCounts.active > 0
              ? `${filterCounts.active} activa${filterCounts.active === 1 ? '' : 's'} · ${allPolls.length} en total`
              : `${allPolls.length} votacione${allPolls.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <RoleGate action="poll.create">
          <Button asChild>
            <Link href={`/c/${communityId}/votaciones/nueva`}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nueva votación
            </Link>
          </Button>
        </RoleGate>
      </header>

      {/* Filters */}
      <PollFilters counts={filterCounts} showDraft={canCreatePoll} />

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="Sin votaciones"
          description="No hay votaciones que coincidan con el filtro seleccionado."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              communityId={communityId}
              canVote={canVoteEconomic || poll.type !== 'budget'}
              userVote={myVoteMap.get(poll.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
