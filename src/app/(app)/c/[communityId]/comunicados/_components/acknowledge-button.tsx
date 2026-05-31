'use client';

import { useTransition } from 'react';
import { CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

import { acknowledgeAnnouncement } from '@/actions/announcements';
import { Button } from '@/components/ui/button';

interface Props {
  communityId: string;
  announcementId: string;
}

export function AcknowledgeButton({ communityId, announcementId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleAck() {
    startTransition(async () => {
      const result = await acknowledgeAnnouncement(communityId, announcementId);
      if (result.ok) {
        toast.success('Acuse de recibo registrado');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleAck}
      disabled={isPending}
      className="gap-1.5"
    >
      <CheckCheck className="h-3.5 w-3.5" />
      {isPending ? 'Registrando…' : 'Acusar recibo'}
    </Button>
  );
}
