---
id: mod_incidencias
type: module
name: Módulo Incidencias
path: src/app/(app)/c/[communityId]/incidencias/
description: >
  Módulo MVP más importante. Gestión de problemas comunitarios con estados,
  prioridades, categorías, chat de comentarios, votos de apoyo y adjuntos.

parents:
  - id: sys_gestionfinca

children:
  - id: file_action_issues

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: file_action_issues
    type: uses
    weight: 1.0
  - target: file_lib_permissions
    type: uses
    weight: 0.9
  - target: file_lib_get_user
    type: uses
    weight: 0.9
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: con_rls
    type: uses
    weight: 1.0
  - target: hook_form_transition
    type: uses
    weight: 0.7
  - target: flow_mutation
    type: uses
    weight: 0.8

tags:
  - incidencias
  - issues
  - chat
  - attachments
  - mvp-core

state: active

pages:
  - path: page.tsx
    type: server
    purpose: Listado con filtros; RoleGate para crear
  - path: nueva/page.tsx
    type: server
    purpose: Formulario creación (requireMember guard)
  - path: "[id]/page.tsx"
    type: server
    purpose: Detalle — comments, history, attachments, status menu (6 queries paralelas)

key_components:
  - name: NewIssueForm
    path: _components/new-issue-form.tsx
    type: client
    note: Usa useFormTransition; createIssue llama redirect() internamente al éxito
  - name: IssueChat
    path: _components/issue-chat.tsx
    type: client
    note: useOptimistic + router.refresh() polling (Realtime instalado pero no cableado)
  - name: IssueFilters
    path: _components/issue-filters.tsx
    type: client
  - name: AttachmentUploader
    path: _components/attachment-uploader.tsx
    type: client
    note: Upload directo browser → bucket Supabase Storage
  - name: IssueStatusMenu
    path: _components/issue-status-menu.tsx
    type: client
    note: Solo visible para junta/admin (RoleGate)

db_tables: [issues, issue_comments, issue_attachments, issue_supports]
states: [abierta, en_revision, en_curso, resuelta, cerrada, descartada]

notes:
  - Trigger DB log_issue_status_change registra cambios en issue_status_history Y añade mensaje sistema al chat.
---

# Módulo Incidencias

El módulo más importante del MVP. Permite a los vecinos reportar problemas de la comunidad y a la junta/admin gestionarlos hasta su resolución. Funciona como un sistema de tickets con chat, adjuntos y trazabilidad completa de cambios.

---

## Páginas

### `page.tsx` — Listado de incidencias
**Lo que ve el usuario:** Un listado de tarjetas con todas las incidencias de la comunidad, ordenadas por fecha. Cada card muestra: estado con color (abierta=rojo, en_revision=naranja, en_curso=azul, resuelta=verde), prioridad (badge urgente/alta/media/baja), categoría (ascensor, fontanería, etc.), título, fecha relativa y el número de votos de apoyo.

**Filtros disponibles:** Por estado, por categoría. Los filtros se mantienen en los URL params para que se pueda compartir el enlace.

**Acceso a crear:** Solo usuarios con permiso `issue.create` (todos los roles excepto superadmin en algunos casos) ven el botón "Nueva incidencia". El botón está envuelto en `RoleGate`.

---

### `nueva/page.tsx` — Crear incidencia
**Lo que hace:** Renderiza `NewIssueForm` en una página completa. Protegida con `requireMember`. Al completar el formulario, el Server Action `createIssue` llama internamente a `redirect()` hacia el detalle de la incidencia recién creada — el formulario nunca recibe un `result.ok` porque la navegación ocurre antes.

---

### `[id]/page.tsx` — Detalle de incidencia
**Lo que ve el usuario:** Vista completa dividida en:
- **Header:** Estado actual (con menú de cambio para junta/admin), prioridad, categoría, ubicación, fecha de creación y autor.
- **Descripción:** Texto completo de la incidencia.
- **Chat de comentarios (`IssueChat`):** Conversación en tiempo real entre vecinos y gestores. Los mensajes del sistema (ej. "Estado cambiado a En curso por Admin") se insertan automáticamente por el trigger DB `log_issue_status_change`.
- **Adjuntos (`AttachmentList`):** Lista de archivos subidos. Cada uno tiene botón de descarga que genera una signed URL temporal (60s) llamando a `signAttachmentUrl()`.
- **Subir adjunto (`AttachmentUploader`):** Drag-and-drop o clic. El upload va directo del browser al bucket Supabase `incidence-attachments`, y luego se registra en BD con `registerAttachment()`.
- **Votos de apoyo:** Botón con contador. Cualquier miembro puede dar apoyo. Toggle — si ya apoyó, vuelve a clicar para quitar el apoyo.

**Queries paralelas (Promise.all):** comments + historial_estados + support_count + mi_support + user_actual + attachments.

---

## Componentes

### `NewIssueForm` (client)
Formulario con 5 campos: título (min 3, max 160), descripción (opcional, max 4000), categoría (select de 9 opciones), prioridad (baja/media/alta/urgente), ubicación (texto libre).

Usa `useFormTransition` con la action `createIssue`. Como `createIssue` llama a `redirect()` en caso de éxito, el formulario simplemente muestra error si algo falla — no necesita lógica de éxito.

### `IssueChat` (client)
Chat de comentarios con actualizaciones en tiempo real (simulado). Usa `useOptimistic` de React para añadir el mensaje del usuario inmediatamente al estado local antes de que el Server Action confirme. Cuando el servidor confirma, hace `router.refresh()` para sincronizar. El scroll automático lleva al fondo al cargar y al enviar nuevos mensajes. Submit con Enter (sin Shift) o botón enviar.

Los mensajes del sistema (cambios de estado) aparecen en el chat con estilo diferente — los genera el trigger `log_issue_status_change` de PostgreSQL automáticamente.

### `IssueFilters` (client)
Dropdowns de estado y categoría que actualizan los URL search params sin navegación completa. El Server Component padre lee los params y filtra las incidencias en la query.

### `AttachmentUploader` (client)
Input de archivo que sube directamente al bucket Supabase Storage usando la SDK del browser (no pasa por el servidor). Tras la subida, llama al Server Action `registerAttachment()` con la ruta del archivo, nombre, mime type y tamaño. Esto mantiene el registro en BD sincronizado con el storage.

### `IssueStatusMenu` (client)
Dropdown con los 6 estados posibles. Solo visible para junta/admin (envuelto en `RoleGate action="issue.change_status"`). Al seleccionar, llama `changeIssueStatus()` — el trigger DB añade automáticamente un mensaje sistema al chat y registra el cambio en `issue_status_history`.

### `IssueSupportButton` (client)
Botón con contador de apoyos. Llama `toggleIssueSupport()`. Usa estado optimista para toggle instantáneo en UI antes de confirmación del servidor.

---

## Máquina de estados

```
abierta → en_revision → en_curso → resuelta → cerrada
    ↓                                               ↑
descartada ←────────────────────────────────────────
```

Cualquier estado puede ir a `descartada`. Solo junta/admin puede cambiar estado.

---

## Permisos

| Acción | Roles permitidos |
|--------|-----------------|
| Ver listado y detalle | Todos los miembros |
| Crear incidencia | inquilino, propietario, junta, admin_finca |
| Comentar | Todos los miembros |
| Cambiar estado | junta, admin_finca |
| Subir adjuntos | Todos los miembros |
| Eliminar incidencia | admin_finca |

---

## Notas técnicas

- El trigger PostgreSQL `log_issue_status_change` se ejecuta en cada `UPDATE` de `issues.status`. Inserta en `issue_status_history` y crea un `issue_comment` con `is_system=true`.
- Realtime de Supabase está instalado pero no cableado en este módulo. El chat usa `router.refresh()` como polling (el usuario actualiza manualmente o espera al siguiente render).
- Los adjuntos no se borran del bucket al eliminar la incidencia — se acumula storage. Pendiente: limpieza automática.

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]] · [[rbac]]
**Action:** [[action-issues]]
**Librerías:** [[lib-permissions]] · [[lib-get-user]] · [[lib-constants]]
**Patrones:** [[hook-form-transition]] · [[flow-mutation]]
**Conceptos:** [[con-rls]]
