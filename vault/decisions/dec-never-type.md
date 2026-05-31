---
id: dec_never_type
type: decision
name: Errores TypeScript 'never' en Queries Supabase
path: null
description: >
  Problema conocido y pre-existente: todas las queries Supabase .from().select()
  retornan tipo 'never' en tsc. El compilador SWC (next dev) ignora estos errores
  y el código funciona correctamente en runtime.

parents:
  - id: file_types_database

children: []

relations:
  - target: file_types_database
    type: part_of
    weight: 0.8
  - target: sys_nextjs
    type: part_of
    weight: 0.5

tags:
  - decision
  - typescript
  - known-issue
  - technical-debt
  - never-type

state: active

impact:
  type_check: "pnpm type-check falla con ~150+ errores (pre-existente, no bloqueante para dev)"
  build: "pnpm build falla por el mismo motivo (no se usa en desarrollo local)"
  dev: "pnpm dev (SWC) funciona correctamente — no afecta desarrollo"
  runtime: "El código es funcionalmente correcto — tipos correctos en runtime"

not_introduced_by: >
  La refactorización del 2026-05-31 no añadió nuevos errores. Verificado filtrando
  tsc output por archivos modificados — 0 errores nuevos en archivos refactorizados.

decision: >
  Aceptar el technical debt hasta que Supabase TS codegen mejore o se aplique workaround.

workaround_options:
  - typescript.ignoreBuildErrors=true en next.config.mjs (rápido, oculta el problema)
  - Cast manual: (supabase.from('x').select('*') as unknown as QueryBuilder)
  - Regenerar tipos con versión más reciente de supabase CLI
---

# Errores TypeScript 'never' en Queries Supabase

Bug pre-existente y conocido. `pnpm dev` funciona correctamente. `pnpm type-check` falla (aceptado).

## Conexiones

**Origen:** [[types-database]] · [[supabase]]
**Sistema:** [[nextjs]]

Bug pre-existente y conocido. `pnpm dev` funciona correctamente. `pnpm type-check` falla (aceptado).
