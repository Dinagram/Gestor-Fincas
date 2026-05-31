---
id: file_lib_constants
type: file
name: lib/constants.ts
path: src/lib/constants.ts
description: >
  Constantes y labels del dominio. Mapas estado→label, estado→tono visual,
  listas de valores válidos para enums. Importado por componentes UI y Server Actions.

parents:
  - id: sys_gestionfinca

children: []

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 0.8
  - target: file_types_database
    type: uses
    weight: 0.7
  - target: mod_incidencias
    type: uses
    weight: 0.6
  - target: mod_votaciones
    type: uses
    weight: 0.6
  - target: mod_reservas
    type: uses
    weight: 0.6
  - target: mod_comunicados
    type: uses
    weight: 0.6

tags:
  - constants
  - labels
  - shared-lib
  - domain

state: active

key_exports:
  issue:
    - ISSUE_STATUS_LABEL, ISSUE_STATUS_ORDER
    - ISSUE_PRIORITY_LABEL
    - ISSUE_CATEGORY_LABEL
    - ISSUE_STATUSES, ISSUE_PRIORITIES, ISSUE_CATEGORIES
  announcements:
    - ANNOUNCEMENT_TYPE_LABEL, ANNOUNCEMENT_TYPES
  polls:
    - POLL_STATUS_LABEL, POLL_TYPE_LABEL
    - POLL_STATUS_BADGE_CLASSES  # centralizado en refactorización desde votaciones/[id]/page.tsx
    - POLL_STATUSES, POLL_TYPES
  bookings:
    - BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE
    - BOOKING_CATEGORY_LABEL, BOOKING_KIND_LABEL
    - BOOKING_STATUSES, BOOKING_CATEGORIES
    - ROOM_RULES           # 6 normas de uso de la sala
    - ROOM_OPEN_HOUR=9, ROOM_CLOSE_HOUR=22
    - ROOM_MAX_PER_MONTH=2, ROOM_MIN_ADVANCE_HOURS=48, ROOM_MAX_DURATION_HOURS=4
  roles:
    - ROLE_LABEL
---

# lib/constants.ts

Labels y constantes del dominio. Fuente única de verdad para textos y tonos visuales.

## Conexiones

**Sistema:** [[gestionfinca]]
**Tipos fuente:** [[types-database]]
**Consumidores:** [[incidencias]] · [[comunicados]] · [[votaciones]] · [[reservas]]
