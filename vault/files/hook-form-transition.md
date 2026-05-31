---
id: hook_form_transition
type: file
name: hooks/use-form-transition.ts
path: src/hooks/use-form-transition.ts
description: >
  Hook React que encapsula el patrón repetido en todos los formularios de mutación:
  startTransition + Server Action + toast error/éxito + onSuccess/refresh.
  Antes de la refactorización, este bloque estaba copiado en 5 formularios.

parents:
  - id: sys_gestionfinca

children: []

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 0.7
  - target: dec_refactoring
    type: part_of
    weight: 0.8
  - target: mod_incidencias
    type: uses
    weight: 0.7
  - target: mod_comunicados
    type: uses
    weight: 0.7
  - target: mod_votaciones
    type: uses
    weight: 0.7
  - target: mod_reservas
    type: uses
    weight: 0.7

tags:
  - hook
  - form
  - client-only
  - shared
  - dry
  - use-transition

state: active

exports:
  - name: useFormTransition
    kind: function
    signature: "useFormTransition<T>(action, options?) → {submit, error, setError, pending}"
    description: >
      action: Server Action que retorna {ok, error?} o undefined (redirects internos).
      options.successMessage: toast de éxito.
      options.onSuccess: callback post-éxito (router.push, cerrar diálogo, etc.).
      Si no hay onSuccess, llama router.refresh() automáticamente.
      Maneja redirect() interno del Server Action (result === undefined).

consumers:
  - new-issue-form.tsx — createIssue llama redirect() internamente al éxito
  - new-announcement-form.tsx — wraps action para router.push con result.id
  - new-poll-form.tsx — wraps action para router.push con result.id
  - event-form.tsx — reset de campos en onSuccess
  - block-form.tsx — reset de campos en onSuccess
---

# hooks/use-form-transition.ts

Hook compartido para formularios de mutación. Elimina 5 copias del mismo patrón `startTransition`.

## Conexiones

**Sistema:** [[gestionfinca]]
**Consumidores:** [[incidencias]] · [[comunicados]] · [[votaciones]] · [[reservas]]
**Actions que se pasan como argumento:** [[action-issues]] · [[action-announcements]] · [[action-polls]] · [[action-bookings]]
**Historial:** [[dec-refactoring]]
