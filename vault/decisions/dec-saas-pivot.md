---
id: dec_saas_pivot
type: decision
name: Pivote de Demo HTML a App SaaS Real
path: null
description: >
  El proyecto original era un mockup HTML estático (ahora en mockup-legacy/).
  Se decidió pivotar a una aplicación SaaS real con Next.js 15 + Supabase
  para validar arquitectura, flujos reales y potenciales clientes.

parents:
  - id: sys_gestionfinca

children: []

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 0.7
  - target: sys_nextjs
    type: part_of
    weight: 0.6
  - target: sys_supabase
    type: part_of
    weight: 0.6

tags:
  - decision
  - architecture
  - pivot
  - history

state: active

context: CLAUDE.md describe el objetivo original (mockup HTML). El código real vive en src/.
committed_at: "commit 6617692 — Fase 1 completa"
legacy_location: mockup-legacy/
---

# Pivote a App SaaS Real

Decisión de abandonar el mockup HTML estático para construir una app SaaS real con backend completo.

## Conexiones

**Afecta a:** [[gestionfinca]] · [[nextjs]] · [[supabase]]
