# GestiónFinca (Shire)

Plataforma SaaS para comunidades de propietarios en España. Multitenant, con incidencias, votaciones, comunicados, directorio, presupuesto y documentos.

> **Estado**: Fase 1 — Foundation + módulo Incidencias end-to-end funcional contra Supabase real. Ver [docs/ROADMAP.md](docs/ROADMAP.md).

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
- **Hosting target**: Vercel

## Setup local en 5 pasos

```powershell
pnpm install
copy .env.example .env.local
pnpm db:start                     # arranca Supabase en Docker, imprime claves
# pega NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY en .env.local
pnpm db:seed-users; pnpm db:reset
pnpm db:types
pnpm dev
```

Abre http://localhost:3000 y entra con `miguel.fortes@dinagram.es` / `demo-Pass-1234`.

Detalle completo en [docs/SETUP.md](docs/SETUP.md).

## Documentación

| Documento | Qué contiene |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, capas, RSC vs CC, Server Actions, Realtime, state, storage. |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema completo, enums, triggers, helpers, índices. |
| [docs/PERMISSIONS.md](docs/PERMISSIONS.md) | Matriz Rol × Acción. Defensa en 3 capas. Helpers SQL. |
| [docs/SETUP.md](docs/SETUP.md) | Pasos exactos para arrancar local + troubleshooting. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Fases 1-5 con scope concreto por release. |
| [mockup-legacy/README.md](mockup-legacy/README.md) | El mockup HTML original, conservado como referencia visual. |

## Estructura del proyecto

```
.
├── src/
│   ├── app/                       # rutas Next.js (App Router)
│   │   ├── (auth)/                # login, signup, forgot/reset, callback, invite
│   │   ├── (app)/c/[communityId]/ # rutas con scope de comunidad
│   │   │   ├── dashboard/
│   │   │   ├── incidencias/       # módulo principal F1
│   │   │   ├── comunidados/
│   │   │   └── …
│   │   ├── onboarding/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    # primitives shadcn
│   │   ├── layouts/               # sidebar, topbar, switcher
│   │   └── shared/                # KpiCard, StatusPill, RoleGate, AvatarGradient
│   ├── lib/
│   │   ├── supabase/              # server / browser / middleware / admin clients
│   │   ├── auth/                  # getUser, requireUser, requireMember
│   │   ├── validators/            # Zod schemas
│   │   ├── permissions.ts         # canDo(role, action)
│   │   ├── constants.ts
│   │   ├── date.ts
│   │   └── utils.ts
│   ├── actions/                   # Server Actions
│   ├── providers/                 # ThemeProvider, CommunityProvider
│   └── types/database.ts          # tipos generados (`pnpm db:types`)
├── supabase/
│   ├── config.toml
│   ├── migrations/                # 0001 → 0006
│   └── seed.sql
├── scripts/
│   └── seed-users.ts              # crea auth.users demo
├── docs/                          # documentación técnica
├── mockup-legacy/                 # mockup HTML/CSS/JS original (referencia)
├── middleware.ts                  # auth + session refresh
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Comunidad demo

Tras `pnpm db:reset`:

- **Comunidad**: Dr. Domagk 2 (Madrid 28033)
- **Usuarios**: 21 (1 admin_finca, 2 junta, 16 propietarios, 2 inquilinos)
- **Password único**: `demo-Pass-1234`
- **Incidencias**: 8 (`INC-001` a `INC-008`) con comentarios y timeline
- **Comunicados**: 5
- **Votaciones**: 3 (1 activa, 2 cerradas)
- **Presupuesto**: 5 categorías × 6 entries/mes (2026)
- **Documentos**: 10 (placeholders sin PDF real)

## Convenciones rápidas

- **Server Components por defecto.** `'use client'` sólo cuando hay interacción inmediata o Realtime.
- **Server Actions** para mutaciones del usuario. Route Handlers para webhooks/callbacks.
- **RLS es ley.** Tres capas: RoleGate (UI) → `canDo()` en Server Action → policy en Postgres.
- **`community_id` denormalizado** en toda tabla hija.
- **Tipos**: regenera con `pnpm db:types` tras cada cambio de schema.

## Recordatorio importante

La carpeta del proyecto tiene actualmente el nombre `Gestión de finca` (con tilde). Si quieres evitar fricciones intermitentes con Supabase CLI y scripts en Windows, ciérrala en VSCode y renómbrala a `Gestion de finca` o `gestionfinca`:

```powershell
# desde una terminal fuera de la carpeta
Rename-Item "c:\Gestión de finca" "Gestion de finca"
```

Esto era el Paso 0 del plan pero requiere que VSCode no esté abierto sobre la carpeta.

## Contribuir

PRs y issues bienvenidos. Antes de enviar:

```powershell
pnpm type-check
pnpm lint
pnpm format
```
