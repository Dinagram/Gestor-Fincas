---
id: file_check_conflicts
type: file
name: lib/bookings/check-conflicts.ts
path: src/lib/bookings/check-conflicts.ts
description: >
  Helper para detección de solapamientos de reservas. Extrae query que estaba
  duplicada ×3 en bookings.ts (createBooking, createCommunityEvent, blockSlot).

parents:
  - id: mod_reservas

children: []

relations:
  - target: mod_reservas
    type: part_of
    weight: 1.0
  - target: file_action_bookings
    type: uses
    weight: 1.0
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: dec_refactoring
    type: part_of
    weight: 0.7

tags:
  - bookings
  - conflict-detection
  - server-only
  - extracted-helper
  - dry

state: active

exports:
  - name: checkConflicts
    kind: function
    signature: "checkConflicts(communityId: string, {roomId, start, end}: ConflictParams): Promise<{hasConflict: boolean}>"
    description: >
      Busca reservas activas (pendiente|confirmada) solapadas con [start, end).
      Usa LIMIT 1 para eficiencia. Retorna {hasConflict: boolean}.
      Consumidores: createBooking, createCommunityEvent, blockSlot.
---

# lib/bookings/check-conflicts.ts

Helper extraído de la refactorización. Centraliza la lógica de solapamiento de reservas.

## Conexiones

**Módulo:** [[reservas]]
**Consumer:** [[action-bookings]]
**Sistema:** [[supabase]]
**Historial:** [[dec-refactoring]]
**Flujo:** [[flow-booking-create]]
