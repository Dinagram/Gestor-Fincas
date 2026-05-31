'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { activatePoll, cancelPoll, closePoll } from '@/actions/polls';
import { Button } from '@/components/ui/button';

interface Props {
  communityId: string;
  pollId: string;
  status: 'draft' | 'active' | 'closed' | 'cancelled';
}

export function PollActions({ communityId, pollId, status }: Props) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, successMsg: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? 'Error');
      } else {
        toast.success(successMsg);
      }
    });
  }

  if (status === 'draft') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            run(() => activatePoll(communityId, pollId), 'Votación activada')
          }
        >
          {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />}
          Activar votación
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          disabled={pending}
          onClick={() =>
            run(() => cancelPoll(communityId, pollId), 'Votación cancelada')
          }
        >
          Cancelar
        </Button>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            run(() => closePoll(communityId, pollId), 'Votación cerrada')
          }
        >
          {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />}
          Cerrar votación
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          disabled={pending}
          onClick={() =>
            run(() => cancelPoll(communityId, pollId), 'Votación cancelada')
          }
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return null;
}
