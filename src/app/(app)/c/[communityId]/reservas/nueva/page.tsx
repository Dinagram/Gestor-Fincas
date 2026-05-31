import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { requireMember } from '@/lib/auth/require-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';

import { BookingForm } from '../_components/booking-form';
import type { BookingView, RoomRulesView, RoomView } from '../_lib/types';

type Params = Promise<{ communityId: string }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rel = (v: any): any => (Array.isArray(v) ? v[0] : v);

export default async function NuevaReservaPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const { role } = await requireMember(communityId);

  if (!canDo(role, 'booking.create')) {
    redirect(`/c/${communityId}/reservas`);
  }

  const supabase = await createServerClient();
  const { data: room } = await supabase
    .from('rooms')
    .select('id, name, description, capacity, status, open_hour, close_hour, requires_approval, out_of_service_reason')
    .eq('community_id', communityId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!room) redirect(`/c/${communityId}/reservas`);

  const [{ data: rulesRow }, { data: rawBookings }] = await Promise.all([
    supabase
      .from('room_booking_rules')
      .select('max_per_unit_per_month, min_advance_hours, max_duration_hours, max_attendees')
      .eq('room_id', room.id)
      .maybeSingle(),
    supabase
      .from('room_bookings')
      .select('id, starts_at, ends_at, purpose, category, status, kind, attendees, created_by, cancel_reason')
      .eq('community_id', communityId)
      .eq('room_id', room.id),
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

  const bookings: BookingView[] = (rawBookings ?? []).map((b) => ({
    id: b.id,
    startsAt: b.starts_at,
    endsAt: b.ends_at,
    purpose: b.purpose,
    category: b.category,
    status: b.status,
    kind: b.kind,
    attendees: b.attendees,
    createdBy: b.created_by,
    bookedByName: rel(b)?.full_name ?? null,
    unitLabel: null,
    cancelReason: b.cancel_reason,
  }));

  return (
    <div className="container max-w-2xl space-y-6 p-6">
      <Link
        href={`/c/${communityId}/reservas`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la sala
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Nueva reserva</h1>
        <p className="text-sm text-muted-foreground">
          Selecciona fecha y franja horaria de {roomView.name} y acepta las normas de uso.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <BookingForm
            communityId={communityId}
            room={roomView}
            rules={rules}
            bookings={bookings}
          />
        </CardContent>
      </Card>
    </div>
  );
}
