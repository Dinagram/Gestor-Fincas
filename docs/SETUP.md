# Setup local

## Pre-requisitos

- **Node.js ≥ 20**
- **pnpm** (`corepack enable pnpm`) o npm
- **Docker Desktop** (para Supabase local)
- **Supabase CLI** (`npm i -g supabase` o `pnpm dlx supabase`)

## Pasos (≈ 5 minutos)

### 1. Instalar dependencias

```powershell
pnpm install
```

### 2. Configurar variables de entorno

```powershell
copy .env.example .env.local
```

### 3. Levantar Supabase local

```powershell
pnpm db:start
```

Esto arranca el stack completo (Postgres, GoTrue, Realtime, Storage, Studio, Inbucket) en Docker. La primera vez tarda un par de minutos descargando imágenes.

Al finalizar, la CLI imprime varias URLs y keys. **Copia el `anon key` y el `service_role key`** y pégalos en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<el-anon-key-impreso>
SUPABASE_SERVICE_ROLE_KEY=<el-service_role-key-impreso>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Servicios locales:
| Servicio | URL |
|---|---|
| API Postgres + GoTrue + Storage | http://127.0.0.1:54321 |
| Studio (UI de BD) | http://127.0.0.1:54323 |
| Inbucket (correos de test) | http://127.0.0.1:54324 |
| Postgres directo | localhost:54322 (user `postgres`, pass `postgres`) |

### 4. Bootstrap completo de la BD

La primera vez:

```powershell
pnpm db:setup
```

Este comando combinado ejecuta:
1. `db:reset` — aplica las 6 migrations (incluido el trigger `on_auth_user_created`). El seed corre pero los inserts dependientes de `auth.users` se saltan (los users aún no existen).
2. `db:seed-users` — crea 21 usuarios en `auth.users` con password `demo-Pass-1234`. El trigger rellena `public.profiles` automáticamente.
3. `db:reset` (segundo) — vuelve a correr seed.sql. Esta vez los `auth.users` ya existen y el seed completa todos los datos (comunidad, units, members, issues, comments, polls, announcements, budget, documents).

> **¿Por qué dos resets?** El seed.sql contiene inserts (community_members, issues, etc.) cuya FK apunta a `profiles`, que a su vez apunta a `auth.users`. Hasta que los users existen, esos inserts se saltan silenciosamente. `supabase db reset` no borra `auth.users` (viven en otro schema), así que el segundo reset corre con el contexto correcto.

Si necesitas re-sincronizar más tarde, basta con `pnpm db:reset`.

### 5. Generar tipos TypeScript

```powershell
pnpm db:types
```

Sobrescribe `src/types/database.ts` con tipos completos derivados del schema actual.

### 6. Arrancar la app

```powershell
pnpm dev
```

Abre http://localhost:3000.

Entra con cualquiera de los emails seed (por ejemplo `miguel.fortes@dinagram.es`) y contraseña `demo-Pass-1234`, o pide un magic link y revísalo en Inbucket (http://127.0.0.1:54324).

## Comandos útiles

```powershell
pnpm dev                  # Next.js dev server
pnpm build                # production build
pnpm lint                 # ESLint
pnpm type-check           # TypeScript estricto sin emitir
pnpm format               # Prettier sobre todo el repo

pnpm db:start             # arranca Supabase local (Docker)
pnpm db:stop              # apaga el stack
pnpm db:status            # estado de los contenedores
pnpm db:reset             # drop + migrations + seed
pnpm db:migrate           # aplica migrations pendientes (sin drop)
pnpm db:types             # regenera src/types/database.ts
pnpm db:diff              # genera migration diff entre schema actual y migrations
pnpm db:seed-users        # crea/actualiza los 21 usuarios demo
```

## Verificación rápida

Pasos en orden tras un setup limpio:

- [ ] `pnpm db:start` arranca sin errores
- [ ] `pnpm db:seed-users` crea 21 usuarios
- [ ] `pnpm db:reset` aplica las 6 migrations y el seed (8 issues, 5 announcements, 3 polls…)
- [ ] Supabase Studio (`http://127.0.0.1:54323`) muestra las tablas con datos
- [ ] `pnpm type-check` pasa sin errores tras regenerar tipos (`pnpm db:types`)
- [ ] `pnpm dev` arranca en `http://localhost:3000`
- [ ] Login con `miguel.fortes@dinagram.es` / `demo-Pass-1234` redirige a `/c/<id>/dashboard`
- [ ] Listado de incidencias muestra `INC-001..INC-008`
- [ ] Detalle de incidencia muestra chat + timeline + soporte
- [ ] Crear nueva incidencia → genera `INC-009`
- [ ] Comentar en una incidencia mientras está abierta en otro navegador → aparece vía Realtime

## Troubleshooting

**`db:start` falla con "port already in use"**: ejecuta `pnpm db:stop` y reintenta. Si persiste, hay otro Supabase en marcha — `docker ps` y para los contenedores `supabase_*`.

**Magic link no llega**: revísalo en Inbucket (http://127.0.0.1:54324). Local-only, no envía a correos reales.

**Type-check falla**: corre `pnpm db:types` después de `db:reset` para que `src/types/database.ts` refleje el schema actual.

**RLS error en operaciones**: comprueba en Studio que el usuario existe en `community_members` con `status='active'` para esa comunidad. Si no, ejecuta `pnpm db:seed-users` y `pnpm db:reset`.
