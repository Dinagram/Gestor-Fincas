---
id: mod_dashboard
type: module
name: Dashboard Principal
path: src/app/(app)/c/[communityId]/dashboard/
description: >
  Vista de resumen de la comunidad. KPIs en tiempo real, accesos rápidos,
  últimas incidencias abiertas, votaciones activas y actividad reciente.
  Server Component puro — sin estado client-side.

parents:
  - id: sys_gestionfinca

children: []

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: file_lib_get_user
    type: uses
    weight: 0.7

tags:
  - dashboard
  - kpis
  - overview
  - server-component

state: active

db_queries:
  - issues abiertas (últimas 5 con creator profile — join)
  - votaciones activas
  - announcements recientes
  - budget KPIs (gasto vs presupuesto)
  - conteo miembros activos
---

# Dashboard Principal

Primera pantalla que ve el usuario al entrar a su comunidad. Ofrece una visión de 360° del estado actual sin necesidad de navegar a cada módulo. Es un Server Component puro — no tiene estado client-side, todas las queries se ejecutan en paralelo en el servidor.

---

## Secciones

### KPIs superiores (4 tarjetas `KpiCard`)
Cuatro métricas clave con enlace directo:
- **Incidencias abiertas:** número de incidencias en estado `abierta`, `en_revision` o `en_curso`. Enlaza al listado de incidencias con filtro activo.
- **Votaciones activas:** número de polls en estado `active`. Enlaza al módulo de votaciones.
- **Comunicados no leídos:** diferencia entre todos los comunicados de la comunidad y los que el usuario tiene en `announcement_reads`. Enlaza al listado de comunicados.
- **Presupuesto ejecutado:** porcentaje del presupuesto anual que ya está gastado. Enlaza al módulo de presupuesto.

Cada `KpiCard` tiene `href` para ser clickable, un ícono (lucide-react), el valor numérico y un `trend` opcional (flecha arriba/abajo con porcentaje de variación).

---

### Últimas incidencias abiertas
Las 5 incidencias más recientes en estado no cerrado. Cada item muestra:
- Estado con color (`IssueStatusPill`).
- Prioridad (`IssuePriorityPill`).
- Título truncado.
- Fecha relativa.
- Avatar + nombre del creador (join con `profiles` en la query).

Enlace "Ver todas" al módulo de incidencias. La query usa `limit(5)` y `join` en un solo round-trip.

---

### Votaciones activas
Lista de votaciones en período de votación activo (entre `starts_at` y `ends_at`). Para cada una:
- Título y tipo (binaria/presupuesto).
- Barra de progreso temporal (% del período transcurrido).
- Contador de votos emitidos.
- Botón directo "Ir a votar" → detail de la votación.

---

### Actividad reciente
Feed cronológico de los últimos eventos en la comunidad:
- Cambios de estado en incidencias (extraídos de `issue_status_history`).
- Nuevos comunicados publicados.
- Nuevas votaciones creadas.

Cada entrada tiene: tipo de evento, descripción y fecha relativa.

---

### Accesos rápidos
Botones de acción frecuente adaptados al rol del usuario:
- **Todos:** "Nueva incidencia", "Ver sala multiusos".
- **Admin/junta:** "Nuevo comunicado", "Nueva votación".

---

## Estrategia de carga

Todas las queries se ejecutan con `Promise.all` para minimizar el tiempo de carga:

```typescript
const [issues, polls, announcements, myReads, budgetStats, members] = await Promise.all([
  // últimas 5 incidencias abiertas (con join creator)
  // votaciones activas
  // todos los IDs de comunicados (para calcular no leídos)
  // mis lecturas de comunicados
  // movimientos de presupuesto del año actual
  // conteo de miembros activos
])
```

No hay estado ni hidratación client-side — el HTML renderizado es estático hasta el siguiente `router.refresh()`.

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]]
**Auth:** [[lib-get-user]]
**Módulos relacionados:** [[incidencias]] · [[votaciones]] · [[comunicados]] · [[presupuesto]]
