---
id: sys_gestionfinca
type: system
name: GestiónFinca (Shire)
path: null
description: >
  Plataforma SaaS multi-tenant para comunidades de propietarios (fincas) en España.
  Centraliza incidencias, comunicados, votaciones, reservas de sala, directorio,
  presupuesto y documentos. Sustituye WhatsApp, emails y tablones físicos.
  Nombre interno del proyecto: Shire.

parents:
  - id: vault_index

children:
  - id: mod_auth
  - id: mod_dashboard
  - id: mod_incidencias
  - id: mod_comunicados
  - id: mod_votaciones
  - id: mod_reservas
  - id: mod_directorio
  - id: mod_presupuesto
  - id: mod_documentos

relations:
  - target: sys_nextjs
    type: uses
    weight: 1.0
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: sys_rbac
    type: uses
    weight: 1.0
  - target: con_rls
    type: uses
    weight: 1.0
  - target: con_community_isolation
    type: implements
    weight: 1.0
  - target: file_types_database
    type: uses
    weight: 0.9
  - target: file_middleware
    type: uses
    weight: 0.9
  - target: file_lib_permissions
    type: uses
    weight: 1.0
  - target: file_lib_get_user
    type: uses
    weight: 1.0
  - target: file_lib_constants
    type: uses
    weight: 0.8

tags:
  - system-root
  - saas
  - multi-tenant
  - nextjs15
  - supabase
  - typescript

state: active

# ─── CONVENCIONES GLOBALES ───
conventions:
  rendering: Server Components por defecto; Client Components solo cuando requieren estado/interactividad
  mutations: Server Actions exclusivamente (nunca API Routes para mutaciones)
  validation: Zod en src/lib/validators/ — schemas compartidos entre client y server
  permissions: 3 capas — RoleGate (UI) → canDo() (action) → RLS policy (BD)
  isolation: community_id denormalizado en cada tabla; RLS force en todas
  types: src/types/database.ts generado automáticamente por pnpm db:types
  routing: App Router de Next.js 15; grupos (auth) y (app)

# ─── ESTADO DE FASES ───
phases:
  - id: fase_1
    name: Scaffolding + Incidencias MVP
    commit: "6617692"
    status: committed
  - id: fase_4
    name: Directorio + Presupuesto + Documentos
    status: done_not_committed
  - id: fase_reservas
    name: Sala Multiusos / Reservas
    status: done_not_committed
  - id: fase_refactor
    name: Refactorización arquitectónica
    status: done_not_committed
  - id: fase_2
    name: Comunicados completo + Adjuntos incidencias
    status: pending

# ─── CREDENCIALES DEMO ───
demo:
  community: Dr. Domagk 2
  urls:
    app: http://localhost:3000
    supabase_studio: http://127.0.0.1:54323
    mailpit: http://127.0.0.1:54324
  users:
    - email: miguel.fortes@dinagram.es
      role: junta
      password: demo-Pass-1234
    - email: admin@dr-domagk-2.com
      role: admin_finca
    - email: inquilino1@example.com
      role: inquilino
---

# GestiónFinca (Shire)

Sistema raíz del vault. Plataforma SaaS para comunidades de propietarios.

## Próxima fase pendiente

**Fase 2:** Comunicados completo (crear, detalle, acuse de recibo, email Resend) + Adjuntos en Incidencias (upload + signed URLs).

## Conexiones

**Infraestructura:** [[supabase]] · [[nextjs]] · [[rbac]]
**Módulos:** [[auth]] · [[dashboard]] · [[incidencias]] · [[comunicados]] · [[votaciones]] · [[reservas]] · [[directorio]] · [[presupuesto]] · [[documentos]]
**Archivos clave:** [[lib-permissions]] · [[lib-get-user]] · [[lib-constants]] · [[middleware]] · [[types-database]]
**Conceptos:** [[con-rls]] · [[con-community-isolation]]
