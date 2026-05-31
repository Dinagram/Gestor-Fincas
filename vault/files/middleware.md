---
id: file_middleware
type: file
name: middleware.ts
path: middleware.ts
description: >
  Middleware de Next.js. Refresca sesión Supabase en cada request (SSR-safe).
  Redirige no autenticados a /login. Redirige autenticados fuera de auth pages.

parents:
  - id: sys_nextjs

children: []

relations:
  - target: sys_nextjs
    type: part_of
    weight: 0.9
  - target: sys_gestionfinca
    type: part_of
    weight: 0.8
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: flow_auth
    type: part_of
    weight: 0.9

tags:
  - middleware
  - auth
  - session
  - redirect
  - nextjs

state: active

public_paths:
  - /
  - /login
  - /signup
  - /forgot-password
  - /reset-password
  - /callback
  - /invite

matcher: Excluye _next/, static assets, imágenes (png, jpg, svg, ico, etc.)
---

# middleware.ts

Middleware de Next.js para refresh de sesión Supabase. Primera barrera de autenticación.

## Conexiones

**Sistema:** [[nextjs]] · [[gestionfinca]] · [[supabase]]
**Flujo:** [[flow-auth]]
**Módulo:** [[auth]]
