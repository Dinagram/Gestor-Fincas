---
id: file_action_issues
type: file
name: actions/issues.ts
path: src/actions/issues.ts
description: >
  Server Actions del módulo Incidencias. Usa getUserRole() importado de get-user.ts
  (extraído en la refactorización). Incluye gestión de adjuntos con signed URLs.

parents:
  - id: mod_incidencias

children: []

relations:
  - target: mod_incidencias
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
  - issues
  - attachments

state: active

exports:
  - name: createIssue
    description: Crea incidencia y llama redirect() internamente al tener éxito
  - name: commentIssue
    description: Añade comentario al chat
  - name: changeIssueStatus
    description: Gateado por canDo('issue.change_status'); trigger DB log automático
  - name: toggleIssueSupport
    description: Alterna voto de apoyo del usuario en la incidencia
  - name: signAttachmentUrl
    description: Genera signed URL de 60s para descarga segura de adjunto
  - name: registerAttachment
    description: Registra en BD tras upload directo browser → Supabase Storage
---

# actions/issues.ts

Server Actions para incidencias. `createIssue` usa `redirect()` internamente al crear con éxito.

## Conexiones

**Módulo:** [[incidencias]]
**Auth:** [[lib-get-user]] · [[lib-permissions]]
**Sistema:** [[supabase]]
**Flujo:** [[flow-mutation]]
**Consumer:** [[hook-form-transition]]
