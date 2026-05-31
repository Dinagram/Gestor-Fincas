---
id: file_lib_require_user
type: file
name: lib/auth/require-user.ts
path: src/lib/auth/require-user.ts
description: >
  Guards de autenticación para Server Components. Lanzan redirect() si no autorizado.
  requireMember() importado al inicio de casi todas las páginas del módulo app.

parents:
  - id: mod_auth

children: []

relations:
  - target: mod_auth
    type: part_of
    weight: 0.9
  - target: file_lib_get_user
    type: uses
    weight: 0.9
  - target: sys_supabase
    type: uses
    weight: 0.8

tags:
  - auth
  - guards
  - server-only
  - redirect

state: active

exports:
  - name: requireUser
    kind: function
    description: Redirige a /login si no autenticado
  - name: requireMember
    kind: function
    signature: "requireMember(communityId: string): Promise<{user, role}>"
    description: Redirige si no es miembro activo de la comunidad
  - name: requireRole
    kind: function
    signature: "requireRole(communityId: string, minRole: MemberRole)"
    description: Redirige si el rol es insuficiente
---

# lib/auth/require-user.ts

Guards que se usan al inicio de cada página protegida para validar acceso.

## Conexiones

**Módulo:** [[auth]]
**Depende de:** [[lib-get-user]] · [[supabase]]
**Usado por:** [[incidencias]] · [[comunicados]] · [[votaciones]] · [[reservas]] · [[directorio]] · [[presupuesto]] · [[documentos]]
