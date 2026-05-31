---
id: file_lib_get_user
type: file
name: lib/auth/get-user.ts
path: src/lib/auth/get-user.ts
description: >
  Helper centralizado de autenticación. Exporta getUserRole() — único punto de verdad
  para obtener user+role+unitId desde community_members. Antes de la refactorización,
  estaba duplicado en los 4 action files. Marcado con 'import server-only'.

parents:
  - id: sys_gestionfinca

children: []

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 0.9
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: sys_rbac
    type: uses
    weight: 0.8
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
  - target: dec_refactoring
    type: part_of
    weight: 0.7

tags:
  - auth
  - server-only
  - shared-lib
  - critical
  - get-user-role

state: active

exports:
  - name: getUser
    kind: function
    description: Devuelve el usuario autenticado o null
  - name: getProfile
    kind: function
    description: Devuelve el profile completo del usuario
  - name: getMemberships
    kind: function
    description: Devuelve comunidades activas del usuario (para el community switcher)
  - name: getUserRole
    kind: function
    signature: "getUserRole(communityId: string): Promise<{user: User, role: MemberRole, unitId: string | null}>"
    description: >
      Obtiene user+role+unitId del miembro activo. Lanza Error('UNAUTHENTICATED')
      o Error('NOT_A_MEMBER'). Todos los Server Actions lo llaman en try/catch
      y retornan ERR_NO_ACCESS al capturar.
  - name: ERR_NO_ACCESS
    kind: const
    value: "'No tienes acceso a esta comunidad'"
    description: Mensaje de error canónico — centralizado aquí desde refactorización
---

# lib/auth/get-user.ts

Helper auth centralizado. `getUserRole()` es el único punto de verdad para auth en Server Actions.

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]] · [[rbac]]
**Consumers (todos los actions):** [[action-issues]] · [[action-announcements]] · [[action-polls]] · [[action-bookings]]
**Historial:** [[dec-refactoring]]
**Colabora con:** [[lib-permissions]] · [[lib-require-user]]
