---
id: con_rls
type: concept
name: Row Level Security (RLS)
path: null
description: >
  RLS de PostgreSQL es el mecanismo de seguridad principal del proyecto.
  FORCE ROW LEVEL SECURITY en TODAS las tablas garantiza aislamiento absoluto
  entre comunidades incluso si el código tiene bugs o se usa el admin client.

parents:
  - id: sys_supabase

children: []

relations:
  - target: sys_supabase
    type: part_of
    weight: 1.0
  - target: sys_gestionfinca
    type: uses
    weight: 1.0
  - target: sys_rbac
    type: uses
    weight: 0.9
  - target: dec_rls_force
    type: part_of
    weight: 1.0
  - target: con_community_isolation
    type: implements
    weight: 1.0

tags:
  - rls
  - security
  - postgres
  - multi-tenant
  - critical

state: active

helpers:
  - name: is_member(community_id)
    returns: boolean
    description: auth.uid() tiene membership activa en la comunidad
  - name: has_role(community_id, role)
    returns: boolean
    description: auth.uid() tiene exactamente ese rol
  - name: is_admin_or_junta(community_id)
    returns: boolean
    description: Shortcut para admin_finca OR junta
  - name: is_platform_admin()
    returns: boolean
    description: Verifica rol superadmin global

policy_pattern:
  select: "is_member(community_id) — todos los miembros ven"
  insert: "is_member(community_id) AND created_by = auth.uid()"
  update: "created_by = auth.uid() OR is_admin_or_junta(community_id)"
  delete: "has_role(community_id, 'admin_finca')"

notes:
  - >
    0005_rls_policies.sql tiene un loop que ENABLE+FORCE RLS en tablas existentes al correr.
    0007 (rooms, room_bookings, etc.) se creó después del loop → debe incluir
    ENABLE+FORCE explícitos y sus propias políticas.
  - >
    FORCE RLS significa que service_role (admin client) también respeta las políticas.
    Usar admin client solo para operaciones de plataforma que requieran bypass real.
---

# Row Level Security (RLS)

Contrato de seguridad multi-tenant. Tercera y más importante capa del enforcement RBAC.

## Conexiones

**Sistema:** [[supabase]] · [[gestionfinca]] · [[rbac]]
**Implementa:** [[con-community-isolation]]
**Decisión:** [[dec-rls-force]]
**Módulos protegidos:** [[incidencias]] · [[comunicados]] · [[votaciones]] · [[reservas]] · [[documentos]]
