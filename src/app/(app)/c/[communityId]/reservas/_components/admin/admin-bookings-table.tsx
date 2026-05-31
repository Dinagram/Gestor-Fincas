import Link from 'next/link';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BOOKING_CATEGORY_LABEL } from '@/lib/constants';
import { formatDate } from '@/lib/date';

import { BookingKindPill, BookingStatusPill } from '../booking-status-pill';
import { CancelBookingDialog } from '../cancel-booking-dialog';
import { ModerateButtons } from '../moderate-buttons';
import type { BookingView } from '../../_lib/types';

interface Props {
  communityId: string;
  bookings: BookingView[];
}

export function AdminBookingsTable({ communityId, bookings }: Props) {
  const now = Date.now();
  const sorted = [...bookings].sort(
    (a, b) => +new Date(b.startsAt) - +new Date(a.startsAt),
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="max-h-[560px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Fecha</th>
              <th className="px-4 py-2.5 font-medium">Motivo</th>
              <th className="hidden px-4 py-2.5 font-medium md:table-cell">Vecino</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((b) => {
              const start = new Date(b.startsAt);
              const end = new Date(b.endsAt);
              const futureActive =
                (b.status === 'confirmada' || b.status === 'pendiente') &&
                end.getTime() > now;
              return (
                <tr key={b.id} className="transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <div className="font-medium tabular-nums">{formatDate(start, 'd MMM')}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {formatDate(start, 'HH:mm')}–{formatDate(end, 'HH:mm')}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/c/${communityId}/reservas/${b.id}`}
                      className="font-medium hover:underline"
                    >
                      {b.purpose}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{BOOKING_CATEGORY_LABEL[b.category]}</span>
                      <BookingKindPill kind={b.kind} className="px-1.5 py-0" />
                    </div>
                  </td>
                  <td className="hidden px-4 py-2.5 md:table-cell">
                    <div className="text-sm">{b.bookedByName ?? '—'}</div>
                    {b.unitLabel && (
                      <div className="text-xs text-muted-foreground">{b.unitLabel}</div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <BookingStatusPill status={b.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'pendiente' && (
                        <ModerateButtons communityId={communityId} bookingId={b.id} />
                      )}
                      {futureActive && (
                        <CancelBookingDialog
                          communityId={communityId}
                          bookingId={b.id}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
