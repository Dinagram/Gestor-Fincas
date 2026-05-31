---
id: dec_server_actions
type: decision
name: Server Actions para todas las mutaciones
path: null
description: >
  Todas las mutaciones usan Next.js Server Actions ('use server') en lugar de
  API Routes. Tipado end-to-end, no serialización manual, integración nativa
  con useTransition y revalidatePath.

parents:
  - id: sys_nextjs

children: []

relations:
  - target: sys_nextjs
    type: implements
    weight: 1.0
  - target: flow_mutation
    type: part_of
    weight: 0.9

tags:
  - decision
  - server-actions
  - nextjs
  - architecture
  - dx

state: active

rationale: >
  Next.js 15 App Router + Server Actions elimina la necesidad de API Routes para CRUD.
  Tipado directo (no hay fetch/JSON entre capas), revalidatePath integrado,
  useTransition da feedback de loading automático.

tradeoffs:
  pro: DX superior, menos código, tipado end-to-end, revalidación automática
  con: No hay endpoints REST para integraciones externas (aceptable en MVP)

pattern: src/actions/<módulo>.ts — 'use server', Zod, getUserRole, canDo, revalidatePath
---

# Server Actions para Mutaciones

Decisión de usar Server Actions en lugar de API Routes para todas las mutaciones del proyecto.

## Conexiones

**Sistema:** [[nextjs]]
**Flujo:** [[flow-mutation]]
**Actions:** [[action-issues]] · [[action-announcements]] · [[action-polls]] · [[action-bookings]]
