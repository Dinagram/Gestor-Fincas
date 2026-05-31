import Link from 'next/link';
import { CalendarRange, Settings2 } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { RoleGate } from '@/components/shared/role-gate';
import { Button } from '@/components/ui/button';
import { requireMember } from '@/lib/auth/require-user';
import { createServerClient } from '@/lib/supabase/server';

import { ReservasBoard } from './_components/reservas-board';
import type { BookingView, RoomRulesView, RoomView } from './_lib/types';

type Params = Promise<{ communityId: string }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rel(value: any): any {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReservasPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const { user } = await requireMember(communityId);

  const supabase = await createServerClient();

  const { data: room } = await supabase
    .from('rooms')
    .select(
      'id, name, description, capacity, status, open_hour, close_hour, requires_approval, out_of_service_reason',
    )
    .eq('community_id', communityId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!room) {
    return (
      <div className="container space-y-6 p-6">
        <header>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Sala Multiusos</h1>
          <p className="text-sm text-muted-foreground">Reserva de espacios comunes</p>
        </header>
        <EmptyState
          icon={CalendarRange}
          title="Aún no hay ninguna sala configurada"
          description="El administrador todavía no ha habilitado un espacio reservable para esta comunidad."
        />
      </div>
    );
  }

  const [{ data: rulesRow }, { data: rawBookings }] = await Promise.all([
    supabase
      .from('room_booking_rules')
      .select('max_per_unit_per_month, min_advance_hours, max_duration_hours, max_attendees')
      .eq('room_id', room.id)
      .maybeSingle(),
    supabase
      .from('room_bookings')
      .select(
        'id, starts_at, ends_at, purpose, category, status, kind, attendees, created_by, cancel_reason, units(floor, door), profiles!room_bookings_created_by_fkey(full_name)',
      )
      .eq('community_id', communityId)
      .eq('room_id', room.id)
      .order('starts_at', { ascending: true }),
  ]);

  const roomView: RoomView = {
    id: room.id,
    name: room.name,
    description: room.description,
    capacity: room.capacity,
    status: room.status,
    openHour: room.open_hour,
    closeHour: room.close_hour,
    requiresApproval: room.requires_approval,
    outOfServiceReason: room.out_of_service_reason,
  };

  const rules: RoomRulesView = {
    maxPerUnitPerMonth: rulesRow?.max_per_unit_per_month ?? 2,
    minAdvanceHours: rulesRow?.min_advance_hours ?? 48,
    maxDurationHours: rulesRow?.max_duration_hours ?? 4,
    maxAttendees: rulesRow?.max_attendees ?? null,
  };

  const bookings: BookingView[] = (rawBookings ?? []).map((b) => {
    const unit = rel(b.units);
    const profile = rel(b.profiles);
    const unitLabel = unit?.floor != null ? `${unit.floor}º${unit.door ?? ''}`.trim() : null;
    return {
      id: b.id,
      startsAt: b.starts_at,
      endsAt: b.ends_at,
      purpose: b.purpose,
      category: b.category,
      status: b.status,
      kind: b.kind,
      attendees: b.attendees,
      createdBy: b.created_by,
      bookedByName: profile?.full_name ?? null,
      unitLabel,
      cancelReason: b.cancel_reason,
    };
  });

  const now = Date.now();
  const currentBooking =
    bookings.find(
      (b) =>
        b.status === 'confirmada' &&
        new Date(b.startsAt).getTime() <= now &&
        new Date(b.endsAt).getTime() > now,
    ) ?? null;

  return (
    <div className="container space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Sala Multiusos</h1>
          <p className="text-sm text-muted-foreground">
            Reserva el espacio común de la comunidad de forma digital
          </p>
        </div>
        <RoleGate action="booking.manage">
          <Button asChild variant="outline">
            <Link href={`/c/${communityId}/reservas/gestion`}>
              <Settings2 className="h-4 w-4" />
              Gestión
            </Link>
          </Button>
        </RoleGate>
      </header>

      <ReservasBoard
        communityId={communityId}
        room={roomView}
        rules={rules}
        bookings={bookings}
        currentUserId={user.id}
        currentBooking={currentBooking}
      />
    </div>
  );
}
