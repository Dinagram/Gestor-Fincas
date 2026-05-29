# Permissions & RBAC

## Roles

| Rol | Alcance | Notas |
|---|---|---|
| `superadmin` | Plataforma | Acceso a todas las comunidades. Bypasea checks de rol específicos. |
| `admin_finca` | Una comunidad | Gestiona toda la finca. |
| `junta` | Una comunidad | Co-gestiona incidencias y decisiones. |
| `propietario` | Una comunidad | Participa, consulta y vota (incluido económico). |
| `inquilino` | Una comunidad | Acceso limitado. Puede crear incidencias y comentar. **NO vota económicamente.** |

Un usuario puede tener **roles distintos en comunidades distintas** — el rol se resuelve en `community_members` no en JWT claims.

## Defensa en 3 capas

```
[1] UI         → RoleGate, esconde botones según rol cliente
[2] Server     → canDo(role, action) dentro de Server Action
[3] Postgres   → RLS policy con helper is_admin_or_junta(...)
```

Saltarse [1] no abre nada porque [2] valida en el servidor. Saltarse [1] y [2] tampoco abre nada porque [3] es ley en la base de datos.

## Matriz Rol × Acción

| Acción                          | inquilino | propietario | junta | admin_finca |
|---------------------------------|:---------:|:-----------:|:-----:|:-----------:|
| Ver incidencias                 | ✅ | ✅ | ✅ | ✅ |
| Crear incidencia                | ✅ | ✅ | ✅ | ✅ |
| Comentar incidencia             | ✅ | ✅ | ✅ | ✅ |
| Cambiar estado de incidencia    | ❌ | ❌ | ✅ | ✅ |
| Borrar incidencia               | ❌ | ❌ | ❌ | ✅ |
| Apoyar incidencia ("me sumo")   | ✅ | ✅ | ✅ | ✅ |
| Ver comunicados                 | ✅ | ✅ | ✅ | ✅ |
| Crear comunicado                | ❌ | ❌ | ❌ | ✅ |
| Borrar comunicado               | ❌ | ❌ | ❌ | ✅ |
| Ver votaciones                  | ✅ | ✅ | ✅ | ✅ |
| Votar (binary / multiple)       | ✅ | ✅ | ✅ | ✅ |
| Votar (budget)                  | ❌ | ✅ | ✅ | ✅ |
| Crear votación                  | ❌ | ❌ | ✅ | ✅ |
| Invitar miembros                | ❌ | ❌ | ❌ | ✅ |
| Editar comunidad                | ❌ | ❌ | ❌ | ✅ |
| Subir documentos                | ❌ | ❌ | ✅ | ✅ |

Reflejado en código: `src/lib/permissions.ts` mantiene esta matriz como `POLICY: Record<Action, Role[]>`.

## Helpers SQL

```sql
-- ¿soy miembro activo de esta comunidad?
select public.is_member('<community_uuid>');

-- ¿tengo este rol exactamente?
select public.has_role('<community_uuid>', 'junta');

-- ¿soy admin_finca o junta? (la mayoría de gating administrativo)
select public.is_admin_or_junta('<community_uuid>');

-- ¿puedo votar polls de tipo budget?
select public.can_vote_economic('<community_uuid>');
```

Estas funciones son `STABLE SECURITY DEFINER` con `search_path = public`. Postgres las memoíza por sentencia, así que cuesta poco usarlas en todas las policies.

## Patrones de uso

### Cliente (UI gate)

```tsx
<RoleGate action="issue.change_status">
  <IssueStatusMenu issueId={id} current={status} />
</RoleGate>
```

### Server Action (rechazo si el cliente falsifica)

```ts
'use server';
const { role } = await getUserRole(communityId);
if (!canDo(role, 'issue.change_status')) {
  return { ok: false, error: 'Solo administrador o junta…' };
}
```

### Postgres RLS (cinturón final)

```sql
create policy issues_update on public.issues
  for update
  using (
    public.is_admin_or_junta(community_id)
    or (created_by = auth.uid() and status = 'abierta')
  );
```

## Storage

Path convention `{community_id}/{resource_type}/{resource_id}/{filename}` permite que la policy extraiga el `community_id` del primer segmento (`storage_community_id(name)`) y delegue en `is_member()` / `is_admin_or_junta()`.

```sql
create policy "doc_read" on storage.objects for select using (
  bucket_id = 'documents' and public.is_member(public.storage_community_id(name))
);
```

## Tests recomendados (Fase 2+)

Crear suite contra Supabase local:

```sql
-- Como propietario de comunidad A → no ve issues de comunidad B
set local "request.jwt.claims" = '{"sub": "<uuid-propietario-A>"}';
select * from issues where community_id = '<community-B-uuid>';  -- ⇒ 0 rows

-- Como inquilino → falla insert en poll_votes (budget)
set local "request.jwt.claims" = '{"sub": "<uuid-inquilino>"}';
insert into poll_votes (poll_id, profile_id, community_id, choice)
values ('<budget-poll>', '<uuid-inquilino>', '<community-uuid>', 'favor');
-- ⇒ ERROR new row violates row-level security policy
```
