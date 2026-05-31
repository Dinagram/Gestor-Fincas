import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock, Hash, Tag, Users, X } from 'lucide-react';

import { AvatarGradient } from '@/components/shared/avatar-gradient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  BOOKING_CATEGORY_LABEL,
  BOOKING_KIND_LABEL,
} from '@/lib/constants';
import { formatDate, relativeTime } from '@/lib/date';
import { requireMember } from '@/lib/auth/require-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';

import { BookingStatusPill, BookingKindPill } from '../_components/booking-status-pill';
import { CancelBookingDialog } from '../_components/cancel-booking-dialog';
import { ModerateButtons } from '../_components/moderate-buttons';
import { RulesChecklist } from '../_components/rules-checklist';

type Params = Promise<{ communityId: string; id: string }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rel = (v: any): any => (Array.isArray(v) ? v[0] : v);

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default async function BookingDetailPage({ params }: { params: Params }) {
  const { communityId, id } = await params;
  const { user, role } = await requireMember(communityId);

  const supabase = await createServerClient();

  const { data: booking } = await supabase
    .from('room_bookings')
    .select(
      'id, starts_at, ends_at, purpose, category, status, kind, attendees, created_by, cancel_reason, cancelled_at, created_at, units(floor, door), profiles!room_bookings_created_by_fkey(full_name, email)',
    )
    .eq('id', id)
    .eq('community_id', communityId)
    .maybeSingle();

  if (!booking) notFound();

  const { data: participants } = await supabase
    .from('room_booking_participants')
    .select('id, guest_name, profiles(full_name)')
    .eq('booking_id', id)
    .eq('community_id', communityId);

  const start = new Date(booking.starts_at);
  const end = new Date(booking.ends_at);
  const durationH = Math.round((end.getTime() - start.getTime()) / 3_600_000);
  const profile = rel(booking.profiles);
  const unit = rel(booking.units);
  const bookedBy = profile?.full_name ?? 'Vecino';
  const unitLabel = unit?.floor != null ? `${unit.floor}º${unit.door ?? ''}`.trim() : null;

  const isOwner = booking.created_by === user.id;
  const isManager = canDo(role, 'booking.manage');
  const isFutureActive =
    (booking.status === 'confirmada' || booking.status === 'pendiente') &&
    end.getTime() > Date.now();
  const canCancel = isFutureActive && (isOwner || isManager);
  const canModerate = booking.status === 'pendiente' && canDo(role, 'booking.manage');

  return (
    <div className="container max-w-3xl space-y-6 p-6">
      <Link
        href={`/c/${communityId}/reservas`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la sala
      </Link>

      <Card>
        <CardHeader className="space-y-3 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusPill status={booking.status} />
            <BookingKindPill kind={booking.kind} />
          </div>
          <h1 className="font-display text-2xl font-semibold leading-snug">{booking.purpose}</h1>
          <div className="flex items-center gap-2">
            <AvatarGradient name={bookedBy} seed={booking.created_by} className="h-7 w-7 text-[10px]" />
            <div>
              <p className="text-sm font-medium">
                {booking.kind === 'vecino' ? bookedBy : 'Administración'}
                {unitLabel && booking.kind === 'vecino' && (
                  <span className="ml-1 text-muted-foreground">· {unitLabel}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Solicitada {relativeTime(booking.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 border-t pt-5">
          {booking.status === 'cancelada' && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-medium">Reserva cancelada</p>
              {booking.cancelled_at && (
                <p className="text-xs">El {formatDate(booking.cancelled_at, "d 'de' MMMM 'a las' HH:mm")}</p>
              )}
              {booking.cancel_reason && <p className="mt-1">Motivo: {booking.cancel_reason}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Fact icon={CalendarDays} label="Fecha" value={formatDate(start, "EEEE d 'de' MMMM")} />
            <Fact
              icon={Clock}
              label="Horario"
              value={`${formatDate(start, 'HH:mm')}–${formatDate(end, 'HH:mm')}`}
            />
            <Fact icon={Hash} label="Duración" value={`${durationH} h`} />
            <Fact icon={Tag} label="Tipo" value={BOOKING_CATEGORY_LABEL[booking.category]} />
            {booking.attendees != null && (
              <Fact icon={Users} label="Asistentes" value={booking.attendees} />
            )}
          </div>

          {participants && participants.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Participantes
              </p>
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => {
                  const pp = rel(p.profiles);
                  const name = pp?.full_name ?? p.guest_name ?? 'Invitado';
                  return (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 py-0.5 pl-0.5 pr-2.5 text-xs"
                    >
                      <AvatarGradient name={name} seed={p.id} className="h-5 w-5 text-[8px]" />
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Normas */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Normas de uso aceptadas
            </p>
            <RulesChecklist />
          </div>

          {/* Acciones */}
          {(canCancel || canModerate) && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              {canModerate ? (
                <ModerateButtons communityId={communityId} bookingId={booking.id} />
              ) : (
                <span />
              )}
              {canCancel && (
                <CancelBookingDialog
                  communityId={communityId}
                  bookingId={booking.id}
                  trigger={
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      <X className="h-4 w-4" />
                      Cancelar reserva
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {booking.kind !== 'vecino' && (
        <p className="text-center text-xs text-muted-foreground">
          {BOOKING_KIND_LABEL[booking.kind]} gestionado por la administración.
        </p>
      )}
    </div>
  );
}
