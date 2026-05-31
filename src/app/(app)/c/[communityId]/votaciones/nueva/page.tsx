import { redirect } from 'next/navigation';

import { NewPollForm } from '../_components/new-poll-form';
import { requireMember } from '@/lib/auth/require-user';
import { canDo } from '@/lib/permissions';

type Params = Promise<{ communityId: string }>;

export default async function NuevaVotacionPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const { role } = await requireMember(communityId);

  if (!canDo(role, 'poll.create')) {
    redirect(`/c/${communityId}/votaciones`);
  }

  return (
    <div className="container max-w-2xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva votación</h1>
        <p className="text-sm text-muted-foreground">
          La votación se creará como borrador. Podrás activarla cuando esté lista.
        </p>
      </header>

      <NewPollForm communityId={communityId} />
    </div>
  );
}
