---
id: dec_rls_force
type: decision
name: FORCE ROW LEVEL SECURITY en todas las tablas
path: null
description: >
  FORCE RLS en lugar de solo ENABLE RLS. La diferencia: FORCE aplica las políticas
  incluso al service_role (admin), garantizando aislamiento total aunque el código
  use accidentalmente el admin client.

parents:
  - id: sys_supabase

children: []

relations:
  - target: con_rls
    type: part_of
    weight: 1.0
  - target: sys_supabase
    type: configures
    weight: 1.0

tags:
  - decision
  - security
  - rls
  - postgres
  - multi-tenant

state: active

rationale: >
  En un SaaS multi-tenant, la mezcla accidental de datos entre comunidades es el riesgo
  de seguridad más grave. FORCE RLS crea una red de seguridad que funciona aunque
  el código tenga bugs o se use el admin client.

tradeoffs:
  pro: Seguridad máxima — imposible filtrar datos de otra comunidad via service_role
  con: Operaciones de plataforma (superadmin) requieren SET ROLE o bypass explícito
---

# FORCE ROW LEVEL SECURITY

Decisión de usar FORCE en lugar de ENABLE para máxima seguridad multi-tenant.

## Conexiones

**Concepto:** [[con-rls]]
**Sistema:** [[supabase]]
**Referenciado en:** [[con-community-isolation]]
