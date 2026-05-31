---
id: mod_comunicados
type: module
name: Módulo Comunicados
path: src/app/(app)/c/[communityId]/comunicados/
description: >
  Sistema unidireccional de comunicados oficiales. Solo admin_finca puede crear.
  Tipos: aviso, convocatoria, resolución, urgente. Tracking de lectura y acuse de recibo.

parents:
  - id: sys_gestionfinca

children:
  - id: file_action_announcements

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: file_action_announcements
    type: uses
    weight: 1.0
  - target: file_lib_permissions
    type: uses
    weight: 0.9
  - target: file_lib_get_user
    type: uses
    weight: 0.9
  - target: hook_form_transition
    type: uses
    weight: 0.7
  - target: sys_supabase
    type: uses
    weight: 1.0

tags:
  - comunicados
  - announcements
  - unidirectional
  - read-tracking

state: active

db_tables: [announcements, announcement_reads]
announcement_types: [aviso, convocatoria, resolucion, urgente]

pending_fase_2:
  - Detalle de comunicado con auto-mark-read
  - Acuse de recibo con IP + timestamp
  - Email vía Resend al publicar
  - Filtros por tipo y estado de lectura
---

# Módulo Comunicados

Canal unidireccional de comunicación oficial. El administrador de la finca publica comunicados que llegan a todos los vecinos. Sustituye los emails y las notas en el tablón físico. El tracking de lectura permite saber quién ha visto cada comunicado.

---

## Páginas

### `page.tsx` — Listado de comunicados
**Lo que ve el usuario:** Lista de comunicados ordenados por fecha de creación descendente. Cada item muestra:
- **Badge de tipo** con color: aviso (gris), convocatoria (azul), resolución (verde), urgente (rojo).
- **Título** del comunicado.
- **Fragmento** del cuerpo (truncado a 2 líneas).
- **Fecha relativa** ("hace 3 días", "ayer").
- **Indicador "No leído"** — punto naranja si el usuario aún no tiene registro en `announcement_reads`.
- **Chip "Acuse pendiente"** — si el comunicado tiene `requires_ack=true` y el usuario no ha confirmado.
- Botón "Nuevo comunicado" solo visible para admin_finca (RoleGate).

---

### `nuevo/page.tsx` — Crear comunicado (solo admin_finca)
**Lo que hace:** Formulario con los campos:
- **Asunto:** título del comunicado (max 160 chars).
- **Tipo:** select (aviso / convocatoria / resolución / urgente).
- **Contenido:** textarea con todo el texto del comunicado (max 4000 chars, contador de caracteres visible).
- **Requiere acuse de recibo:** checkbox opcional. Si se activa, los vecinos verán un botón para confirmar que han leído y comprendido el comunicado.

Al publicar, `createAnnouncement()` inserta en BD y hace `revalidatePath`. El formulario usa `useFormTransition` con `onSuccess: router.push` al detalle del comunicado recién creado.

---

### `[id]/page.tsx` — Detalle del comunicado
**Lo que ve el usuario:** Artículo completo del comunicado.
- **Header:** tipo (badge), título grande, fecha y autor.
- **Cuerpo:** texto completo preservando saltos de línea (`whitespace-pre-wrap`).
- **Auto-mark-read:** El componente `AutoMarkRead` (client, efecto de montaje) llama a `markAnnouncementRead()` silenciosamente al cargar la página. El upsert usa `ignoreDuplicates: true` — solo registra la primera lectura, no sobrescribe.
- **Banner de acuse de recibo:** Si `requires_ack=true` y el usuario no ha confirmado, aparece un banner destacado con botón "Confirmar que he leído". Al clicar llama `acknowledgeAnnouncement()` — este upsert SÍ sobrescribe (sin `ignoreDuplicates`) porque siempre debe actualizar `acknowledged_at`.
- **Lista de lecturas (solo admin):** Tabla con todos los miembros, cuáles han leído y cuáles han confirmado. Útil para verificar que la convocatoria llegó a todos.

---

## Componentes

### `AnnouncementCard`
Card del listado. Clickable completa → navega al detalle. El indicador de "no leído" se calcula en el Server Component comparando los IDs de `announcement_reads` del usuario con el ID del comunicado.

### `NewAnnouncementForm` (client)
Formulario de creación. Usa `useFormTransition` con la action `createAnnouncement`. En caso de éxito, el hook navega a `/comunicados/{result.id}` vía `router.push`. El contador de caracteres del textarea es reactivo (actualiza en tiempo real con `body.length`).

### `MarkReadButton` / `AcknowledgeButton` (client)
Botones que llaman a las acciones de marcado. Usan `useTransition` directamente (sin `useFormTransition`) porque no tienen formulario — son botones simples de acción.

### `AutoMarkRead` (client)
Componente invisible (sin renderizado visual). Usa `useEffect` de montaje para llamar a `markAnnouncementRead()` automáticamente cuando el usuario abre el detalle. De esta forma el vecino no tiene que hacer nada explícito para marcar como leído.

---

## Diferencia entre markRead y acknowledge

| Acción | Cuándo | `ignoreDuplicates` | Efecto |
|--------|--------|-------------------|--------|
| `markAnnouncementRead` | Al abrir el detalle (automático) | `true` | Registra `read_at` solo la primera vez |
| `acknowledgeAnnouncement` | Al clicar "Confirmar lectura" (manual) | `false` | Siempre actualiza `acknowledged_at` |

Esta diferencia es **intencional** — se puede leer varias veces pero el `acknowledged_at` es la última confirmación activa del usuario.

---

## Fase 2 — Pendiente

Las siguientes funcionalidades están planeadas pero no implementadas:
- **Email automático** vía Resend al publicar un comunicado urgente o convocatoria.
- **Filtros** en el listado (por tipo, por estado leído/no leído).
- **Adjuntos** — subir PDF o imagen al comunicado (bucket `announcement-files` ya creado en Storage).
- **Acuse de recibo con IP y timestamp** del navegador para valor legal.

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]]
**Action:** [[action-announcements]]
**Librerías:** [[lib-permissions]] · [[lib-get-user]]
**Patrones:** [[hook-form-transition]] · [[flow-mutation]]
**Conceptos:** [[con-rls]]
