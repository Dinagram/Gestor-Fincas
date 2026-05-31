---
id: file_action_polls
type: file
name: actions/polls.ts
path: src/actions/polls.ts
description: >
  Server Actions del módulo Votaciones. Incluye validación de período y quórum.
  castVote permite cambiar el voto (upsert). Inquilinos excluidos de budget polls.

parents:
  - id: mod_votaciones

children: []

relations:
  - target: mod_votaciones
    type: part_of
    weight: 1.0
  - target: file_lib_get_user
    type: uses
    weight: 1.0
  - target: file_lib_permissions
    type: uses
    weight: 1.0
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: flow_mutation
    type: implements
    weight: 0.9

tags:
  - server-action
  - polls
  - quorum

state: active

exports:
  - name: createPoll
    description: Junta/admin — crea en estado draft
  - name: activatePoll
    description: draft → active
  - name: castVote
    description: Cualquier miembro; upsert (permite cambiar voto); verifica período activo; inquilinos no votan budget
  - name: closePoll
    description: active → closed
  - name: cancelPoll
    description: any → cancelled
---

# actions/polls.ts

Server Actions para votaciones. `castVote` es upsert — los usuarios pueden cambiar su voto.

## Conexiones

**Módulo:** [[votaciones]]
**Auth:** [[lib-get-user]] · [[lib-permissions]]
**Sistema:** [[supabase]]
**Flujo:** [[flow-mutation]]
**Consumer:** [[hook-form-transition]]
