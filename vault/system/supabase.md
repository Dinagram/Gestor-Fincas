---
id: sys_supabase
type: system
name: Supabase Backend
path: supabase/
description: >
  Backend completo del proyecto. Auth (JWT/cookies SSR), Postgres + RLS (datos),
  Storage (ficheros), Realtime (instalado, no cableado). En local corre via Docker.

parents:
  - id: sys_gestionfinca

children:
  - id: con_rls

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: con_rls
    type: implements
    weight: 1.0
  - target: file_types_database
    type: triggers
    weight: 0.9
  - target: file_lib_get_user
    type: uses
    weight: 0.8
  - target: dec_rls_force
    type: configures
    weight: 0.9

tags:
  - supabase
  - postgres
  - auth
  - storage
  - rls
  - docker

state: active

# ─── CONFIGURACIÓN LOCAL ───
local_config:
  file: supabase/config.toml
  project_id: gestionfinca
  api_port: 54321
  db_port: 54322
  studio_port: 54323
  inbucket_port: 54324

# ─── MIGRACIONES ───
migrations:
  - file: 0001_extensions_and_enums.sql
    purpose: pgcrypto, uuid-ossp, citext + 13 enums (roles, estados, categorías)
  - file: 0002_core_tables.sql
    purpose: communities, units, profiles, community_members, invitations, community_counters
  - file: 0003_rls_helpers.sql
    purpose: Funciones helper — is_member(), has_role(), is_admin_or_junta(), set_updated_at()
  - file: 0004_domain_tables.sql
    purpose: issues, comments, attachments, announcements, polls, votes, documents, budget
  - file: 0005_rls_policies.sql
    purpose: ENABLE+FORCE RLS en todas las tablas existentes; ~25 políticas por tabla
  - file: 0006_storage_buckets.sql
    purpose: 4 buckets — incidence-attachments, documents, announcement-files, avatars
  - file: 0007_rooms_and_bookings.sql
    purpose: rooms, room_booking_rules, room_bookings, room_booking_participants + enums

# ─── STORAGE BUCKETS ───
storage_buckets:
  - incidence-attachments  # private, signed URLs
  - documents              # private, signed URLs
  - announcement-files     # private
  - avatars                # private

# ─── SCRIPTS NPM ───
npm_scripts:
  db:start: supabase start
  db:stop: supabase stop
  db:reset: supabase db reset (aplica migraciones + seed — recrea auth.users)
  db:types: supabase gen types typescript --local > src/types/database.ts
  db:setup: pnpm db:reset && pnpm db:seed-users

notes:
  - >
    supabase_vector_gestionfinca es innecesario. Parar con:
    docker stop supabase_vector_gestionfinca
  - >
    seed.sql inserta auth.users+auth.identities directamente (via crypt).
    pnpm db:reset es autosuficiente — no necesita pasos previos.
---

# Supabase Backend

Backend completo del proyecto en local vía Docker. Studio disponible en `http://127.0.0.1:54323`.

## Conexiones

**Sistema:** [[gestionfinca]]
**Conceptos:** [[con-rls]]
**Archivos:** [[types-database]] · [[lib-get-user]]
**Decisiones:** [[dec-rls-force]]
