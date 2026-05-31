'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { moderateBooking } from '@/actions/bookings';
import { Button } from '@/components/ui/button';

interface Props {
  communityId: string;
  bookingId: string;
}

export function ModerateButtons({ communityId, bookingId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function decide(decision: 'confirmar' | 'rechazar') {
    startTransition(async () => {
      const result = await moderateBooking(communityId, { bookingId, decision });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(decision === 'confirmar' ? 'Reserva aprobada' : 'Reserva rechazada');
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => decide('confirmar')} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Aprobar
      </Button>
      <Button size="sm" variant="outline" onClick={() => decide('rechazar')} disabled={pending}>
        <X className="h-4 w-4" />
        Rechazar
      </Button>
    </div>
  );
}
