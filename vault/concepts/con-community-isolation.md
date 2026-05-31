---
id: con_community_isolation
type: concept
name: Aislamiento Multi-tenant por community_id
path: null
description: >
  Patrón central de multi-tenancy. Cada comunidad es un tenant aislado.
  Implementado mediante community_id denormalizado en TODAS las tablas de dominio
  y RLS que filtra por community_id usando auth.uid().

parents:
  - id: sys_gestionfinca

children: []

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: con_rls
    type: implements
    weight: 1.0
  - target: sys_rbac
    type: uses
    weight: 0.8

tags:
  - multi-tenant
  - isolation
  - community_id
  - architecture
  - critical

state: active

implementation:
  - "Todas las tablas de dominio tienen columna community_id NOT NULL"
  - "RLS SELECT: WHERE is_member(community_id) — filtra por membresía activa"
  - "Routing: /c/[communityId]/ — communityId en URL y pasado a cada query"
  - "layout.tsx valida membership con requireMember(communityId) en cada request"
  - "CommunityProvider propaga communityId a Client Components vía React Context"
  - "Server Actions reciben communityId como primer parámetro — siempre"
---

# Aislamiento Multi-tenant

`community_id` denormalizado en cada tabla + RLS = imposible ver datos de otra comunidad.

## Conexiones

**Sistema:** [[gestionfinca]] · [[rbac]]
**Implementado por:** [[con-rls]]
**Todos los módulos:** [[incidencias]] · [[comunicados]] · [[votaciones]] · [[reservas]] · [[directorio]] · [[presupuesto]] · [[documentos]]
