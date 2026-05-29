# Roadmap

## Fase 1 — Foundation + Incidencias end-to-end ✅ (este entregable)

- [x] Scaffolding Next.js 15 + TS + Tailwind + shadcn primitives
- [x] Supabase CLI setup, 6 migrations versionadas
- [x] Schema completo (todos los módulos modelados)
- [x] Helpers SQL para RLS
- [x] RLS habilitada + forzada en toda tabla, policies escritas
- [x] Storage buckets + policies
- [x] Seed de comunidad demo "Dr. Domagk 2" (21 vecinos, 8 incidencias, 5 comunicados, 3 votaciones, 12 budget entries, 10 documentos)
- [x] Auth: magic link + email/password, callback, signup, forgot/reset, invite
- [x] Middleware con session refresh y protección de rutas
- [x] Shell: sidebar, topbar, community switcher, user menu, dark mode
- [x] CommunityProvider + useCommunity + RoleGate
- [x] Módulo **Incidencias end-to-end**:
  - listado + filtros (estado, categoría, prioridad, búsqueda)
  - detalle con timeline + status pills
  - crear incidencia (Server Action + Zod)
  - comentar con chat Realtime (postgres_changes)
  - cambiar estado (gated por rol)
  - apoyar incidencia con `useOptimistic`
- [x] Dashboard real con KPIs (count queries contra Supabase)
- [x] Páginas placeholder para Comunicados, Votaciones, Directorio, Presupuesto, Documentos, Ajustes
- [x] Documentación: ARCHITECTURE, DATABASE, PERMISSIONS, SETUP, ROADMAP

## Fase 2 — Comunicados completo + adjuntos

- [ ] Crear comunicado (admin_finca)
- [ ] Detalle con marcado de leído
- [ ] Acuse de recibo (requires_ack) con IP y timestamp
- [ ] Email transaccional via Resend (Server Action)
- [ ] Filtros por tipo + buscador
- [ ] Adjuntos en incidencias (browser upload + registerAttachment + signed URLs)

## Fase 3 — Votaciones + Dashboard avanzado

- [ ] Crear votación (binary / multiple / budget)
- [ ] Casting de votos con bloqueo (`poll_votes` PK)
- [ ] Inquilino bloqueado para `type='budget'` (UI + Server Action + RLS)
- [ ] Barra de participación en tiempo real (Realtime sobre `poll_votes`)
- [ ] Resolución automática al `ends_at` (cron Vercel + Edge Function)
- [ ] Dashboard con gráficos (Recharts o nivo)

## Fase 4 — Directorio + Presupuesto + Documentos

- [ ] Directorio vista tabla (vecinos / cuotas / morosidad)
- [ ] Directorio vista plano (visualización por plantas)
- [ ] Presupuesto:
  - donut por categoría
  - serie temporal mensual
  - import CSV/Excel con validación Zod + parser
  - listado de movimientos
- [ ] Documentos:
  - upload a `documents` bucket
  - signed URLs de descarga via `/api/storage/sign`
  - filtrado por carpeta
  - búsqueda por nombre

## Fase 5 — Plataforma & SaaS

- [ ] Panel Superadmin (`/admin/*`):
  - listado de tenants (communities)
  - usuarios y memberships
  - gestión de planes
- [ ] Onboarding self-service:
  - crear comunidad
  - importar vecinos desde CSV
  - wizard de configuración
- [ ] Billing con Stripe (planes free/pro/enterprise)
- [ ] 2FA opcional
- [ ] Audit log (tabla `audit_events` + trigger generic)
- [ ] Notificaciones push (Service Worker + Web Push)
- [ ] i18n: catalán, gallego, euskera
- [ ] Integración con bancos (CSV import normalizado)
- [ ] App móvil (React Native, reutilizando Supabase JS client)

## Compromisos a largo plazo

- **Realtime selectivo**: nunca usarlo "porque sí". Cada canal cuesta. Aplicar solo donde la UX se rompe sin él.
- **Server Components por defecto**: cualquier nuevo módulo arranca como RSC; un Client Component se justifica explícitamente.
- **RLS como ley**: ningún acceso a datos debe depender únicamente del frontend. Cada nueva tabla pasa por las 3 capas de defensa (UI, Server Action, RLS).
- **Migrations versionadas**: nunca tocar el schema en producción a mano. Todo via `supabase migration new …`.
- **Tipos generados**: tras cualquier cambio de schema, `pnpm db:types` antes de hacer push.
