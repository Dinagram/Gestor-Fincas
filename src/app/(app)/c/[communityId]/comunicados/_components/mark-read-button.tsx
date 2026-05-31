'use client';

import { useTransition } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

import { markAnnouncementRead } from '@/actions/announcements';
import { Button } from '@/components/ui/button';

interface Props {
  communityId: string;
  announcementId: string;
}

export function MarkReadButton({ communityId, announcementId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleMark() {
    startTransition(async () => {
      const result = await markAnnouncementRead(communityId, announcementId);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleMark} disabled={isPending} className="gap-1.5">
      <Check className="h-3.5 w-3.5" />
      {isPending ? 'Marcando…' : 'Marcar leído'}
    </Button>
  );
}
