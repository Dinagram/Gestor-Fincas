---
id: flow_auth
type: flow
name: Flujo de Autenticación
path: null
description: >
  Ciclo completo de sesión de usuario. Desde request hasta sesión validada
  en Server Component. Cubre login, request en página protegida e invitaciones.

parents:
  - id: sys_gestionfinca

children: []

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 0.9
  - target: mod_auth
    type: implements
    weight: 0.9
  - target: file_middleware
    type: uses
    weight: 1.0
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: file_lib_require_user
    type: uses
    weight: 0.9

tags:
  - auth
  - session
  - flow
  - login
  - invite

state: active

login_flow:
  1: "Usuario va a /login → middleware permite (path público)"
  2: "LoginForm.handleSubmit → supabase.auth.signInWithPassword()"
  3: "Supabase devuelve sesión → cookies httpOnly seteadas por @supabase/ssr"
  4: "Router.push('/') → middleware intercepta"
  5: "updateSession() refresca token si necesario"
  6: "Usuario autenticado → redirect al dashboard de su comunidad"

protected_page_flow:
  1: "Request llega → middleware.ts"
  2: "updateSession() → lee cookie → refresca JWT si expira (1h)"
  3: "Si !user → redirect /login?redirect=<path>"
  4: "Page.tsx llama requireMember(communityId)"
  5: "requireMember → supabase.auth.getUser() + query community_members"
  6: "Si no miembro → redirect /c/ (selector de comunidad)"
  7: "Retorna {user, role} → usado para RBAC en la página"

invite_flow:
  1: "Admin genera invitación → inserta en tabla invitations"
  2: "Email enviado con token"
  3: "/invite/[token] → AcceptInviteForm"
  4: "Usuario crea contraseña → Supabase Auth"
  5: "Trigger DB crea community_members row"
  6: "Redirect al dashboard de la comunidad"
---

# Flujo de Autenticación

Gestión completa de sesiones con Supabase Auth + cookies SSR. Ver [[middleware]] y [[lib-require-user]].

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]] · [[nextjs]]
**Módulo:** [[auth]]
**Archivos:** [[middleware]] · [[lib-require-user]] · [[lib-get-user]]
