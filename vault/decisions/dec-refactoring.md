---
id: dec_refactoring
type: decision
name: Refactorización Arquitectónica Post-Reservas
path: null
description: >
  Refactorización aplicada el 2026-05-31 tras completar el módulo de Reservas.
  Eliminó deuda técnica acumulada sin regresiones funcionales.

parents:
  - id: sys_gestionfinca

children: []

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 0.6
  - target: file_lib_get_user
    type: triggers
    weight: 0.8
  - target: file_check_conflicts
    type: triggers
    weight: 0.8
  - target: hook_form_transition
    type: triggers
    weight: 0.8

tags:
  - decision
  - refactoring
  - dry
  - architecture
  - history

state: active
date: "2026-05-31"

changes_applied:
  getUserRole:
    before: Definido ×4 en issues.ts, announcements.ts, polls.ts, bookings.ts
    after: Único en src/lib/auth/get-user.ts
  ERR_NO_ACCESS:
    before: 4 mensajes inconsistentes ('Sin acceso', 'No tienes acceso a esta comunidad', etc.)
    after: Constante única exportada desde get-user.ts
  checkConflicts:
    before: Misma query copiada ×3 en bookings.ts
    after: Función única en src/lib/bookings/check-conflicts.ts
  useFormTransition:
    before: Patrón handleSubmit+startTransition+toast copiado ×5
    after: Hook único en src/hooks/use-form-transition.ts
  booking_calendar:
    before: 469 líneas — 3 vistas + handlers en un fichero
    after: Orquestador ~120 + week-view + month-view + agenda-view
  admin_actions:
    before: 243 líneas — 2 forms + HourSelect anidado
    after: Contenedor ~35 + event-form + block-form + hour-select
  booking_form:
    before: 9 useState variables
    after: useReducer con tipado estricto (9 campos → 1 reducer)
  POLL_STATUS_BADGE_CLASSES:
    before: Inline en votaciones/[id]/page.tsx
    after: Centralizado en src/lib/constants.ts
  package_json:
    before: db:setup ejecutaba db:reset dos veces (bug)
    after: Corregido
  layout_units_query:
    before: Traía todos los tipos de unidad, filtraba vivienda en cliente
    after: Filtro .eq('type', 'vivienda') en BD

not_changed:
  - Errores 'never' preexistentes de tsc (sistémico — no introducido en refactoring)
  - Comportamiento funcional de la aplicación (cero regresiones)
---

# Refactorización Arquitectónica

Limpieza de deuda técnica post-Reservas. Cero regresiones funcionales.

## Conexiones

**Archivos creados/modificados:** [[lib-get-user]] · [[lib-check-conflicts]] · [[hook-form-transition]]
**Módulos afectados:** [[reservas]] · [[incidencias]] · [[comunicados]] · [[votaciones]]
**Sistema:** [[gestionfinca]]
