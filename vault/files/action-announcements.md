---
id: file_action_announcements
type: file
name: actions/announcements.ts
path: src/actions/announcements.ts
description: >
  Server Actions del módulo Comunicados. Notable: markAnnouncementRead usa
  ignoreDuplicates=true (primera lectura gana), pero acknowledgeAnnouncement NO
  (siempre actualiza acknowledged_at). Comportamiento intencionalmente diferente.

parents:
  - id: mod_comunicados

children: []

relations:
  - target: mod_comunicados
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
  - announcements
  - upsert

state: active

exports:
  - name: createAnnouncement
    description: Solo admin_finca
  - name: markAnnouncementRead
    description: upsert con ignoreDuplicates=true — primera lectura gana, no sobrescribe
  - name: acknowledgeAnnouncement
    description: upsert SIN ignoreDuplicates — siempre actualiza acknowledged_at cuando el usuario confirma
  - name: deleteAnnouncement
    description: Solo admin_finca

notes:
  - >
    La diferencia entre markAnnouncementRead (ignoreDuplicates=true) y
    acknowledgeAnnouncement (ignoreDuplicates=false) es INTENCIONAL.
    No es un bug — son semánticas distintas.
---

# actions/announcements.ts

Server Actions para comunicados. Las dos variantes de upsert son intencionalmente diferentes.

## Conexiones

**Módulo:** [[comunicados]]
**Auth:** [[lib-get-user]] · [[lib-permissions]]
**Sistema:** [[supabase]]
**Flujo:** [[flow-mutation]]
**Consumer:** [[hook-form-transition]]
