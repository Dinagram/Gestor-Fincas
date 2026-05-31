---
id: mod_reservas
type: module
name: Módulo Sala Multiusos / Reservas
path: src/app/(app)/c/[communityId]/reservas/
description: >
  Gestión de reservas con calendario interactivo (Mes/Semana/Agenda), reglas de negocio
  automáticas (48h antelación, máx 2/mes por vivienda, sin solapes) y panel admin.

parents:
  - id: sys_gestionfinca

children:
  - id: file_action_bookings
  - id: file_check_conflicts

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: file_action_bookings
    type: uses
    weight: 1.0
  - target: file_check_conflicts
    type: uses
    weight: 0.9
  - target: file_lib_permissions
    type: uses
    weight: 0.9
  - target: file_lib_get_user
    type: uses
    weight: 0.9
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: flow_booking_create
    type: implements
    weight: 1.0
  - target: hook_form_transition
    type: uses
    weight: 0.7

tags:
  - reservas
  - sala-multiusos
  - calendario
  - booking
  - business-rules

state: active

pages:
  - path: page.tsx
    type: server
    purpose: Vista principal — banner estado sala + calendario + mis reservas
  - path: nueva/page.tsx
    type: server
    purpose: Deep-link para reservar (mobile-friendly)
  - path: "[id]/page.tsx"
    type: server
    purpose: Detalle — participantes, normas, acciones cancelar/moderar
  - path: gestion/page.tsx
    type: server
    purpose: Panel admin — KPIs, todas las reservas, controles de sala

key_components:
  - name: BookingCalendar
    path: _components/booking-calendar.tsx
    type: client
    lines: ~120
    note: Orquestador — delega en WeekView, MonthView, AgendaView
  - name: WeekView
    path: _components/calendar/week-view.tsx
    type: client
    note: CSS Grid 7 días × N horas con booking blocks en gridRow
  - name: MonthView
    path: _components/calendar/month-view.tsx
    type: client
  - name: AgendaView
    path: _components/calendar/agenda-view.tsx
    type: client
  - name: BookingForm
    path: _components/booking-form.tsx
    type: client
    lines: ~250
    note: useReducer (9 campos → 1 reducer) — maneja alternatives de solapamiento
  - name: AdminActions
    path: _components/admin/admin-actions.tsx
    type: client
    lines: ~35
    note: Contenedor de tabs que delega en EventForm y BlockForm
  - name: EventForm
    path: _components/admin/event-form.tsx
    type: client
    note: Usa useFormTransition hook
  - name: BlockForm
    path: _components/admin/block-form.tsx
    type: client
    note: Usa useFormTransition hook
  - name: RoomStatusBanner
    path: _components/room-status-banner.tsx
    type: client
    note: 3 estados — disponible (emerald), reservada (blue), fuera_servicio (taupe)

db_tables: [rooms, room_booking_rules, room_bookings, room_booking_participants]

business_rules:
  min_advance_hours: 48
  max_per_unit_per_month: 2
  max_duration_hours: 4
  open_hour: 9
  close_hour: 22
  overlap_detection: checkConflicts() en src/lib/bookings/check-conflicts.ts
  monthly_limit: por unit_id (o created_by si no tiene vivienda asignada)

booking_kinds:
  vecino: Reserva normal — sujeta a todas las reglas
  comunidad: Evento admin — salta antelación y cupo mensual
  bloqueo: Bloqueo admin — mantenimiento, etc.
---

# Módulo Sala Multiusos / Reservas

Módulo más complejo del proyecto. Permite a los vecinos reservar la Sala Multiusos del edificio de forma autónoma, con reglas de convivencia aplicadas automáticamente. El objetivo es que un vecino pueda hacer una reserva en menos de 30 segundos. La junta/admin tiene un panel completo de gestión.

---

## Páginas

### `page.tsx` — Vista principal
**Lo que ve el usuario:**
1. **`RoomStatusBanner`** en la parte superior: muestra el estado actual de la sala en tiempo real. Si hay una reserva confirmada ahora mismo, muestra "Reservada para [motivo]" en azul. Si está fuera de servicio, muestra el motivo en gris con rayas. Si está disponible, muestra verde con CTA "Reservar la sala".
2. **`ReservasBoard`** (client): orquestador que contiene el calendario y "Mis reservas". Gestiona el estado `open` del diálogo de reserva y los valores prefijados de fecha/hora cuando el usuario clica en un slot del calendario.
3. **`BookingCalendar`**: calendario con las tres vistas.
4. **"Mis reservas"** (aside): tabs Próximas / Historial con las reservas del usuario actual.
5. **Acceso al panel admin**: enlace a `/gestion` visible solo para junta/admin (RoleGate).

---

### `nueva/page.tsx` — Reservar (ruta directa)
**Lo que hace:** Alternativa deep-link para dispositivos móviles. En lugar del diálogo, muestra el `BookingForm` en una página completa con layout card. Útil para acceso directo desde notificaciones o bookmarks. Tiene la misma lógica y validaciones que el diálogo.

---

### `[id]/page.tsx` — Detalle de reserva
**Lo que ve el usuario:** Resumen completo de una reserva.
- **Header:** estado (pill coloreado), fecha y hora formateadas, tipo de reserva (vecino/comunidad/bloqueo).
- **Grid de datos:** propósito, categoría, nº asistentes, sala, tipo de confirmación (instantánea/pendiente aprobación).
- **Normas aceptadas:** caja con `RulesChecklist` en modo solo lectura.
- **Participantes:** lista de perfiles con avatar gradiente + nombre. Si hay invitados externos, aparecen como "Nombre invitado (externo)".
- **Acciones:** botón "Cancelar reserva" visible si la reserva es propia y está en el futuro. Botones "Aprobar / Rechazar" visibles para admin si la reserva está en estado `pendiente`.

---

### `gestion/page.tsx` — Panel de administración
**Solo accesible para junta y admin_finca** (redirect si no tiene `booking.manage`).

**KPIs del mes actual:**
- Reservas confirmadas este mes.
- % de ocupación (horas reservadas / horas disponibles totales del mes).
- Nº de cancelaciones.
- Vecino más activo (el que más reservas tiene).

**Tabla de todas las reservas:** ordenadas por fecha descendente. Muestra vecino, propósito, fecha/hora, estado (con pill), y acciones (moderar si pendiente, cancelar si futura activa).

**Aside de controles:** `RoomControls` + `AdminActions` para gestión rápida de la sala.

---

## Componentes

### `BookingCalendar` (client) — Orquestador de vistas
Gestiona el estado de vista activa (`mes`/`semana`/`agenda`) y el cursor de fecha. Renderiza la toolbar de navegación (anterior/siguiente/hoy + toggle de vistas) y delega el renderizado a `WeekView`, `MonthView` o `AgendaView`.

### `WeekView` (client)
CSS Grid de 7 columnas (días) × N filas (horas de 09:00 a 22:00). Cada celda es un botón clicable que muestra un `+` en hover. Al clicar, abre el diálogo de reserva con la fecha y hora prefijadas. Las reservas existentes se renderizan como bloques coloreados usando `gridRow: startRow / span N` para cubrir múltiples horas. Colores: terracota (reserva de vecino propia), azul (evento comunidad), ámbar (pendiente de aprobación), gris (bloqueo).

### `MonthView` (client)
Cuadrícula mensual estilo Google Calendar. Cada día es un botón — al clicar, salta a `WeekView` en esa semana para poder reservar. Muestra chips de reservas (máximo 2 por día + contador "+N más") con el mismo código de colores.

### `AgendaView` (client)
Lista cronológica agrupada por día. Para cada día con reservas muestra: número de día (grande, en terracota), y debajo las reservas ordenadas por hora de inicio, con punto de color, propósito, horario, nº asistentes y pill de estado. Filtra canceladas y reservas pasadas.

### `BookingForm` (client) — Formulario principal
Estado gestionado con `useReducer` (9 campos en 1 reducer). Campos:
- **Fecha:** input date. Al cambiar, limpia alternativas y error.
- **Hora inicio:** Select mostrando horas 09-22. Las horas que ya tienen reservas activas ese día aparecen como disabled con "`· ocupado`".
- **Hora fin:** Select limitado dinámicamente. El rango va desde `startHour+1` hasta el primer slot ocupado o la duración máxima (4h), lo que llegue antes.
- **Motivo:** texto libre, max 160 chars.
- **Tipo de actividad:** select (reunión/cumpleaños/deporte/taller/otro).
- **Asistentes:** número, validado contra el aforo máximo de la sala.
- **Normas + Checkbox:** lista de 6 normas con checkbox de aceptación obligatoria. El botón de confirmar está desactivado hasta que se aceptan.

En caso de error de solapamiento: aparecen botones de franjas horarias alternativas libres ese día. Al clicar en una alternativa, el reducer aplica `APPLY_ALTERNATIVE` actualizando `startHour`/`endHour` y limpiando el error.

### `RoomStatusBanner` (client)
Componente hero en la parte superior del módulo. Tres estados visuales:
- **Disponible** (emerald): dot animado verde, texto "Disponible para reservas", botón CTA activo.
- **Reservada ahora** (blue): muestra propósito de la reserva en curso y horario de liberación.
- **Fuera de servicio** (taupe/gris): motivo del cierre, botón CTA desactivado.

### `RoomControls` (client) — Panel admin
Dos toggles en la página de gestión:
- **Fuera de servicio:** Switch + campo de motivo (aparece al activar). Llama `setRoomOutOfService()`. Desactiva el CTA en el banner para todos los vecinos.
- **Requiere aprobación:** Switch que cambia entre confirmación instantánea y workflow de aprobación. Llama `setRequiresApproval()`. Cuando está activo, las nuevas reservas quedan en estado `pendiente` hasta que admin aprueba/rechaza.

### `AdminActions` (client) — Tabs de acciones admin
Contenedor de tabs con dos formularios:
- **EventForm:** Crea una reserva `kind=comunidad` (asamblea vecinal, uso de conserjería, obra en zonas comunes...). Salta las reglas de antelación mínima y el límite mensual por vivienda. Sí verifica solapamientos.
- **BlockForm:** Crea un bloqueo `kind=bloqueo` (mantenimiento, revisión técnica...). Impide que los vecinos reserven esa franja. Falla si ya hay reservas activas en el rango — hay que cancelarlas primero.

---

## Flujo de reserva (resumen)

```
Vecino abre calendario → clica slot → BookingDialog se abre (con fecha/hora prefijadas)
→ Rellena motivo + categoria + asistentes + acepta normas
→ Submit → createBooking() Server Action
→ 7 validaciones secuenciales (ver flow-booking-create)
→ Si OK: toast "Reserva confirmada" + cierra diálogo + router.refresh()
→ Si solapamiento: muestra alternativas horarias → vecino elige → reintenta
```

---

## Permisos

| Acción | Roles |
|--------|-------|
| Ver calendario | Todos los miembros |
| Crear reserva | inquilino, propietario, junta, admin_finca |
| Cancelar reserva propia | Dueño de la reserva |
| Cancelar reserva ajena | junta, admin_finca |
| Moderar reservas pendientes | admin_finca |
| Crear evento comunitario | admin_finca |
| Bloquear franja | admin_finca |
| Marcar fuera de servicio | admin_finca |
| Ver panel /gestion | junta, admin_finca |

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]]
**Actions:** [[action-bookings]] · [[lib-check-conflicts]]
**Librerías:** [[lib-permissions]] · [[lib-get-user]] · [[lib-constants]]
**Flujo:** [[flow-booking-create]]
**Patrones:** [[hook-form-transition]]
**Conceptos:** [[con-rls]]
