-- =====================================================================
-- 0007 — Sala Multiusos: rooms, room_booking_rules, room_bookings,
--        room_booking_participants
-- =====================================================================
-- Módulo de reservas de espacios comunes (estilo Calendly / Notion
-- Calendar). Una comunidad puede tener una o varias salas reservables.
-- Las reglas de negocio (antelación 48h, máx. 2/mes por vivienda, sin
-- solapes) se aplican en el Server Action; aquí se modela el esquema +
-- la configuración por sala (room_booking_rules).
--
-- IMPORTANTE: el loop global enable/force RLS de 0005 ya se ejecutó antes
-- de existir estas tablas, así que aquí habilitamos + forzamos RLS y
-- declaramos las políticas explícitamente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.room_status as enum ('disponible', 'fuera_servicio');

create type public.booking_status as enum (
  'pendiente',
  'confirmada',
  'cancelada',
  'completada'
);

create type public.booking_category as enum (
  'reunion',
  'cumpleanos',
  'deporte',
  'taller',
  'otro'
);

-- vecino: reserva normal de un residente
-- comunidad: evento organizado por la comunidad (junta/admin)
-- bloqueo: franja bloqueada por administración (mantenimiento, etc.)
create type public.booking_kind as enum ('vecino', 'comunidad', 'bloqueo');

-- ---------------------------------------------------------------------
-- rooms — espacios reservables (p.ej. "Sala Multiusos")
-- ---------------------------------------------------------------------
create table public.rooms (
  id                    uuid primary key default gen_random_uuid(),
  community_id          uuid not null references public.communities(id) on delete cascade,
  name                  text not null,
  description           text,
  capacity              integer not null default 0,
  status                room_status not null default 'disponible',
  open_hour             smallint not null default 9,
  close_hour            smallint not null default 22,
  requires_approval     boolean not null default false,
  out_of_service_reason text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (community_id, name),
  check (open_hour >= 0 and close_hour <= 24 and open_hour < close_hour)
);

create index idx_rooms_community on public.rooms (community_id);

create trigger trg_rooms_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- room_booking_rules — configuración de reglas por sala (1 fila/sala)
-- ---------------------------------------------------------------------
create table public.room_booking_rules (
  id                      uuid primary key default gen_random_uuid(),
  community_id            uuid not null references public.communities(id) on delete cascade,
  room_id                 uuid not null references public.rooms(id) on delete cascade,
  max_per_unit_per_month  smallint not null default 2,
  min_advance_hours       smallint not null default 48,
  max_duration_hours      smallint not null default 4,
  max_attendees           smallint,
  rules_text              text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (room_id)
);

create index idx_booking_rules_community on public.room_booking_rules (community_id);

create trigger trg_room_booking_rules_updated_at
  before update on public.room_booking_rules
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- room_bookings — reservas
-- ---------------------------------------------------------------------
create table public.room_bookings (
  id                 uuid primary key default gen_random_uuid(),
  community_id       uuid not null references public.communities(id) on delete cascade,
  room_id            uuid not null references public.rooms(id) on delete cascade,
  unit_id            uuid references public.units(id) on delete set null,
  created_by         uuid not null references public.profiles(id),
  starts_at          timestamptz not null,
  ends_at            timestamptz not null,
  purpose            text not null,
  category           booking_category not null default 'otro',
  attendees          smallint,
  status             booking_status not null default 'confirmada',
  kind               booking_kind not null default 'vecino',
  rules_accepted_at  timestamptz,
  cancelled_at       timestamptz,
  cancel_reason      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index idx_bookings_community_room   on public.room_bookings (community_id, room_id, starts_at);
create index idx_bookings_created_by       on public.room_bookings (created_by);
create index idx_bookings_unit             on public.room_bookings (unit_id);
create index idx_bookings_community_status on public.room_bookings (community_id, status);

create trigger trg_room_bookings_updated_at
  before update on public.room_bookings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- room_booking_participants — asistentes de una reserva (opcional)
-- ---------------------------------------------------------------------
create table public.room_booking_participants (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  booking_id    uuid not null references public.room_bookings(id) on delete cascade,
  profile_id    uuid references public.profiles(id) on delete set null,
  guest_name    text,
  created_at    timestamptz not null default now()
);

create index idx_booking_participants_booking on public.room_booking_participants (booking_id);
create index idx_booking_participants_profile on public.room_booking_participants (profile_id);

-- =====================================================================
-- RLS — enable + force + policies
-- =====================================================================
alter table public.rooms                     enable row level security;
alter table public.rooms                     force  row level security;
alter table public.room_booking_rules        enable row level security;
alter table public.room_booking_rules        force  row level security;
alter table public.room_bookings             enable row level security;
alter table public.room_bookings             force  row level security;
alter table public.room_booking_participants enable row level security;
alter table public.room_booking_participants force  row level security;

-- ---- rooms ----------------------------------------------------------
create policy rooms_select on public.rooms
  for select using (public.is_member(community_id));

create policy rooms_modify on public.rooms
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

-- ---- room_booking_rules --------------------------------------------
create policy room_booking_rules_select on public.room_booking_rules
  for select using (public.is_member(community_id));

create policy room_booking_rules_modify on public.room_booking_rules
  for all
  using (public.is_admin_or_junta(community_id))
  with check (public.is_admin_or_junta(community_id));

-- ---- room_bookings --------------------------------------------------
-- Todos los miembros ven el calendario (disponibilidad). La inserción
-- exige identidad de autor; actualizar (cancelar) lo hace el autor o
-- junta/admin; el borrado físico solo admin_finca.
create policy room_bookings_select on public.room_bookings
  for select using (public.is_member(community_id));

create policy room_bookings_insert on public.room_bookings
  for insert with check (
    public.is_member(community_id)
    and created_by = auth.uid()
  );

create policy room_bookings_update on public.room_bookings
  for update
  using (created_by = auth.uid() or public.is_admin_or_junta(community_id))
  with check (created_by = auth.uid() or public.is_admin_or_junta(community_id));

create policy room_bookings_delete on public.room_bookings
  for delete using (public.has_role(community_id, 'admin_finca'));

-- ---- room_booking_participants --------------------------------------
create policy room_booking_participants_select on public.room_booking_participants
  for select using (public.is_member(community_id));

create policy room_booking_participants_modify on public.room_booking_participants
  for all
  using (
    public.is_admin_or_junta(community_id)
    or exists (
      select 1 from public.room_bookings b
       where b.id = room_booking_participants.booking_id
         and b.created_by = auth.uid()
    )
  )
  with check (
    public.is_admin_or_junta(community_id)
    or exists (
      select 1 from public.room_bookings b
       where b.id = room_booking_participants.booking_id
         and b.created_by = auth.uid()
    )
  );
