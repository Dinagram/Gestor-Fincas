---
id: file_action_bookings
type: file
name: actions/bookings.ts
path: src/actions/bookings.ts
description: >
  Server Actions del módulo Reservas. El más complejo del proyecto (~530 líneas).
  Contiene toda la lógica de negocio: 6 reglas secuenciales, detección de solapamientos,
  límite mensual por vivienda y generación de alternativas horarias.

parents:
  - id: mod_reservas

children: []

relations:
  - target: mod_reservas
    type: part_of
    weight: 1.0
  - target: file_lib_get_user
    type: uses
    weight: 1.0
  - target: file_lib_permissions
    type: uses
    weight: 1.0
  - target: file_check_conflicts
    type: uses
    weight: 0.9
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: flow_booking_create
    type: implements
    weight: 1.0

tags:
  - server-action
  - bookings
  - business-rules
  - complex

state: active

types_exported:
  - ActionResult: "{ ok: true } & T | { ok: false; error: string }"
  - CreateBookingResult: "{ ok: true; id; status } | { ok: false; error; alternatives?: string[] }"

exports:
  - name: createBooking
    description: Vecino reserva — aplica 6 reglas + devuelve alternatives en error de solape
  - name: cancelBooking
    description: Dueño o admin/junta cancela — update status='cancelada'
  - name: moderateBooking
    description: Admin aprueba/rechaza reservas pendientes (requires_approval flow)
  - name: setRequiresApproval
    description: Admin toggle — confirmación instantánea vs aprobación manual
  - name: createCommunityEvent
    description: Admin crea evento comunitario (kind=comunidad, salta antelación y cupo)
  - name: blockSlot
    description: Admin bloquea franja (kind=bloqueo, verifica que no haya reservas)
  - name: setRoomOutOfService
    description: Admin marca sala fuera_servicio / disponible
---

# actions/bookings.ts

Server Action más complejo del proyecto. Aplica 6 reglas de negocio antes de insertar una reserva.

## Conexiones

**Módulo:** [[reservas]]
**Auth:** [[lib-get-user]] · [[lib-permissions]]
**Helper:** [[lib-check-conflicts]]
**Sistema:** [[supabase]]
**Flujo:** [[flow-booking-create]] · [[flow-mutation]]
**Consumer:** [[hook-form-transition]]
