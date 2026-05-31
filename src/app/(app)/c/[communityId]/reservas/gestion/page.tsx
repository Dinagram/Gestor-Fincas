import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CalendarCheck2, CalendarX2, Crown, Gauge } from 'lucide-react';

import { KpiCard } from '@/components/shared/kpi-card';
import { requireMember } from '@/lib/auth/require-user';
import { canDo } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';

import { AdminActions } from '../_components/admin/admin-actions';
import { AdminBookingsTable } from '../_components/admin/admin-bookings-table';
import { RoomControls } from '../_components/admin/room-controls';
import type { BookingView } from '../_lib/types';

type Params = Promise<{ communityId: string }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rel = (v: any): any => (Array.isArray(v) ? v[0] : v);

export default async function GestionReservasPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const { role } = await requireMember(communityId);

  if (!canDo(role, 'booking.manage')) {
    redirect(`/c/${communityId}/reservas`);
  }

  const supabase = await createServerClient();

  const { data: room } = await supabase
    .from('rooms')
    .select('id, name, status, open_hour, close_hour, requires_approval')
    .eq('community_id', communityId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!room) redirect(`/c/${communityId}/reservas`);

  const { data: rawBookings } = await supabase
    .from('room_bookings')
    .select(
      'id, starts_at, ends_at, purpose, category, status, kind, attendees, created_by, cancel_reason, units(floor, door), profiles!room_bookings_created_by_fkey(full_name)',
    )
    .eq('community_id', communityId)
    .eq('room_id', room.id)
    .order('starts_at', { ascending: false });

  const bookings: BookingView[] = (rawBookings ?? []).map((b) => {
    const unit = rel(b.units);
    const profile = rel(b.profiles);
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
      unitLabel: unit?.floor != null ? `${unit.floor}º${unit.door ?? ''}`.trim() : null,
      cancelReason: b.cancel_reason,
    };
  });

  // --- KPIs del mes en curso ---
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  const inMonth = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= monthStart && t < monthEnd;
  };

  const monthBookings = bookings.filter((b) => inMonth(b.startsAt));
  const reservasMes = monthBookings.filter((b) => b.status !== 'cancelada').length;
  const cancelaciones = monthBookings.filter((b) => b.status === 'cancelada').length;

  const bookedHours = monthBookings
    .filter((b) => b.status !== 'cancelada')
    .reduce((sum, b) => sum + (new Date(b.endsAt).getTime() - new Date(b.startsAt).getTime()) / 3_600_000, 0);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const availableHours = (room.close_hour - room.open_hour) * daysInMonth;
  const ocupacion = availableHours > 0 ? Math.round((bookedHours / availableHours) * 100) : 0;

  // Vecino más activo (reservas vecinales, histórico)
  const counts = new Map<string, { name: string; n: number }>();
  for (const b of bookings) {
    if (b.kind !== 'vecino' || b.status === 'cancelada') continue;
    const key = b.createdBy;
    const entry = counts.get(key) ?? { name: b.bookedByName ?? 'Vecino', n: 0 };
    entry.n += 1;
    counts.set(key, entry);
  }
  const topUser = [...counts.values()].sort((a, b) => b.n - a.n)[0];

  return (
    <div className="container space-y-6 p-6">
      <header className="space-y-2">
        <Link
          href={`/c/${communityId}/reservas`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la sala
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Gestión de la Sala Multiusos
          </h1>
          <p className="text-sm text-muted-foreground">
            Panel de administración · {room.name}
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Reservas este mes" value={reservasMes} icon={CalendarCheck2} tone="blue" />
        <KpiCard label="Ocupación del mes" value={`${ocupacion}%`} icon={Gauge} tone="amber" />
        <KpiCard label="Cancelaciones" value={cancelaciones} icon={CalendarX2} tone="red" />
        <KpiCard
          label="Vecino más activo"
          value={topUser?.name ?? '—'}
          icon={Crown}
          tone="green"
          trend={topUser ? { value: `${topUser.n} reserva${topUser.n === 1 ? '' : 's'}` } : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Tabla de todas las reservas */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Todas las reservas</h2>
          <AdminBookingsTable communityId={communityId} bookings={bookings} />
        </div>

        {/* Controles */}
        <aside className="space-y-4">
          <RoomControls
            communityId={communityId}
            roomId={room.id}
            status={room.status}
            requiresApproval={room.requires_approval}
          />
          <AdminActions
            communityId={communityId}
            openHour={room.open_hour}
            closeHour={room.close_hour}
          />
        </aside>
      </div>
    </div>
  );
}
