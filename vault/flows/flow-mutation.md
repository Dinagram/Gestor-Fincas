---
id: flow_mutation
type: flow
name: Patrón Universal de Mutación
path: null
description: >
  Flujo estándar que siguen TODOS los Server Actions del proyecto.
  Desde submit de formulario hasta revalidación del caché de Next.js.
  Implementado con useFormTransition hook en el lado cliente.

parents:
  - id: sys_gestionfinca

children: []

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 0.9
  - target: hook_form_transition
    type: implements
    weight: 0.9
  - target: file_lib_get_user
    type: uses
    weight: 1.0
  - target: file_lib_permissions
    type: uses
    weight: 1.0
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: dec_server_actions
    type: implements
    weight: 0.8

tags:
  - mutation
  - server-actions
  - pattern
  - zod
  - rbac
  - critical

state: active

steps:
  client_side:
    1: "Usuario interactúa con formulario (Client Component)"
    2: "handleSubmit llama useFormTransition.submit(data)"
    3: "startTransition → Server Action(communityId, data)"
  server_action:
    4: "Validación Zod (safeParse) → retorna error si inválido"
    5: "getUserRole(communityId) → obtiene user+role en try/catch → ERR_NO_ACCESS si falla"
    6: "canDo(role, 'action.name') → retorna error si sin permiso"
    7: "Lógica de negocio específica del módulo"
    8: "supabase.from('tabla').insert/update/delete"
    9: "revalidatePath('/c/<communityId>/...') → invalida caché Next.js"
    10: "retorna {ok: true, ...} o {ok: false, error: string}"
  client_resolution:
    11: "useFormTransition recibe result"
    12: "Si !result.ok → setError + toast.error"
    13: "Si result.ok → toast.success + onSuccess() o router.refresh()"
  rls_layer:
    note: "Capa 3 (RLS) se aplica implícitamente en paso 8 — Supabase filtra según políticas"

example_createIssue:
  form: NewIssueForm → useFormTransition(createIssue)
  steps:
    - createIssueSchema.safeParse(input)
    - getUserRole(communityId) → {user, role}
    - canDo(role, 'issue.create')
    - supabase.from('issues').insert({...}).select('id')
    - revalidatePath('/c/<id>/incidencias')
    - redirect('/c/<id>/incidencias/<newId>')
---

# Patrón Universal de Mutación

Flujo que siguen TODOS los Server Actions. Nodo crítico para entender la arquitectura de mutaciones.

## Conexiones

**Sistema:** [[gestionfinca]] · [[nextjs]] · [[supabase]]
**Implementado por:** [[hook-form-transition]]
**Auth:** [[lib-get-user]] · [[lib-permissions]]
**Actions:** [[action-issues]] · [[action-announcements]] · [[action-polls]] · [[action-bookings]]
**Decisión:** [[dec-server-actions]]
**Conceptos:** [[con-rls]] · [[con-community-isolation]]
