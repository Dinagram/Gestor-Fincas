---
id: flow_booking_create
type: flow
name: Flujo de Creación de Reserva
path: null
description: >
  Flujo más complejo del proyecto. Aplica 6 reglas de negocio en secuencia antes de insertar.
  Si hay solapamiento, devuelve franjas libres alternativas para selección del usuario.

parents:
  - id: mod_reservas

children: []

relations:
  - target: mod_reservas
    type: part_of
    weight: 1.0
  - target: file_action_bookings
    type: implements
    weight: 1.0
  - target: file_check_conflicts
    type: uses
    weight: 1.0
  - target: flow_mutation
    type: extends
    weight: 0.8

tags:
  - booking
  - business-rules
  - flow
  - alternatives
  - complex

state: active

steps:
  validation:
    1: "createBookingSchema.safeParse(input) — fecha, horas 9-22, purpose, rulesAccepted=true"
    2: "getUserRole(communityId) → user, role, unitId"
    3: "canDo(role, 'booking.create')"
  business_rules:
    4: "loadRoom(communityId) — obtiene sala activa de la comunidad"
    5: "[R1] Sala no está fuera_servicio"
    6: "[R2] Horario dentro de open_hour–close_hour (09:00–22:00)"
    7: "[R3] Duración ≤ maxDurationHours (default 4h)"
    8: "[R4] Aforo: attendees ≤ max_attendees (si tiene regla)"
    9: "[R5] Antelación ≥ minAdvanceHours (default 48h) respecto a Date.now()"
    10: "[R6] checkConflicts() — si hay solape → freeSlots() → return {ok:false, alternatives[]}"
    11: "[R7] Límite mensual: count por unit_id (o created_by) ≤ maxPerMonth (default 2)"
  insertion:
    12: "status = requires_approval ? 'pendiente' : 'confirmada'"
    13: "supabase.from('room_bookings').insert({...})"
    14: "revalidatePath('/c/<id>/reservas')"
    15: "return {ok: true, id, status}"

alternatives_flow:
  trigger: "checkConflicts() → hasConflict=true"
  action: "freeSlots(communityId, roomId, date, openHour, closeHour)"
  logic: "Itera horas 9–22; para cada hora comprueba solape con busy list; devuelve 'HH:00–HH:00'"
  response: "{ok: false, error: '...', alternatives: ['09:00–10:00', ...]}"
  client: "BookingForm dispatch SET_ERROR con alternatives → botones de slot alternativo"
  user_action: "Usuario clica slot → dispatch APPLY_ALTERNATIVE → actualiza startHour/endHour → reintenta"

admin_flows:
  community_event: "createCommunityEvent — salta R5/R6/R7 (antelación, cupo mensual). Solo verifica solape."
  block_slot: "blockSlot — salta R5/R6/R7. Verifica solape. Error si hay reservas activas en el rango."
---

# Flujo de Creación de Reserva

7 reglas de negocio secuenciales con sistema de alternativas en caso de solapamiento.

## Conexiones

**Módulo:** [[reservas]]
**Action:** [[action-bookings]]
**Helper:** [[lib-check-conflicts]]
**Extiende:** [[flow-mutation]]
