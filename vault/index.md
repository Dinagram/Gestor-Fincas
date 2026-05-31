---
id: vault_index
type: index
name: GestiónFinca — Vault Index
path: null
description: >
  Punto de entrada del grafo de conocimiento de GestiónFinca (Shire).
  App SaaS multi-tenant para comunidades de propietarios en España.
  Stack: Next.js 15 App Router + Supabase + TypeScript + Tailwind + shadcn/ui.

parents: []

children:
  - id: sys_gestionfinca

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0

tags:
  - index
  - navigation
  - entry-point

state: active

# ─── MÓDULOS PRINCIPALES (por prioridad de producto) ───
modules:
  - id: mod_dashboard
    priority: 1
  - id: mod_incidencias
    priority: 2
  - id: mod_comunicados
    priority: 3
  - id: mod_votaciones
    priority: 4
  - id: mod_reservas
    priority: 5
  - id: mod_directorio
    priority: 6
  - id: mod_presupuesto
    priority: 7
  - id: mod_documentos
    priority: 8
  - id: mod_auth
    priority: 9

# ─── NODOS CRÍTICOS ───
critical_nodes:
  - id: file_lib_permissions
    reason: Gatekeeper RBAC — importado por todos los Server Actions
  - id: file_lib_get_user
    reason: getUserRole() — helper auth único para todos los Server Actions
  - id: con_rls
    reason: Contrato de seguridad multi-tenant — todo el sistema depende de esto
  - id: flow_mutation
    reason: Patrón universal de mutación (SA + Zod + RBAC + revalidate)
  - id: file_types_database
    reason: Tipos generados de Supabase — fuente de verdad de tipos de BD

# ─── RUTAS CRÍTICAS DE EJECUCIÓN ───
critical_paths:
  - name: Mutación estándar
    flow: file_lib_get_user → file_lib_permissions → action_* → sys_supabase → revalidatePath
  - name: Renderizado de página protegida
    flow: file_middleware → file_lib_require_user → layout → page → sys_supabase
  - name: Creación de reserva con reglas de negocio
    flow: flow_booking_create
  - name: Autenticación
    flow: flow_auth

# ─── NAVEGACIÓN DEL GRAFO ───
navigation:
  entry_point: vault/index.md
  system_overview: vault/system/gestionfinca.md
  modules: vault/modules/<mod_id>.md
  files: vault/files/<file_id>.md
  flows: vault/flows/<flow_id>.md
  decisions: vault/decisions/<dec_id>.md
  concepts: vault/concepts/<con_id>.md
---

# GestiónFinca — Vault Index

Punto de entrada del grafo. Navega por `system/gestionfinca.md` para la visión global, o accede directamente a cualquier módulo en `modules/`.

## Nodos críticos

| ID | Descripción |
|----|-------------|
| `file_lib_permissions` | Gatekeeper RBAC de todo el sistema |
| `file_lib_get_user` | Helper auth compartido por todos los Server Actions |
| `con_rls` | Contrato de seguridad multi-tenant (Postgres RLS) |
| `flow_mutation` | Patrón universal de mutación |
| `file_types_database` | Tipos generados de BD — no editar manualmente |

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]] · [[nextjs]] · [[rbac]]
**Módulos:** [[auth]] · [[dashboard]] · [[incidencias]] · [[comunicados]] · [[votaciones]] · [[reservas]] · [[directorio]] · [[presupuesto]] · [[documentos]]
**Archivos clave:** [[lib-permissions]] · [[lib-get-user]] · [[types-database]]
**Flujos:** [[flow-auth]] · [[flow-mutation]] · [[flow-booking-create]]
**Conceptos:** [[con-rls]] · [[con-community-isolation]]
