---
id: mod_directorio
type: module
name: Módulo Directorio Vecinal
path: src/app/(app)/c/[communityId]/directorio/
description: >
  Vista del edificio y sus unidades. Muestra planta, puerta, propietario/inquilino,
  estado de ocupación. Datos de contacto gated (solo junta/admin).

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

tags:
  - directorio
  - vecinos
  - edificio
  - privacy

state: active

db_tables: [community_members, units, profiles]

views:
  - members-table: Lista de miembros con filtros y búsqueda
  - floor-plan: Vista por planta del edificio
---

# Módulo Directorio Vecinal

Proporciona una visión completa del edificio y sus residentes. Permite a los vecinos conocer a sus vecinos (nombre y rol) y a la junta/admin ver datos de contacto completos. Es un módulo de solo lectura — no hay mutaciones, todas las queries son GET.

---

## Páginas

### `page.tsx` — Directorio principal
Server Component. Carga todos los miembros activos de la comunidad con sus unidades. Renderiza el cliente `DirectoryView` pasándole los datos ya cargados.

Queries paralelas:
1. `community_members` con join a `profiles` (nombre, email, teléfono) y `units` (planta, puerta, tipo).
2. `units` para el plano del edificio (todas las unidades, estén ocupadas o no).

---

## Componentes

### `DirectoryView` (client)
Componente principal con dos vistas toggleables:

**Vista tabla (`MembersTable`):**
- Busqueda en tiempo real por nombre (filtra localmente el array — no hace nueva query).
- Filtros por rol: Todos / Propietarios / Inquilinos / Junta y Admin.
- Columnas: Avatar + nombre, Rol (pill), Unidad (planta-puerta), Datos de contacto.
- **Datos de contacto gated:** El email y teléfono solo aparecen si el usuario tiene `canDo(role, 'member.manage')` (junta/admin). Los propietarios e inquilinos solo ven el nombre y rol de sus vecinos. Esto respeta el RGPD básico de privacidad entre vecinos.

**Vista plano (`FloorPlan`):**
- Renderiza el edificio planta a planta (agrupa unidades por `floor`).
- Cada unidad es una celda con: número de puerta, nombre del residente (si está ocupada), indicador de tipo (propietario/inquilino).
- Color de celda: vacía (gris claro), propietario (azul suave), inquilino (verde suave).
- En móvil: se muestra como acordeón por planta en lugar de grid.

### `MembersTable`
Tabla con `overflow-x-auto` para móvil. Incluye `AvatarGradient` (iniciales del nombre con color determinista basado en hash del nombre — sin avatar real). Las filas son clickables si el usuario tiene permiso de ver datos de contacto.

### `FloorPlan`
Grid CSS con columnas fijas para las puertas. Las unidades vacías (sin `community_member` activo) se muestran en gris con "Vacía". Útil para que el admin identifique unidades sin asignar.

---

## Privacidad

El módulo implementa privacidad por niveles:

| Dato | Propietario/Inquilino | Junta/Admin |
|------|----------------------|-------------|
| Nombre | ✓ | ✓ |
| Rol | ✓ | ✓ |
| Unidad (planta/puerta) | ✓ | ✓ |
| Email | ✗ | ✓ |
| Teléfono | ✗ | ✓ |

La restricción se aplica en el cliente (el dato SÍ llega del servidor pero no se renderiza). Para mayor seguridad, en producción debería también filtrarse en la query RLS.

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]] · [[rbac]]
**Librerías:** [[lib-permissions]]
**Conceptos:** [[con-community-isolation]]
