# Database — Schema

Supabase Postgres 15. Todas las tablas con RLS habilitado **y forzado** (incluso el owner está sujeto a las policies).

## Migrations

```
supabase/migrations/
├── 0001_extensions_and_enums.sql
├── 0002_core_tables.sql
├── 0003_rls_helpers.sql
├── 0004_domain_tables.sql
├── 0005_rls_policies.sql
└── 0006_storage_buckets.sql
```

Orden importante: helpers (0003) van **después** de las tablas core (0002) que referencian. Las policies (0005) van al final, **después** de todas las tablas y helpers.

Re-ejecución: `pnpm db:reset` borra todo, vuelve a aplicar las migrations en orden y corre `supabase/seed.sql`. **Antes** del seed.sql conviene ejecutar `pnpm db:seed-users` para que los `auth.users` existan.

## Convenciones

- **`community_id` denormalizado** en toda tabla hija — RLS sin JOINs.
- **Enums Postgres** sobre tablas de lookup para valores estables del dominio (LPH).
- **`profiles` espejo de `auth.users`** vía trigger `on_auth_user_created`. El resto del schema referencia `profiles(id)`.
- **Códigos `INC-001`** generados por trigger con tabla `community_counters` (contador por comunidad).
- **`issue_status_history`** sólo escrita por trigger `SECURITY DEFINER`. No hay policies de INSERT para clientes.

## Tablas

### Core / Tenancy

| Tabla | Propósito |
|---|---|
| `communities` | Tenant raíz: finca. |
| `units` | Vivienda / local / garaje / trastero con `floor`, `door`, `coefficient`. |
| `profiles` | Espejo de `auth.users` con `full_name`, `phone`, `avatar_url`. |
| `community_members` | Pertenencia user↔community con `role`. PK (community_id, profile_id, unit_id). |
| `invitations` | Tokens de invitación con expiración. |
| `community_counters` | Sequence por comunidad (códigos INC-XXX). |

### Incidencias

| Tabla | Propósito |
|---|---|
| `issues` | Incidencia con `code` (INC-001 auto), `status`, `priority`, `category`. |
| `issue_comments` | Hilo + mensajes de sistema (`is_system=true`). |
| `issue_attachments` | Adjuntos en Storage. |
| `issue_status_history` | Trazabilidad de cambios (sólo trigger escribe). |
| `issue_supports` | Apoyos de vecinos ("me sumo"). |

### Votaciones (Fase 3)

| Tabla | Propósito |
|---|---|
| `polls` | Votación con `type` (binary/multiple/budget), ventana temporal y quórum. |
| `poll_options` | Opciones para `type='multiple'`. |
| `poll_votes` | Voto individual ponderado por `weight` (coeficiente). |
| `poll_participants` | Censo elegible pre-calculado. |

### Comunicados

| Tabla | Propósito |
|---|---|
| `announcements` | Avisos oficiales con `type` (aviso/convocatoria/resolucion/urgente). |
| `announcement_reads` | Tracking de lectura y acuse. |

### Documentos

| Tabla | Propósito |
|---|---|
| `documents` | Archivos por carpeta lógica (actas, estatutos, seguros…). |

### Presupuesto

| Tabla | Propósito |
|---|---|
| `budget_categories` | Categorías jerárquicas. |
| `budget_entries` | Movimientos presupuestado / ejecutado. |
| `budget_imports` | Bitácora de importaciones. |

## Enums clave

- `member_role` — superadmin, admin_finca, junta, propietario, inquilino
- `issue_status` — abierta, en_revision, en_curso, resuelta, cerrada, descartada
- `issue_priority` — baja, media, alta, urgente
- `issue_category` — ascensor, fontaneria, electricidad, limpieza, ruido, seguridad, jardineria, obras, otros
- `poll_type` — binary, multiple, budget
- `announcement_type` — aviso, convocatoria, resolucion, urgente

## Triggers

| Trigger | Cuándo | Qué hace |
|---|---|---|
| `on_auth_user_created` | INSERT en auth.users | Crea `profiles` correspondiente. |
| `set_updated_at` | UPDATE en tablas con `updated_at` | Refresca timestamp. |
| `trg_issue_assign_code` | INSERT en `issues` (code vacío) | Asigna `INC-001` consultando `community_counters`. |
| `log_issue_status_change` | INSERT/UPDATE de `status` en `issues` | Inserta fila en `issue_status_history`. |

## Helper functions (RLS)

Definidas en `0003_rls_helpers.sql` como `STABLE SECURITY DEFINER`:

- `is_platform_admin()` — superadmin de plataforma
- `is_member(_community)` — pertenece a la comunidad
- `current_member_role(_community)` — devuelve el rol o NULL
- `has_role(_community, _role)` — rol exacto
- `is_admin_or_junta(_community)` — admin_finca o junta
- `can_vote_economic(_community)` — propietario / admin_finca / junta (excluye inquilino)

## RLS — regla general por tabla

```
SELECT  → is_member(community_id)
INSERT  → is_member(community_id) + author = auth.uid()
UPDATE  → role-gated (admin_finca/junta) o autor según corresponda
DELETE  → admin_finca (mayoritariamente)
```

Excepción notable: `poll_votes`, donde el INSERT exige `can_vote_economic` si `poll.type='budget'` — los inquilinos NO votan presupuesto.

## Performance

- Índice `(profile_id, community_id) WHERE status='active'` en `community_members` → `is_member()` resuelve con index-only scan (~0.05 ms).
- Índice `(community_id, created_at DESC)` en tablas grandes (issues, announcements, budget_entries).
- Las funciones helper son `STABLE` → Postgres las memoíza dentro de la misma sentencia.

## Generación de tipos TypeScript

```powershell
pnpm db:start              # arranca el stack local
pnpm db:types              # genera src/types/database.ts
```

El proyecto incluye un `database.ts` placeholder hasta que ejecutes `db:types` por primera vez.
