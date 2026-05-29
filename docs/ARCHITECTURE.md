# Arquitectura — GestiónFinca (Shire)

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | TailwindCSS + shadcn/ui (Radix primitives) |
| Backend | Supabase: PostgreSQL 15, Auth, Storage, Realtime |
| Auth | Supabase Auth (magic link + email/password) |
| Validación | Zod (compartido cliente ↔ servidor) |
| Iconos | lucide-react |
| Estado UI | Zustand mínimo (sólo UI cross-component) |
| Tema | next-themes (claro / oscuro / sistema) |
| Hosting | Vercel (target) |
| Emails | Resend (opcional, Fase 2+) |

## Filosofía

- **NO microservicios. NO CQRS. NO DDD extremo.** Monolito Next.js + Supabase, modular pero pragmático.
- **Datos del servidor → Server Components / Server Actions.** Sin TanStack Query, sin Redux.
- **Validación en frontera.** Zod en Server Actions (server) y RHF + zodResolver (client) cuando aporte.
- **Seguridad = RLS.** La base de datos es el guardián final. Frontend gates son UX, no defensa.

## Capas

```
Browser
  │
  ▼
middleware.ts  ◄── refresca sesión Supabase (cookies @supabase/ssr)
  │
  ▼
RSC / Server Action
  │
  ▼
Supabase (Postgres + RLS + Storage + Realtime)
```

## Server Components vs Client Components

| Cuándo Server Component (por defecto) | Cuándo Client Component (`'use client'`) |
|---|---|
| Render inicial, listados, detalles | Interactividad inmediata (filtros, optimistic UI) |
| Cualquier `await supabase.from(...)` | Suscripciones Realtime |
| Layouts que cargan sesión/profile/role | Forms con feedback inmediato (`useTransition`) |
| Cualquier `redirect()`/`notFound()` | Dropdowns, dialogs, sheets |

## Mutaciones

**Server Actions** para todo lo que el usuario dispara (`createIssue`, `commentIssue`, `changeIssueStatus`, `toggleIssueSupport`, `signAttachmentUrl`, `registerAttachment`).

- Validación con Zod al recibir.
- `revalidatePath(...)` para invalidar caches RSC.
- `redirect(...)` cuando proceda.
- Permisos: helper `canDo(role, action)` + RLS en BD.

**Route Handlers (`app/api/*`)** solo para:
- Webhooks externos
- Callbacks de auth (`/callback/route.ts`)
- Firmas de URLs cuando el path es público (storage signing — aquí va por Server Action porque ya estamos autenticados)

## Realtime

Sólo activo donde aporta valor de verdad:

- **Chat de incidencias**: `supabase.channel('issue:'+id).on('postgres_changes', { event:'INSERT', schema:'public', table:'issue_comments', filter:'issue_id=eq.<id>' })`.
- (Fase 3) **Contador de votos en votaciones activas**.
- (Fase 4) **Badge global de notificaciones no leídas**.

Para listados generales: `revalidatePath` es suficiente. No paguemos Realtime por todo.

## Permissions / RBAC

Roles almacenados en `community_members.role` (enum Postgres). **NO JWT custom claims** en MVP — un usuario puede tener roles distintos por comunidad.

3 capas de defensa:

1. **UI** (`<RoleGate action="issue.change_status">`): esconde botones para no inducir errores.
2. **Server Action** (`canDo(role, action)` + verificación de membresía): rechaza con error si el usuario intenta saltarse el gate.
3. **RLS Postgres** (`is_admin_or_junta(community_id)`): cinturón final. Aunque alguien construya el request a mano, la BD rechaza.

## Multitenancy

- Tenant = `community` (una finca).
- `community_id` denormalizado en TODA tabla hija (issues, comments, votes, etc.). Las RLS evalúan sin JOINs.
- Usuario ↔ comunidad vía `community_members` (many-to-many con rol).
- Aislamiento: `is_member(community_id)` en cada policy SELECT garantiza que un vecino jamás ve datos de otra comunidad.

## State management

- **Datos del servidor**: RSC + Server Actions. No cliente.
- **UI cross-component**: un único store Zustand (sidebar, current community en cliente, etc.) — añadir solo si duele.
- **Form state**: `useState` + `useTransition` para forms triviales; RHF + Zod para forms complejos.
- **Optimistic UI**: `useOptimistic` (React 19) para support button y chat.

## Storage

4 buckets (ver `docs/DATABASE.md` y `supabase/migrations/0006_storage_buckets.sql`):
- `incidence-attachments` — privado
- `documents` — privado
- `announcement-files` — privado
- `avatars` — público lectura

**Path convention**: `{community_id}/{resource_type}/{resource_id}/{filename}`.

Descargas privadas vía **signed URLs** de 60 segundos generadas por Server Action.

## Estructura de carpetas

Ver `README.md`. Resumen:

- `src/app/(auth)/` — login, signup, forgot/reset, callback, invite
- `src/app/(app)/c/[communityId]/` — todas las rutas con scope de comunidad
- `src/components/ui/` — primitives shadcn
- `src/components/layouts/` — sidebar, topbar, switcher, user menu
- `src/components/shared/` — KpiCard, StatusPill, AvatarGradient, RoleGate…
- `src/lib/supabase/` — server / browser / middleware / admin clients
- `src/lib/auth/` — getUser, requireUser, requireMember, requireRole
- `src/lib/validators/` — Zod schemas
- `src/actions/` — Server Actions (`issues.ts`)
- `src/providers/` — ThemeProvider, CommunityProvider
- `supabase/migrations/` — schema versionado
- `supabase/seed.sql` — comunidad demo
- `mockup-legacy/` — mockup HTML original como referencia

## Convenciones

- Archivos: `kebab-case.tsx`
- Componentes: `PascalCase`
- Hooks: `use-x.ts` / `useX`
- Server Actions: verbos imperativos en camelCase (`createIssue`, `commentIssue`)
- Tablas Postgres: `snake_case` plural (`issues`, `issue_comments`)
- Enums Postgres: `snake_case` singular (`issue_status`)
- Imports: alias `@/` para `src/`
