-- =====================================================================
-- Seed — Comunidad "Dr. Domagk 2"
-- =====================================================================
-- Self-contained: `supabase db reset` recreates the WHOLE database
-- (including the auth schema), so the demo users are seeded here in
-- auth.users directly rather than via an external script. The
-- on_auth_user_created trigger then creates matching public.profiles.
--
-- Bootstrap / refresh (single command):
--   pnpm db:reset
--
-- All demo users share the password: demo-Pass-1234
--
-- This seed is idempotent (uses ON CONFLICT) so it can be re-run safely.
-- =====================================================================

-- ---- Auth users (local demo; password = demo-Pass-1234) -------------
-- Stable UUIDs (aaaa0001-…) keep the seed deterministic across resets.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, email_change, email_change_token_new, recovery_token,
  created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  x.id,
  'authenticated',
  'authenticated',
  x.email,
  crypt('demo-Pass-1234', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', x.full_name, 'email_verified', true),
  '', '', '', '',
  now(),
  now()
from (values
  ('aaaa0001-0000-0000-0000-000000000001'::uuid, 'miguel.fortes@dinagram.es',  'Miguel Fortes'),
  ('aaaa0001-0000-0000-0000-000000000002'::uuid, 'admin@dr-domagk-2.com',      'Carlos Ruiz Vázquez'),
  ('aaaa0001-0000-0000-0000-000000000003'::uuid, 'maria.garcia@example.com',    'María García López'),
  ('aaaa0001-0000-0000-0000-000000000004'::uuid, 'pedro.fernandez@example.com', 'Pedro Fernández Soto'),
  ('aaaa0001-0000-0000-0000-000000000005'::uuid, 'beatriz.romero@example.com',  'Beatriz Romero Díaz'),
  ('aaaa0001-0000-0000-0000-000000000006'::uuid, 'juan.martinez@example.com',   'Juan Martínez Ruiz'),
  ('aaaa0001-0000-0000-0000-000000000007'::uuid, 'isabel.sanchez@example.com',  'Isabel Sánchez Moreno'),
  ('aaaa0001-0000-0000-0000-000000000008'::uuid, 'antonio.lopez@example.com',   'Antonio López Gil'),
  ('aaaa0001-0000-0000-0000-000000000009'::uuid, 'carmen.diaz@example.com',     'Carmen Díaz Castillo'),
  ('aaaa0001-0000-0000-0000-000000000010'::uuid, 'francisco.gomez@example.com', 'Francisco Gómez Ortega'),
  ('aaaa0001-0000-0000-0000-000000000011'::uuid, 'lucia.jimenez@example.com',   'Lucía Jiménez Romero'),
  ('aaaa0001-0000-0000-0000-000000000012'::uuid, 'david.alvarez@example.com',   'David Álvarez Núñez'),
  ('aaaa0001-0000-0000-0000-000000000013'::uuid, 'pilar.molina@example.com',    'Pilar Molina Vargas'),
  ('aaaa0001-0000-0000-0000-000000000014'::uuid, 'javier.serrano@example.com',  'Javier Serrano Pardo'),
  ('aaaa0001-0000-0000-0000-000000000015'::uuid, 'elena.castro@example.com',    'Elena Castro Hidalgo'),
  ('aaaa0001-0000-0000-0000-000000000016'::uuid, 'manuel.ortiz@example.com',    'Manuel Ortiz Lara'),
  ('aaaa0001-0000-0000-0000-000000000017'::uuid, 'rosa.delgado@example.com',    'Rosa Delgado Marín'),
  ('aaaa0001-0000-0000-0000-000000000018'::uuid, 'sergio.iglesias@example.com', 'Sergio Iglesias Pena'),
  ('aaaa0001-0000-0000-0000-000000000019'::uuid, 'monica.parra@example.com',    'Mónica Parra Bravo'),
  ('aaaa0001-0000-0000-0000-000000000020'::uuid, 'inquilino1@example.com',      'Andrea Vidal Cano'),
  ('aaaa0001-0000-0000-0000-000000000021'::uuid, 'inquilino2@example.com',      'Raúl Méndez Sanz')
) as x(id, email, full_name)
on conflict (id) do nothing;

-- Email identities (GoTrue requires these for email/password login).
insert into auth.identities (
  provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
select
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(), now(), now()
from auth.users u
where u.id::text like 'aaaa0001-%'
on conflict (provider_id, provider) do nothing;

-- ---- Community ------------------------------------------------------
insert into public.communities (id, name, address, cif, postal_code, city, province, plan)
values (
  '11111111-1111-1111-1111-111111111111',
  'Dr. Domagk 2',
  'Calle Dr. Domagk, 2',
  'H12345678',
  '28033',
  'Madrid',
  'Madrid',
  'pro'
)
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address;

-- ---- Units (5 floors × 4 doors + 4 garages + 2 storages) ------------
insert into public.units (community_id, floor, door, type, surface_m2, coefficient)
select
  '11111111-1111-1111-1111-111111111111',
  f.floor,
  d.door,
  'vivienda'::unit_type,
  85.5,
  4.8
from (values ('1'),('2'),('3'),('4'),('5')) as f(floor),
     (values ('A'),('B'),('C'),('D')) as d(door)
on conflict do nothing;

insert into public.units (community_id, floor, door, type, surface_m2, coefficient)
values
  ('11111111-1111-1111-1111-111111111111', '-1', 'G1', 'garaje',   12,  0.5),
  ('11111111-1111-1111-1111-111111111111', '-1', 'G2', 'garaje',   12,  0.5),
  ('11111111-1111-1111-1111-111111111111', '-1', 'G3', 'garaje',   12,  0.5),
  ('11111111-1111-1111-1111-111111111111', '-1', 'G4', 'garaje',   12,  0.5),
  ('11111111-1111-1111-1111-111111111111', '-2', 'T1', 'trastero', 6,   0.2),
  ('11111111-1111-1111-1111-111111111111', '-2', 'T2', 'trastero', 6,   0.2)
on conflict do nothing;

-- ---- Profiles ------------------------------------------------------
-- INSERT only for auth.users that exist (JOIN filters out missing ids),
-- and UPDATE on conflict so re-runs refresh names/phones.
insert into public.profiles (id, full_name, email, phone)
select au.id, x.full_name, au.email, x.phone
from (values
  ('aaaa0001-0000-0000-0000-000000000001'::uuid, 'Miguel Fortes',          '+34 600 000 001'),
  ('aaaa0001-0000-0000-0000-000000000002'::uuid, 'Carlos Ruiz Vázquez',    '+34 600 000 002'),
  ('aaaa0001-0000-0000-0000-000000000003'::uuid, 'María García López',     '+34 600 000 003'),
  ('aaaa0001-0000-0000-0000-000000000004'::uuid, 'Pedro Fernández Soto',   '+34 600 000 004'),
  ('aaaa0001-0000-0000-0000-000000000005'::uuid, 'Beatriz Romero Díaz',    '+34 600 000 005'),
  ('aaaa0001-0000-0000-0000-000000000006'::uuid, 'Juan Martínez Ruiz',     '+34 600 000 006'),
  ('aaaa0001-0000-0000-0000-000000000007'::uuid, 'Isabel Sánchez Moreno',  '+34 600 000 007'),
  ('aaaa0001-0000-0000-0000-000000000008'::uuid, 'Antonio López Gil',      '+34 600 000 008'),
  ('aaaa0001-0000-0000-0000-000000000009'::uuid, 'Carmen Díaz Castillo',   '+34 600 000 009'),
  ('aaaa0001-0000-0000-0000-000000000010'::uuid, 'Francisco Gómez Ortega', '+34 600 000 010'),
  ('aaaa0001-0000-0000-0000-000000000011'::uuid, 'Lucía Jiménez Romero',   '+34 600 000 011'),
  ('aaaa0001-0000-0000-0000-000000000012'::uuid, 'David Álvarez Núñez',    '+34 600 000 012'),
  ('aaaa0001-0000-0000-0000-000000000013'::uuid, 'Pilar Molina Vargas',    '+34 600 000 013'),
  ('aaaa0001-0000-0000-0000-000000000014'::uuid, 'Javier Serrano Pardo',   '+34 600 000 014'),
  ('aaaa0001-0000-0000-0000-000000000015'::uuid, 'Elena Castro Hidalgo',   '+34 600 000 015'),
  ('aaaa0001-0000-0000-0000-000000000016'::uuid, 'Manuel Ortiz Lara',      '+34 600 000 016'),
  ('aaaa0001-0000-0000-0000-000000000017'::uuid, 'Rosa Delgado Marín',     '+34 600 000 017'),
  ('aaaa0001-0000-0000-0000-000000000018'::uuid, 'Sergio Iglesias Pena',   '+34 600 000 018'),
  ('aaaa0001-0000-0000-0000-000000000019'::uuid, 'Mónica Parra Bravo',     '+34 600 000 019'),
  ('aaaa0001-0000-0000-0000-000000000020'::uuid, 'Andrea Vidal Cano',      '+34 600 000 020'),
  ('aaaa0001-0000-0000-0000-000000000021'::uuid, 'Raúl Méndez Sanz',       '+34 600 000 021')
) as x(id, full_name, phone)
join auth.users au on au.id = x.id
on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone;

-- ---- Community members ----------------------------------------------
-- Roles: admin_finca (Miguel), junta (Carlos, Beatriz),
-- propietarios (resto excepto los inquilinos), inquilinos (Andrea, Raúl)
with u as (
  select id, floor, door from public.units
   where community_id = '11111111-1111-1111-1111-111111111111'
)
insert into public.community_members (community_id, profile_id, unit_id, role, status, joined_at)
select '11111111-1111-1111-1111-111111111111', x.profile_id, u.id, x.role, 'active', now()
from (values
  ('aaaa0001-0000-0000-0000-000000000001'::uuid, '3'::text, 'B'::text, 'admin_finca'::member_role),
  ('aaaa0001-0000-0000-0000-000000000002'::uuid, '1', 'A', 'junta'::member_role),
  ('aaaa0001-0000-0000-0000-000000000003'::uuid, '1', 'B', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000004'::uuid, '1', 'C', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000005'::uuid, '1', 'D', 'junta'::member_role),
  ('aaaa0001-0000-0000-0000-000000000006'::uuid, '2', 'A', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000007'::uuid, '2', 'B', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000008'::uuid, '2', 'C', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000009'::uuid, '2', 'D', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000010'::uuid, '3', 'A', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000011'::uuid, '3', 'C', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000012'::uuid, '3', 'D', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000013'::uuid, '4', 'A', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000014'::uuid, '4', 'B', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000015'::uuid, '4', 'C', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000016'::uuid, '4', 'D', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000017'::uuid, '5', 'A', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000018'::uuid, '5', 'B', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000019'::uuid, '5', 'C', 'propietario'::member_role),
  ('aaaa0001-0000-0000-0000-000000000020'::uuid, '5', 'D', 'inquilino'::member_role),
  ('aaaa0001-0000-0000-0000-000000000021'::uuid, '4', 'B', 'inquilino'::member_role)
) as x(profile_id, floor, door, role)
join u on u.floor = x.floor and u.door = x.door
on conflict (community_id, profile_id, unit_id) do nothing;

-- ---- Cuotas y estado de pago (demo) ---------------------------------
-- Establece monthly_fee y payment_status para los miembros del demo.
update public.community_members cm
set monthly_fee    = x.fee,
    payment_status = x.status
from (values
  ('aaaa0001-0000-0000-0000-000000000001'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000002'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000003'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000004'::uuid, 120.00, 'moroso'),   -- Pedro Fernández
  ('aaaa0001-0000-0000-0000-000000000005'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000006'::uuid, 120.00, 'moroso'),   -- Juan Martínez
  ('aaaa0001-0000-0000-0000-000000000007'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000008'::uuid, 120.00, 'pendiente'),
  ('aaaa0001-0000-0000-0000-000000000009'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000010'::uuid, 145.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000011'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000012'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000013'::uuid, 145.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000014'::uuid, 120.00, 'moroso'),   -- Javier Serrano
  ('aaaa0001-0000-0000-0000-000000000015'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000016'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000017'::uuid, 145.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000018'::uuid, 120.00, 'al_dia'),
  ('aaaa0001-0000-0000-0000-000000000019'::uuid, 120.00, 'pendiente'),
  ('aaaa0001-0000-0000-0000-000000000020'::uuid,   0.00, 'al_dia'),   -- Inquilino: cuota 0
  ('aaaa0001-0000-0000-0000-000000000021'::uuid,   0.00, 'al_dia')    -- Inquilino: cuota 0
) as x(profile_id, fee, status)
where cm.community_id = '11111111-1111-1111-1111-111111111111'
  and cm.profile_id   = x.profile_id;

-- ---- Issues (with code auto-generated by trigger) -------------------
-- We use deterministic IDs to reference them in comments below.
insert into public.issues (id, community_id, title, description, category, priority, status, location, created_by, created_at)
values
  ('22222222-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'Ascensor parado entre planta 2 y 3',
   'El ascensor lleva parado desde esta mañana entre la planta 2 y la 3. Suena un pitido continuo.',
   'ascensor', 'urgente', 'en_curso', 'Ascensor principal',
   'aaaa0001-0000-0000-0000-000000000007', now() - interval '5 days'),

  ('22222222-0000-0000-0000-000000000002',
   '11111111-1111-1111-1111-111111111111',
   'Gotera en la entrada del portal',
   'Cuando llueve cae agua justo en la entrada, sobre los buzones.',
   'fontaneria', 'alta', 'abierta', 'Portal',
   'aaaa0001-0000-0000-0000-000000000003', now() - interval '3 days'),

  ('22222222-0000-0000-0000-000000000003',
   '11111111-1111-1111-1111-111111111111',
   'Ruidos nocturnos en el 4ºB',
   'Llevamos varias noches con música muy alta a partir de las 2:00 AM.',
   'ruido', 'media', 'en_revision', 'Planta 4',
   'aaaa0001-0000-0000-0000-000000000013', now() - interval '2 days'),

  ('22222222-0000-0000-0000-000000000004',
   '11111111-1111-1111-1111-111111111111',
   'Luz fundida en el rellano del 3º',
   'La bombilla del 3º lleva una semana fundida. Por la noche está oscuro.',
   'electricidad', 'baja', 'resuelta', 'Planta 3',
   'aaaa0001-0000-0000-0000-000000000010', now() - interval '12 days'),

  ('22222222-0000-0000-0000-000000000005',
   '11111111-1111-1111-1111-111111111111',
   'Puerta del garaje no cierra bien',
   'El motor de la puerta del garaje hace ruido y a veces se queda a medio cerrar.',
   'seguridad', 'alta', 'en_curso', 'Garaje',
   'aaaa0001-0000-0000-0000-000000000012', now() - interval '7 days'),

  ('22222222-0000-0000-0000-000000000006',
   '11111111-1111-1111-1111-111111111111',
   'Suciedad en escalera B',
   'La escalera B no se ha limpiado esta semana.',
   'limpieza', 'media', 'abierta', 'Escalera B',
   'aaaa0001-0000-0000-0000-000000000017', now() - interval '1 day'),

  ('22222222-0000-0000-0000-000000000007',
   '11111111-1111-1111-1111-111111111111',
   'Jardín delantero descuidado',
   'Los setos están sin podar y hay malas hierbas.',
   'jardineria', 'baja', 'cerrada', 'Exterior',
   'aaaa0001-0000-0000-0000-000000000005', now() - interval '20 days'),

  ('22222222-0000-0000-0000-000000000008',
   '11111111-1111-1111-1111-111111111111',
   'Grietas en la fachada lado norte',
   'Se aprecian grietas en la pared exterior del lado norte. Conviene revisar.',
   'obras', 'alta', 'en_revision', 'Fachada norte',
   'aaaa0001-0000-0000-0000-000000000001', now() - interval '4 days')
on conflict (id) do nothing;

-- Force the resolved one to actually be marked resolved.
update public.issues
   set status = 'resuelta', resolved_at = now() - interval '6 days'
 where id = '22222222-0000-0000-0000-000000000004';

update public.issues
   set status = 'cerrada'
 where id = '22222222-0000-0000-0000-000000000007';

-- ---- Issue comments (mini chat per issue) ---------------------------
insert into public.issue_comments (issue_id, community_id, author_id, body, created_at)
values
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaa0001-0000-0000-0000-000000000007', 'Acabo de ver que está parado, no funciona ningún botón.', now() - interval '5 days'),
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaa0001-0000-0000-0000-000000000002', 'Aviso a la empresa de mantenimiento, vienen mañana por la mañana.', now() - interval '5 days' + interval '2 hours'),
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaa0001-0000-0000-0000-000000000003', 'Yo tengo que subir compras con mi madre, ¿alguna alternativa?', now() - interval '4 days'),
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaa0001-0000-0000-0000-000000000002', 'El técnico ya está aquí, calcula 1-2 horas más.', now() - interval '1 day'),

  ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'aaaa0001-0000-0000-0000-000000000003', 'He puesto un cubo debajo de momento.', now() - interval '3 days'),
  ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'aaaa0001-0000-0000-0000-000000000001', 'Yo creo que viene del bajante. Habría que verlo desde arriba.', now() - interval '2 days'),

  ('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'aaaa0001-0000-0000-0000-000000000013', 'Hoy de nuevo a las 3 de la madrugada.', now() - interval '2 days'),
  ('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'aaaa0001-0000-0000-0000-000000000005', 'He hablado con ellos, dicen que era una fiesta puntual.', now() - interval '1 day');

-- ---- Issue supports (vecinos sumándose) -----------------------------
insert into public.issue_supports (issue_id, profile_id, community_id, created_at)
values
  ('22222222-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', now() - interval '4 days'),
  ('22222222-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', now() - interval '3 days'),
  ('22222222-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000017', '11111111-1111-1111-1111-111111111111', now() - interval '3 days'),
  ('22222222-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', now() - interval '2 days'),
  ('22222222-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', now() - interval '2 days')
on conflict do nothing;

-- ---- Announcements --------------------------------------------------
insert into public.announcements (community_id, type, title, body, sent_by, sent_at, requires_ack)
values
  ('11111111-1111-1111-1111-111111111111', 'urgente',
   'Corte de agua programado el sábado',
   'El sábado 6 de junio de 09:00 a 14:00 habrá corte general de agua por trabajos en la red municipal.',
   'aaaa0001-0000-0000-0000-000000000002', now() - interval '2 days', false),

  ('11111111-1111-1111-1111-111111111111', 'convocatoria',
   'Junta ordinaria — 15 de junio',
   'Se convoca a todos los propietarios a la junta ordinaria el 15 de junio a las 19:00 en el local de la planta baja. Orden del día adjunto.',
   'aaaa0001-0000-0000-0000-000000000002', now() - interval '5 days', true),

  ('11111111-1111-1111-1111-111111111111', 'resolucion',
   'Aprobación instalación bicicleteros',
   'Tras la votación celebrada, queda aprobada la instalación de bicicleteros en el portal. Presupuesto: 1.450€.',
   'aaaa0001-0000-0000-0000-000000000002', now() - interval '10 days', false),

  ('11111111-1111-1111-1111-111111111111', 'aviso',
   'Nuevo conserje a partir de junio',
   'Damos la bienvenida a Pedro, que se incorpora como conserje. Estará en el portal de 8:00 a 15:00.',
   'aaaa0001-0000-0000-0000-000000000002', now() - interval '1 day', false),

  ('11111111-1111-1111-1111-111111111111', 'aviso',
   'Recordatorio: separación de residuos',
   'Recordad que el contenedor amarillo es solo para envases. Esta semana ha vuelto a aparecer materia orgánica.',
   'aaaa0001-0000-0000-0000-000000000005', now() - interval '6 days', false);

-- ---- Polls ----------------------------------------------------------
insert into public.polls (id, community_id, title, description, type, status, starts_at, ends_at, amount, created_by)
values
  ('33333333-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'Instalación de placas solares',
   'Proyecto para instalar 24 paneles solares en la cubierta. Amortización estimada: 7 años.',
   'budget', 'active', now() - interval '3 days', now() + interval '11 days', 18500,
   'aaaa0001-0000-0000-0000-000000000002'),

  ('33333333-0000-0000-0000-000000000002',
   '11111111-1111-1111-1111-111111111111',
   'Cambio de empresa de limpieza',
   'Propuesta de cambio a "LimpiezasMadrid" tras quejas reiteradas con la actual.',
   'binary', 'closed', now() - interval '30 days', now() - interval '16 days', null,
   'aaaa0001-0000-0000-0000-000000000002'),

  ('33333333-0000-0000-0000-000000000003',
   '11111111-1111-1111-1111-111111111111',
   'Reforma integral del portal',
   'Tres presupuestos sobre la mesa, se valoró en última junta. Inversión 12.000-18.000€.',
   'binary', 'closed', now() - interval '60 days', now() - interval '46 days', 15000,
   'aaaa0001-0000-0000-0000-000000000002')
on conflict (id) do nothing;

-- ---- Budget categories + entries ------------------------------------
insert into public.budget_categories (community_id, name, color)
values
  ('11111111-1111-1111-1111-111111111111', 'Mantenimiento', '#2574e8'),
  ('11111111-1111-1111-1111-111111111111', 'Limpieza',       '#10b981'),
  ('11111111-1111-1111-1111-111111111111', 'Suministros',    '#f59e0b'),
  ('11111111-1111-1111-1111-111111111111', 'Seguros',        '#8b5cf6'),
  ('11111111-1111-1111-1111-111111111111', 'Administración', '#ef4444')
on conflict do nothing;

with cats as (
  select id, name from public.budget_categories
   where community_id = '11111111-1111-1111-1111-111111111111'
)
insert into public.budget_entries (community_id, category_id, year, month, amount_eur, kind, description, entry_date)
select '11111111-1111-1111-1111-111111111111', cats.id, 2026, m.month, x.amount, x.kind, x.descr, make_date(2026, m.month, 15)
from (values
  ('Mantenimiento', 1500, 'presupuestado'::budget_kind, 'Presupuesto mantenimiento mensual'),
  ('Mantenimiento', 1430, 'ejecutado'::budget_kind,     'Revisión trimestral ascensor'),
  ('Limpieza',       950, 'presupuestado'::budget_kind, 'Presupuesto limpieza mensual'),
  ('Limpieza',       980, 'ejecutado'::budget_kind,     'Limpieza portal y escaleras'),
  ('Suministros',    650, 'presupuestado'::budget_kind, 'Luz + agua zonas comunes'),
  ('Suministros',    712, 'ejecutado'::budget_kind,     'Factura mensual luz/agua')
) as x(catname, amount, kind, descr)
join cats on cats.name = x.catname
cross join (values (1),(2),(3),(4),(5)) as m(month);

-- ---- Documents (metadata only — no real files uploaded) -------------
insert into public.documents (community_id, folder, name, storage_path, size_bytes, mime_type, year, uploaded_by, uploaded_at)
values
  ('11111111-1111-1111-1111-111111111111', 'actas',       'Acta Junta Ordinaria 2025-12.pdf',  '11111111-1111-1111-1111-111111111111/documents/actas/acta-2025-12.pdf',  423000, 'application/pdf', 2025, 'aaaa0001-0000-0000-0000-000000000002', now() - interval '120 days'),
  ('11111111-1111-1111-1111-111111111111', 'actas',       'Acta Junta Extraordinaria 2025-09.pdf','11111111-1111-1111-1111-111111111111/documents/actas/acta-2025-09.pdf', 367000, 'application/pdf', 2025, 'aaaa0001-0000-0000-0000-000000000002', now() - interval '210 days'),
  ('11111111-1111-1111-1111-111111111111', 'estatutos',   'Estatutos comunidad (vigentes).pdf', '11111111-1111-1111-1111-111111111111/documents/estatutos/estatutos.pdf',         512000, 'application/pdf', 2018, 'aaaa0001-0000-0000-0000-000000000002', now() - interval '500 days'),
  ('11111111-1111-1111-1111-111111111111', 'seguros',     'Póliza seguro comunidad 2026.pdf',   '11111111-1111-1111-1111-111111111111/documents/seguros/poliza-2026.pdf',          245000, 'application/pdf', 2026, 'aaaa0001-0000-0000-0000-000000000002', now() - interval '60 days'),
  ('11111111-1111-1111-1111-111111111111', 'contratos',   'Contrato mantenimiento ascensor.pdf','11111111-1111-1111-1111-111111111111/documents/contratos/ascensor.pdf',           188000, 'application/pdf', 2024, 'aaaa0001-0000-0000-0000-000000000002', now() - interval '300 days'),
  ('11111111-1111-1111-1111-111111111111', 'contratos',   'Contrato empresa limpieza.pdf',      '11111111-1111-1111-1111-111111111111/documents/contratos/limpieza.pdf',           96000,  'application/pdf', 2025, 'aaaa0001-0000-0000-0000-000000000002', now() - interval '150 days'),
  ('11111111-1111-1111-1111-111111111111', 'certificados','Certificado ITE 2024.pdf',           '11111111-1111-1111-1111-111111111111/documents/certificados/ite-2024.pdf',         312000, 'application/pdf', 2024, 'aaaa0001-0000-0000-0000-000000000002', now() - interval '200 days'),
  ('11111111-1111-1111-1111-111111111111', 'certificados','Certificado eficiencia energética.pdf','11111111-1111-1111-1111-111111111111/documents/certificados/eficiencia.pdf',      201000, 'application/pdf', 2023, 'aaaa0001-0000-0000-0000-000000000002', now() - interval '600 days'),
  ('11111111-1111-1111-1111-111111111111', 'otros',       'Plano edificio.pdf',                 '11111111-1111-1111-1111-111111111111/documents/otros/plano.pdf',                 678000, 'application/pdf', 2018, 'aaaa0001-0000-0000-0000-000000000002', now() - interval '500 days'),
  ('11111111-1111-1111-1111-111111111111', 'otros',       'Listado proveedores.pdf',            '11111111-1111-1111-1111-111111111111/documents/otros/proveedores.pdf',           45000,  'application/pdf', 2026, 'aaaa0001-0000-0000-0000-000000000002', now() - interval '20 days');

-- ---- Sala Multiusos: room + reglas ----------------------------------
insert into public.rooms (id, community_id, name, description, capacity, status, open_hour, close_hour, requires_approval)
values (
  '55555555-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'Sala Multiusos',
  'Espacio común de la comunidad para reuniones vecinales, talleres, celebraciones y actividades. Equipada con mesas, sillas y pequeña cocina office.',
  30,
  'disponible',
  9,
  22,
  false
)
on conflict (id) do nothing;

insert into public.room_booking_rules (community_id, room_id, max_per_unit_per_month, min_advance_hours, max_duration_hours, max_attendees, rules_text)
values (
  '11111111-1111-1111-1111-111111111111',
  '55555555-0000-0000-0000-000000000001',
  2, 48, 4, 30,
  'Acceso exclusivo a residentes · Los invitados deben ir siempre acompañados de un residente · Es obligatorio dejar la sala limpia tras su uso · El solicitante es responsable de los daños ocasionados · Debe respetarse el horario de descanso · No se admiten mascotas.'
)
on conflict (room_id) do nothing;

-- ---- Sala Multiusos: reservas demo (timestamps relativos a now()) ----
-- Base = medianoche de hoy → franjas en horas exactas.
insert into public.room_bookings
  (id, community_id, room_id, unit_id, created_by, starts_at, ends_at, purpose, category, attendees, status, kind, rules_accepted_at)
values
  -- Pasadas (completadas)
  ('55550000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   (select unit_id from public.community_members where community_id = '11111111-1111-1111-1111-111111111111' and profile_id = 'aaaa0001-0000-0000-0000-000000000003' limit 1),
   'aaaa0001-0000-0000-0000-000000000003',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') - interval '10 days' + interval '17 hours',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') - interval '10 days' + interval '19 hours',
   'Reunión de la escalera B', 'reunion', 8, 'completada', 'vecino',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') - interval '12 days'),

  ('55550000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   (select unit_id from public.community_members where community_id = '11111111-1111-1111-1111-111111111111' and profile_id = 'aaaa0001-0000-0000-0000-000000000010' limit 1),
   'aaaa0001-0000-0000-0000-000000000010',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') - interval '6 days' + interval '11 hours',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') - interval '6 days' + interval '13 hours',
   'Taller de manualidades infantil', 'taller', 12, 'completada', 'vecino',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') - interval '9 days'),

  -- Pasada cancelada
  ('55550000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   (select unit_id from public.community_members where community_id = '11111111-1111-1111-1111-111111111111' and profile_id = 'aaaa0001-0000-0000-0000-000000000013' limit 1),
   'aaaa0001-0000-0000-0000-000000000013',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') - interval '4 days' + interval '18 hours',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') - interval '4 days' + interval '21 hours',
   'Cumpleaños infantil', 'cumpleanos', 18, 'cancelada', 'vecino',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') - interval '7 days'),

  -- Evento comunitario en curso AHORA mismo (banner "reservada para conserjería")
  ('55550000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   null,
   'aaaa0001-0000-0000-0000-000000000002',
   now() - interval '30 minutes',
   now() + interval '90 minutes',
   'Uso de conserjería — recepción de paquetería', 'otro', null, 'confirmada', 'comunidad',
   null),

  -- Próximas confirmadas (vecinos)
  ('55550000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   (select unit_id from public.community_members where community_id = '11111111-1111-1111-1111-111111111111' and profile_id = 'aaaa0001-0000-0000-0000-000000000003' limit 1),
   'aaaa0001-0000-0000-0000-000000000003',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '3 days' + interval '18 hours',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '3 days' + interval '20 hours',
   'Reunión de vecinos — derrama fachada', 'reunion', 15, 'confirmada', 'vecino',
   now() - interval '1 day'),

  ('55550000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   (select unit_id from public.community_members where community_id = '11111111-1111-1111-1111-111111111111' and profile_id = 'aaaa0001-0000-0000-0000-000000000005' limit 1),
   'aaaa0001-0000-0000-0000-000000000005',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '4 days' + interval '10 hours',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '4 days' + interval '12 hours',
   'Clase de yoga comunitaria', 'deporte', 10, 'confirmada', 'vecino',
   now() - interval '2 days'),

  ('55550000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   (select unit_id from public.community_members where community_id = '11111111-1111-1111-1111-111111111111' and profile_id = 'aaaa0001-0000-0000-0000-000000000011' limit 1),
   'aaaa0001-0000-0000-0000-000000000011',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '6 days' + interval '17 hours',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '6 days' + interval '20 hours',
   'Cumpleaños infantil', 'cumpleanos', 20, 'confirmada', 'vecino',
   now() - interval '3 hours'),

  ('55550000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   (select unit_id from public.community_members where community_id = '11111111-1111-1111-1111-111111111111' and profile_id = 'aaaa0001-0000-0000-0000-000000000007' limit 1),
   'aaaa0001-0000-0000-0000-000000000007',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '9 days' + interval '19 hours',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '9 days' + interval '21 hours',
   'Taller de cocina vecinal', 'taller', 14, 'confirmada', 'vecino',
   now() - interval '5 hours'),

  -- Reserva propia de Miguel (junta) para demostrar "mis reservas"
  ('55550000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   (select unit_id from public.community_members where community_id = '11111111-1111-1111-1111-111111111111' and profile_id = 'aaaa0001-0000-0000-0000-000000000001' limit 1),
   'aaaa0001-0000-0000-0000-000000000001',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '5 days' + interval '11 hours',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '5 days' + interval '13 hours',
   'Reunión grupo de compras', 'reunion', 6, 'confirmada', 'vecino',
   now() - interval '6 hours'),

  -- Evento comunitario futuro (asamblea)
  ('55550000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   null,
   'aaaa0001-0000-0000-0000-000000000002',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '15 days' + interval '19 hours',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '15 days' + interval '21 hours',
   'Asamblea ordinaria de vecinos', 'reunion', 30, 'confirmada', 'comunidad',
   null),

  -- Bloqueo administrativo (mantenimiento)
  ('55550000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', '55555555-0000-0000-0000-000000000001',
   null,
   'aaaa0001-0000-0000-0000-000000000002',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '7 days' + interval '9 hours',
   (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') + interval '7 days' + interval '14 hours',
   'Mantenimiento del suelo técnico', 'otro', null, 'confirmada', 'bloqueo',
   null)
on conflict (id) do nothing;

update public.room_bookings
   set cancelled_at = (date_trunc('day', now() AT TIME ZONE 'Europe/Madrid') AT TIME ZONE 'Europe/Madrid') - interval '6 days',
       cancel_reason = 'Cambio de fecha de la celebración'
 where id = '55550000-0000-0000-0000-000000000003';

-- ---- Participantes de una reserva ----------------------------------
insert into public.room_booking_participants (community_id, booking_id, profile_id, guest_name)
values
  ('11111111-1111-1111-1111-111111111111', '55550000-0000-0000-0000-000000000005', 'aaaa0001-0000-0000-0000-000000000003', null),
  ('11111111-1111-1111-1111-111111111111', '55550000-0000-0000-0000-000000000005', 'aaaa0001-0000-0000-0000-000000000004', null),
  ('11111111-1111-1111-1111-111111111111', '55550000-0000-0000-0000-000000000005', 'aaaa0001-0000-0000-0000-000000000006', null),
  ('11111111-1111-1111-1111-111111111111', '55550000-0000-0000-0000-000000000005', null, 'Invitado externo (perito)')
on conflict do nothing;
