---
id: file_lib_permissions
type: file
name: lib/permissions.ts
path: src/lib/permissions.ts
description: >
  Gatekeeper RBAC del proyecto. Define el tipo Action (union de permisos),
  la tabla POLICY (qué roles pueden hacer qué), y canDo() / isAtLeast().
  Importado por todos los Server Actions — nodo crítico del grafo.

parents:
  - id: sys_rbac

children: []

relations:
  - target: sys_rbac
    type: implements
    weight: 1.0
  - target: sys_gestionfinca
    type: part_of
    weight: 0.9
  - target: file_action_issues
    type: uses
    weight: 1.0
  - target: file_action_announcements
    type: uses
    weight: 1.0
  - target: file_action_polls
    type: uses
    weight: 1.0
  - target: file_action_bookings
    type: uses
    weight: 1.0
  - target: file_lib_get_user
    type: uses
    weight: 0.9

tags:
  - permissions
  - rbac
  - critical
  - shared-lib
  - server-only

state: active

exports:
  - name: Action
    kind: type
    description: Union de todos los permisos del sistema (issue.create, poll.vote_economic, booking.create, etc.)
  - name: POLICY
    kind: const
    description: Record<Action, MemberRole[]> — tabla de quién puede hacer qué
  - name: canDo
    kind: function
    signature: "canDo(role: MemberRole, action: Action): boolean"
  - name: isAtLeast
    kind: function
    signature: "isAtLeast(role: MemberRole, minRole: MemberRole): boolean"
    description: Compara roles en jerarquía superadmin > admin_finca > junta > propietario > inquilino
---

# lib/permissions.ts

Gatekeeper RBAC. Nodo crítico — importado por todos los Server Actions como segunda capa de seguridad.

## Conexiones

**Sistema:** [[rbac]] · [[gestionfinca]]
**Consumers (todos los actions):** [[action-issues]] · [[action-announcements]] · [[action-polls]] · [[action-bookings]]
**Colabora con:** [[lib-get-user]] · [[con-rls]]
