---
id: mod_ajustes
type: module
name: Módulo Configuración (Ajustes)
path: src/app/(app)/c/[communityId]/ajustes/
description: >
  Permite al administrador de finca editar la información del edificio (nombre, dirección,
  CIF, etc.). El resto de roles ven los datos en modo solo lectura. UX de edición por
  toggle: read-only → Editar → inputs → Guardar / Cancelar.

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
    weight: 0.9
  - target: file_lib_permissions
    type: uses
    weight: 0.8
  - target: action_community
    type: uses
    weight: 1.0

tags:
  - ajustes
  - configuracion
  - admin
  - edificio

state: active

db_tables: [communities]
---

# Módulo Configuración (Ajustes)

Pantalla de administración del edificio. Solo el `admin_finca` puede modificar los datos; el resto de roles los ve en solo lectura.

---

## Páginas

### `page.tsx` — Ajustes principales
Server Component. Llama a `requireMember(communityId)` y calcula:
- `isEditable = canDo(role, 'community.edit')` — true solo para `admin_finca` y `superadmin`

Query: `communities` → `id, name, address, city, province, postal_code, cif`.

Renderiza dos cards:
1. **Información del edificio** → `CommunitySettingsForm`

---

## Componentes

### `CommunitySettingsForm` (client)
Props: `{ communityId, defaultValues, canEdit }`.

**Estado `editing = false` (por defecto):**
- Campos como texto estático (`ReadField`)
- Si `canEdit`: botón "Editar" en esquina inferior derecha

**Estado `editing = true`:**
- Inputs editables con `react-hook-form` + `zodResolver`
- Botones "Cancelar" (reset + `editing=false`) y "Guardar cambios"
- Al guardar con éxito: toast de sonner + `editing=false`
- Al cancelar: `form.reset(defaultValues)` sin llamar al servidor

Campos editables:
| Campo | Validación |
|-------|-----------|
| Nombre de la comunidad | min 3 chars, requerido |
| CIF / NIF | opcional |
| Dirección | min 5 chars, requerido |
| Ciudad | opcional |
| Provincia | opcional |
| Código postal | regex `/^\d{5}$/`, opcional |

---

## Server Action (`src/actions/community.ts`)

### `updateCommunity(communityId, input)`
```typescript
export async function updateCommunity(communityId: string, input: unknown): Promise<ActionResult>
```

Flujo:
1. Valida con `updateCommunitySchema` (Zod, en `src/lib/validators/community.ts`)
2. `getUserRole(communityId)` → error si no miembro
3. `canDo(role, 'community.edit')` → error si no admin_finca
4. `supabase.from('communities').update({...}).eq('id', communityId)`
5. `revalidatePath` en `/c/${communityId}/ajustes` y `/c/${communityId}` (refresca el nombre en el sidebar)

---

## Validator (`src/lib/validators/community.ts`)

```typescript
export const updateCommunitySchema = z.object({
  name:        z.string().min(3),
  address:     z.string().min(5),
  city:        z.string().optional(),
  province:    z.string().optional(),
  postal_code: z.string().regex(/^\d{5}$/).optional().or(z.literal('')),
  cif:         z.string().optional(),
});
```

---

## Permiso requerido

`community.edit` → solo `['admin_finca']` (definido en `src/lib/permissions.ts`).

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]] · [[rbac]]
**Acciones:** [[action-community]]
**Validadores:** [[validator-community]]
**Librerías:** [[lib-permissions]] · [[lib-get-user]]
**Flujos:** [[flow-mutation]]
