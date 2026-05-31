'use client';

import { useState, useTransition } from 'react';
import { Loader2, Minus, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

import { castVote } from '@/actions/polls';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type VoteChoice = 'favor' | 'contra' | 'abstencion';

interface Props {
  communityId: string;
  pollId: string;
  existingVote?: VoteChoice | null;
  canVoteEconomic: boolean;
  pollType: 'binary' | 'multiple' | 'budget';
}

const BUTTONS: { choice: VoteChoice; label: string; icon: React.ElementType; color: string; activeColor: string }[] = [
  {
    choice: 'favor',
    label: 'Votar a favor',
    icon: ThumbsUp,
    color: 'hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
    activeColor: 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600',
  },
  {
    choice: 'contra',
    label: 'Votar en contra',
    icon: ThumbsDown,
    color: 'hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300',
    activeColor: 'border-rose-500 bg-rose-500 text-white hover:bg-rose-600',
  },
  {
    choice: 'abstencion',
    label: 'Abstenerme',
    icon: Minus,
    color: 'hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300',
    activeColor: 'border-zinc-500 bg-zinc-500 text-white hover:bg-zinc-600',
  },
];

const VOTE_LABEL: Record<VoteChoice, string> = {
  favor: 'A favor',
  contra: 'En contra',
  abstencion: 'Abstención',
};

export function VotePanel({
  communityId,
  pollId,
  existingVote,
  canVoteEconomic,
  pollType,
}: Props) {
  const [voted, setVoted] = useState<VoteChoice | null>(existingVote ?? null);
  const [pending, startTransition] = useTransition();

  // Budget poll restriction for inquilinos
  if (pollType === 'budget' && !canVoteEconomic) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        Como inquilino, no puedes participar en votaciones de presupuesto.
      </div>
    );
  }

  if (voted) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white',
            voted === 'favor'
              ? 'bg-emerald-500'
              : voted === 'contra'
                ? 'bg-rose-500'
                : 'bg-zinc-500',
          )}
        >
          {voted === 'favor' ? (
            <ThumbsUp className="h-4 w-4" />
          ) : voted === 'contra' ? (
            <ThumbsDown className="h-4 w-4" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">Tu voto ha sido registrado</p>
          <p className="text-xs text-muted-foreground">
            Votaste: <span className="font-medium">{VOTE_LABEL[voted]}</span>
          </p>
        </div>
      </div>
    );
  }

  function handleVote(choice: VoteChoice) {
    startTransition(async () => {
      const result = await castVote(communityId, { pollId, choice });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setVoted(choice);
      toast.success('Voto registrado correctamente');
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Emite tu voto</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {BUTTONS.map(({ choice, label, icon: Icon, color, activeColor }) => (
          <button
            key={choice}
            onClick={() => handleVote(choice)}
            disabled={pending}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border py-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50',
              color,
            )}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Icon className="h-4 w-4" aria-hidden />
            )}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
