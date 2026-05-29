'use client';

import { useOptimistic, useTransition } from 'react';
import { ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toggleIssueSupport } from '@/actions/issues';

interface Props {
  issueId: string;
  initialSupported: boolean;
  initialCount: number;
}

interface SupportState {
  supported: boolean;
  count: number;
}

export function IssueSupportButton({ issueId, initialSupported, initialCount }: Props) {
  const [pending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic<SupportState, SupportState>(
    { supported: initialSupported, count: initialCount },
    (_, next) => next,
  );

  function handleClick() {
    if (pending) return;
    const next = !state.supported;
    startTransition(async () => {
      setOptimistic({ supported: next, count: state.count + (next ? 1 : -1) });
      const result = await toggleIssueSupport(issueId);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <Button
      type="button"
      variant={state.supported ? 'default' : 'outline'}
      onClick={handleClick}
      disabled={pending}
      className={cn('gap-2', state.supported && 'shadow-sm')}
    >
      <ThumbsUp className="h-4 w-4" />
      Me sumo
      <span className="rounded bg-background/20 px-1.5 text-xs font-semibold">{state.count}</span>
    </Button>
  );
}
