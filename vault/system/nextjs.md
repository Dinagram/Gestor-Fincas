---
id: sys_nextjs
type: system
name: Next.js 15 App Router
path: null
description: >
  Framework de rendering. App Router exclusivamente. Server Components por defecto.
  Server Actions para mutaciones. SWC compiler en dev (ignora errores TS).

parents:
  - id: sys_gestionfinca

children:
  - id: file_middleware

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: file_middleware
    type: uses
    weight: 0.9
  - target: flow_auth
    type: triggers
    weight: 0.8
  - target: flow_mutation
    type: implements
    weight: 0.9
  - target: dec_server_actions
    type: implements
    weight: 1.0

tags:
  - nextjs
  - app-router
  - server-components
  - server-actions
  - swc

state: active

# ─── ESTRUCTURA DE ROUTING ───
routing:
  groups:
    - pattern: (auth)
      purpose: Login, signup, forgot-password, reset-password, invite, callback
    - pattern: (app)
      purpose: App principal — requiere sesión autenticada
  dynamic:
    - pattern: c/[communityId]
      purpose: Scope de comunidad — todo aislado por communityId
    - pattern: c/[communityId]/incidencias/[id]
    - pattern: c/[communityId]/reservas/[id]
    - pattern: c/[communityId]/votaciones/[id]

# ─── LAYOUT HIERARCHY ───
layout_hierarchy:
  - src/app/layout.tsx → fonts + ThemeProvider + Sonner (global)
  - src/app/(app)/c/[communityId]/layout.tsx → AppSidebar + AppTopbar + CommunityProvider (8 queries paralelas)
  - src/app/(app)/c/[communityId]/<module>/page.tsx → datos del módulo

known_issues:
  - >
    pnpm type-check (tsc --noEmit) falla con errores 'never' sistémicos en queries Supabase.
    next dev (SWC) funciona correctamente. Ver dec_never_type.
---

# Next.js 15 App Router

Framework del proyecto. Server Components por defecto, Server Actions para mutaciones.

## Conexiones

**Sistema:** [[gestionfinca]]
**Archivos:** [[middleware]]
**Flujos:** [[flow-auth]] · [[flow-mutation]]
**Decisiones:** [[dec-server-actions]] · [[dec-never-type]]
