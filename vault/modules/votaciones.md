---
id: mod_votaciones
type: module
name: Módulo Votaciones
path: src/app/(app)/c/[communityId]/votaciones/
description: >
  Votaciones comunitarias con quórum configurable. Tipos: binary, budget
  (inquilinos excluidos). Estados: draft → active → closed/cancelled.

parents:
  - id: sys_gestionfinca

children:
  - id: file_action_polls

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: file_action_polls
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
  - target: sys_rbac
    type: uses
    weight: 0.8

tags:
  - votaciones
  - polls
  - quorum
  - democracy

state: active

db_tables: [polls, poll_options, poll_votes]
poll_types: [binary, budget]
poll_statuses: [draft, active, closed, cancelled]
vote_choices: [favor, contra, abstencion]

key_components:
  - name: NewPollForm
    type: client
    note: Usa useFormTransition hook; wraps action para router.push con result.id
  - name: VotePanel
    type: client
    note: Muestra botones de voto o voto ya emitido
  - name: PollResults
    type: client
    note: Barras de progreso con porcentajes y quórum
  - name: PollActions
    type: client
    note: Activar/cerrar/cancelar — solo junta/admin

notes:
  - POLL_STATUS_BADGE_CLASSES centralizado en src/lib/constants.ts (refactorizado de inline en votaciones/[id]/page.tsx).
  - Inquilinos pueden votar binarias pero NO las de tipo budget.
---

# Módulo Votaciones

Permite a la junta y al administrador crear votaciones formales vinculantes. Los vecinos votan desde la app. El módulo calcula automáticamente si se alcanza el quórum y muestra los resultados en tiempo real. Las votaciones de presupuesto excluyen a los inquilinos por normativa de comunidades.

---

## Páginas

### `page.tsx` — Listado de votaciones
**Lo que ve el usuario:** Lista de votaciones de la comunidad. Tabs de filtrado: Todas / Activas / Borrador / Cerradas / Canceladas.

Cada card de votación muestra:
- **Badge de estado** con color: borrador (ámbar), activa (verde), cerrada (gris), cancelada (rojo).
- **Badge de tipo:** binaria o presupuesto (con el importe en euros si aplica).
- **Título** de la votación.
- **Barra de progreso temporal:** de inicio a fin del período de votación, con marcador de "Hoy".
- **Datos de participación:** votos emitidos y quórum requerido.
- **Período:** fechas de inicio y fin formateadas.

---

### `nueva/page.tsx` — Crear votación (solo junta/admin_finca)
**Formulario con los campos:**
- **Título:** descripción concisa de qué se vota (max 160 chars).
- **Descripción:** contexto adicional, opcional (max 2000 chars).
- **Tipo:** Binaria (sí/no) o Presupuesto (sí/no + importe en euros). El tipo "múltiple" está en la BD pero no expuesto en UI aún.
- **Importe:** solo aparece si tipo = presupuesto.
- **Inicio / Fin:** datetime-local. El período define cuándo los vecinos pueden votar.
- **Quórum (%):** porcentaje mínimo de participación para que la votación sea válida.

Se crea en estado `draft`. La junta debe activarla manualmente.

---

### `[id]/page.tsx` — Detalle de votación
**Sección izquierda — Resultados (`PollResults`):**
Barras de progreso horizontales para A favor, En contra y Abstención, con porcentaje y recuento absoluto. Indicador visual de si se alcanzó el quórum. Si la votación está cerrada, se resalta la opción ganadora.

**Sección derecha — Tu voto + Timeline:**
- **`VotePanel`** (si está activa): permite emitir o cambiar el voto.
- **Barra temporal:** visualiza el progreso del período de votación. Tiene un marcador circular en la posición de "Hoy".
- **Stats:** votos emitidos vs quórum requerido.

**Acciones de junta/admin (`PollActions`):** según el estado actual:
- Draft → botón "Activar votación".
- Activa → botones "Cerrar votación" y "Cancelar".
- Cerrada/Cancelada → solo visualización.

---

## Componentes

### `NewPollForm` (client)
Formulario de creación. Usa `useFormTransition` con `createPoll`. En caso de éxito, navega a `/votaciones/{result.id}` vía `router.push` dentro del wrapper de action. El campo "Importe" aparece/desaparece condicionalmente según el tipo seleccionado.

### `VotePanel` (client)
Muestra 3 botones: A favor (verde), En contra (rojo), Abstención (gris). Llama `castVote()` al clicar — es un upsert, así que el usuario puede cambiar su voto mientras la votación esté activa.

**Casos especiales:**
- Si el usuario ya votó: muestra su voto actual con opción de cambiar.
- Si la votación no está en período activo (antes del inicio o después del fin): muestra mensaje informativo.
- Si es una votación de tipo `budget` y el usuario es `inquilino`: muestra "No tienes permiso para votar en votaciones de presupuesto" — los inquilinos no son propietarios y no tienen voz en decisiones económicas.

### `PollResults` (client)
Barras de progreso animadas. Calcula porcentajes sobre el total de votos emitidos. Muestra el quórum como línea vertical dashed en la barra de total — si los votos emitidos superan esa línea, el quórum está alcanzado.

### `PollActions` (client)
Botones de gestión de estado. Solo visibles para `junta` y `admin_finca` (verificado en página con `canDo('poll.create')`). Llaman a `activatePoll()`, `closePoll()` o `cancelPoll()` según el estado actual.

### `PollFilters` (client)
Tabs o select de filtrado por estado. Actualiza URL params para que el filtro sea compartible.

---

## Ciclo de vida de una votación

```
Draft → (junta activa) → Activa → (período termina o junta cierra) → Cerrada
                                → (junta cancela) → Cancelada
```

- **Draft:** Solo la junta/admin la ve. Los vecinos no pueden votar.
- **Activa:** Todos los miembros con permiso pueden votar. Resultados visibles en tiempo real.
- **Cerrada:** Ya no se puede votar. Resultados finales con quórum calculado.
- **Cancelada:** Se anuló. Los votos quedan registrados pero la votación no tiene validez.

---

## Regla de exclusión de inquilinos

Las votaciones de tipo `budget` (presupuesto) solo pueden ser votadas por `propietario`, `junta` y `admin_finca`. Los `inquilino` pueden ver la votación y los resultados, pero `castVote()` les retorna error.

Esto refleja la normativa española de comunidades de propietarios: solo los propietarios pueden votar en asuntos económicos.

---

## Permisos

| Acción | Roles |
|--------|-------|
| Ver votaciones y resultados | Todos los miembros |
| Crear votación | junta, admin_finca |
| Activar / Cerrar / Cancelar | junta, admin_finca |
| Votar (binaria) | Todos los miembros |
| Votar (presupuesto) | propietario, junta, admin_finca |

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]] · [[rbac]]
**Action:** [[action-polls]]
**Librerías:** [[lib-permissions]] · [[lib-get-user]] · [[lib-constants]]
**Patrones:** [[hook-form-transition]] · [[flow-mutation]]
**Conceptos:** [[con-rls]]
