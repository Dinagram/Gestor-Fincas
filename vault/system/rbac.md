---
id: sys_rbac
type: system
name: Sistema RBAC
path: null
description: >
  Control de acceso por roles con 3 capas de enforcement.
  Roles jerárquicos: superadmin > admin_finca > junta > propietario > inquilino.
  Implementado en permissions.ts + RLS policies + RoleGate UI component.

parents:
  - id: sys_gestionfinca

children:
  - id: file_lib_permissions

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: file_lib_permissions
    type: implements
    weight: 1.0
  - target: con_rls
    type: uses
    weight: 0.9
  - target: file_lib_get_user
    type: uses
    weight: 1.0

tags:
  - rbac
  - permissions
  - roles
  - security

state: active

# ─── ROLES ───
roles:
  - id: superadmin
    description: Control total de plataforma
  - id: admin_finca
    description: Gestiona toda la comunidad
  - id: junta
    description: Co-gestiona incidencias y decisiones
  - id: propietario
    description: Participa, consulta y vota
  - id: inquilino
    description: Acceso limitado — no vota económicamente

# ─── 3 CAPAS DE ENFORCEMENT ───
enforcement_layers:
  - layer: 1_ui
    mechanism: RoleGate component
    path: src/components/shared/role-gate.tsx
    purpose: Oculta UI no permitida (UX, no seguridad real)
  - layer: 2_server_action
    mechanism: canDo(role, action) / isAtLeast(role, minRole)
    path: src/lib/permissions.ts
    purpose: Valida permiso antes de ejecutar mutación
  - layer: 3_database
    mechanism: RLS policies (FORCE ROW LEVEL SECURITY)
    path: supabase/migrations/0005_rls_policies.sql
    purpose: Garantía absoluta — imposible bypassear

# ─── TABLA DE PERMISOS ───
permissions_table:
  issue.create:      [inquilino, propietario, junta, admin_finca]
  issue.change_status: [junta, admin_finca]
  issue.delete:      [admin_finca]
  announcement.create: [admin_finca]
  announcement.delete: [admin_finca]
  poll.create:       [junta, admin_finca]
  poll.vote_economic: [propietario, junta, admin_finca]
  booking.create:    [inquilino, propietario, junta, admin_finca]
  booking.manage:    [junta, admin_finca]
  member.invite:     [admin_finca]
  member.manage:     [admin_finca]
---

# Sistema RBAC

Control de acceso por roles con 3 capas de enforcement. Ver [[lib-permissions]] para implementación.

## Conexiones

**Sistema:** [[gestionfinca]]
**Archivos:** [[lib-permissions]] · [[lib-get-user]]
**Conceptos:** [[con-rls]]
**Módulos:** [[incidencias]] · [[reservas]] · [[votaciones]] · [[directorio]]
