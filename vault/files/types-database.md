---
id: file_types_database
type: file
name: types/database.ts
path: src/types/database.ts
description: >
  Tipos TypeScript de la BD generados automáticamente por Supabase CLI (~1600 líneas).
  Contiene Database root type, Tables (Row/Insert/Update), Enums. NO editar manualmente.

parents:
  - id: sys_supabase

children: []

relations:
  - target: sys_supabase
    type: part_of
    weight: 1.0
  - target: sys_gestionfinca
    type: uses
    weight: 0.9
  - target: file_lib_constants
    type: uses
    weight: 0.7
  - target: dec_never_type
    type: part_of
    weight: 0.8

tags:
  - types
  - generated
  - supabase
  - database
  - do-not-edit

state: active

regenerate_command: pnpm db:types
line_count: ~1600

known_issues:
  - id: dec_never_type
    description: >
      Queries .from().select() retornan tipo 'never' en tsc --noEmit.
      Sistémico en todo el proyecto. SWC (next dev) funciona correctamente.
---

# types/database.ts

Tipos generados por Supabase CLI. Regenerar con `pnpm db:types` tras cambios de schema. **No editar manualmente.**

## Conexiones

**Sistema:** [[supabase]] · [[gestionfinca]]
**Consumidores:** [[lib-constants]] · [[action-bookings]] · [[action-polls]]
**Problema conocido:** [[dec-never-type]]
