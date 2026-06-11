---
id: mod_directorio
type: module
name: Módulo Directorio Vecinal
path: src/app/(app)/c/[communityId]/directorio/
description: >
  Vista del edificio y sus unidades. Muestra planta, puerta, propietario/inquilino,
  estado de ocupación, cuota mensual y estado de pago. Datos de contacto gated (solo junta/admin).
  Permite al administrador editar datos de cualquier vecino.

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
  - target: sys_rbac
    type: uses
    weight: 0.8
  - target: file_lib_permissions
    type: uses
    weight: 0.7
  - target: action_directory
    type: uses
    weight: 0.9

tags:
  - directorio
  - vecinos
  - edificio
  - privacy
  - morosos

state: active

db_tables: [community_members, units, profiles]

views:
  - members-table: Lista de miembros con filtros, búsqueda, edición inline y exportación XLS
  - floor-plan: Vista por planta del edificio
---

# Módulo Directorio Vecinal

Proporciona una visión completa del edificio y sus residentes. Permite a los vecinos ver información básica, a la junta/admin ver datos de contacto completos, y al administrador editar cualquier vecino.

---

## Páginas

### `page.tsx` — Directorio principal
Server Component. Filtra únicamente `viviendas` (`.eq('type', 'vivienda')`), excluyendo garajes y trasteros.

Queries paralelas:
1. `community_members` → join a `profiles` (nombre, email, teléfono) + campos `joined_at`, `monthly_fee`, `payment_status`.
2. `units` filtradas por `type = 'vivienda'` (ordenadas por planta y puerta).

Permisos calculados en el servidor:
- `canSeeContact = isAtLeast(role, 'junta')` — contacto y cuota visibles
- `canEditMembers = canDo(role, 'community.edit')` — botón editar visible

KPIs (grid 2×2 / 4 en desktop):
- **Unidades** — total de viviendas (azul)
- **Ocupadas** — viviendas con miembro activo (verde)
- **Inquilinos** — miembros con rol `inquilino` (ámbar)
- **Morosos** — miembros con `payment_status = 'moroso'` (rojo)

---

## Tipo `DirectoryEntry` (exportado)

```typescript
{
  unitId, floor, door, unitType, coefficient,
  memberId: string | null,
  profileId: string | null,        // necesario para updateMember
  memberRole, memberStatus,
  fullName, email, phone, avatarUrl,
  joinedAt: string | null,
  monthlyFee: number,              // community_members.monthly_fee
  paymentStatus: 'al_dia' | 'moroso' | 'pendiente',
}
```

---

## Componentes

### `DirectoryView` (client)
Controla filtros, búsqueda, vista y dialogs de importación. Props: `entries`, `canSeeContact`, `canEditMembers`, `communityId`.

**Filtros:** Todos · Propietarios · Inquilinos · Vacías · **Morosos** (rojo cuando activo).

**Botón Exportar** (visible para todos): genera `directorio-vecinos.xlsx` con todas las columnas via librería `xlsx`.

**Botón Importar** (solo `canSeeContact`): Dialog con descarga de plantilla → subida de fichero → previsualización → confirmación → llama a `importMembers`.

### `MembersTable` (client)
Tabla con columnas:

| Columna | Descripción | Visibilidad |
|---------|-------------|-------------|
| Unidad | `1ºA`, `2ºB`… | Siempre |
| Vecino | Nombre + "Desde MMM yyyy" | Siempre |
| Contacto | Email + teléfono apilados | Solo `canSeeContact` |
| Tipo | Badge Propietario / Inquilino | Siempre |
| Tags | Badge Junta / Administrador | Solo ≥ lg |
| Cuota | `120 €/mes` | Solo `canSeeContact` ≥ lg |
| Estado | Badge Al día / Moroso / Pendiente | Siempre |
| ✏️ Editar | Icono lápiz | Solo `canEditMembers` |

Al pulsar el lápiz en una fila → abre `EditMemberDialog`.

### `EditMemberDialog` (client)
Dialog modal para editar un vecino. Campos:
- Nombre completo (actualiza `profiles.full_name`)
- Teléfono (actualiza `profiles.phone`)
- Tipo: Propietario / Inquilino / Junta (actualiza `community_members.role`)
- Cuota €/mes (actualiza `community_members.monthly_fee`)
- Estado de pago: Al día / Pendiente / Moroso (actualiza `community_members.payment_status`)

Llama a `updateMember` server action. Toast de éxito/error con `sonner`.

### `FloorPlan`
Grid CSS planta a planta. Unidades vacías en gris. Propietario en azul, inquilino en verde.

---

## Server Actions (`src/actions/directory.ts`)

### `importMembers(communityId, rows)`
Gateado por `canDo(role, 'announcement.create')`. Por cada fila: busca unidad por `(floor, door)`, busca perfil por email, hace upsert en `community_members`.

### `updateMember(communityId, memberId, profileId, input)`
Gateado por `canDo(role, 'community.edit')`. Actualiza en paralelo `profiles` (nombre, teléfono) y `community_members` (role, monthly_fee, payment_status).

---

## Base de datos

Campos relevantes de `community_members` (migración 0009):
```sql
monthly_fee    numeric(8,2) NOT NULL DEFAULT 0
payment_status text NOT NULL DEFAULT 'al_dia'
  CHECK (payment_status IN ('al_dia', 'moroso', 'pendiente'))
```

---

## Privacidad

| Dato | Propietario/Inquilino | Junta/Admin |
|------|----------------------|-------------|
| Nombre, Rol, Unidad | ✓ | ✓ |
| Email, Teléfono | ✗ | ✓ |
| Cuota, Estado pago | ✗ | ✓ |
| Botón editar | ✗ | Solo admin_finca |

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]] · [[rbac]]
**Acciones:** [[action-directory]]
**Librerías:** [[lib-permissions]]
**Conceptos:** [[con-community-isolation]]
