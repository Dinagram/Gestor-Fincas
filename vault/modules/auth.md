---
id: mod_auth
type: module
name: Módulo Autenticación
path: src/app/(auth)/
description: >
  Login, signup, forgot-password, reset-password, invite token, callback.
  Supabase Auth con sesión vía cookies httpOnly (SSR-safe). Solo email/password.

parents:
  - id: sys_gestionfinca

children:
  - id: file_lib_require_user

relations:
  - target: sys_gestionfinca
    type: part_of
    weight: 1.0
  - target: sys_supabase
    type: uses
    weight: 1.0
  - target: file_middleware
    type: uses
    weight: 1.0
  - target: file_lib_get_user
    type: uses
    weight: 0.9
  - target: file_lib_require_user
    type: uses
    weight: 1.0
  - target: flow_auth
    type: implements
    weight: 1.0

tags:
  - auth
  - login
  - session
  - invite
  - cookies

state: active

pages:
  - login/page.tsx — LoginForm client component
  - signup/page.tsx — SignupForm
  - forgot-password/page.tsx
  - reset-password/page.tsx
  - callback/route.ts — OAuth/magic link handler (redirige a app)
  - invite/[token]/page.tsx — AcceptInviteForm
---

# Módulo Autenticación

Gestiona toda la identidad y sesión del usuario. Usa Supabase Auth con cookies httpOnly para que las sesiones sean seguras en SSR. Los usuarios se crean vía signup o invitación de admin. No hay login social ni SSO — solo email/password.

---

## Páginas

### `login/page.tsx` — Inicio de sesión
El `LoginForm` (client) tiene dos campos: email y contraseña. Al hacer submit llama a `supabase.auth.signInWithPassword()`. En error muestra toast con el mensaje de Supabase (credenciales incorrectas, email no verificado, etc.). En éxito, el callback de Supabase setea cookies httpOnly y el router navega al dashboard de la última comunidad activa del usuario.

Si el usuario ya tiene sesión activa, el middleware lo redirige automáticamente al app — nunca llega a ver el login.

---

### `signup/page.tsx` — Registro
El `SignupForm` tiene: email, contraseña, confirmación de contraseña y nombre completo. Llama a `supabase.auth.signUp()` con metadata `full_name`. Un trigger PostgreSQL crea automáticamente el row en la tabla `profiles` cuando se crea el usuario en `auth.users`.

En el entorno local, `enable_confirmations = false` en `config.toml` — el usuario queda activo inmediatamente sin verificar el email. En producción esto debería activarse.

---

### `forgot-password/page.tsx` — Recuperación de contraseña
Formulario con solo el campo email. Llama a `supabase.auth.resetPasswordForEmail()`. Supabase envía un email con un magic link que lleva a `/reset-password`. En el entorno local el email llega a Mailpit (`http://127.0.0.1:54324`).

---

### `reset-password/page.tsx` — Nueva contraseña
El usuario llega aquí desde el email de recuperación. El magic link trae tokens en la URL que el callback route procesa. El formulario tiene nueva contraseña y confirmación. Llama a `supabase.auth.updateUser({ password })`.

---

### `callback/route.ts` — Exchange de tokens
Route Handler (no Page) que procesa el intercambio de `code` por `session`. Supabase redirige aquí tras: login social (si se añadiera), magic links, invitaciones. Llama a `supabase.auth.exchangeCodeForSession(code)` y redirige al usuario al app o al `redirect` param si existe.

---

### `invite/[token]/page.tsx` — Aceptar invitación
El admin genera invitaciones desde el módulo de Directorio o Configuración. El vecino invitado recibe un email con un token. Esta página muestra el `AcceptInviteForm`: el email aparece pre-rellenado (de la invitación), el vecino solo crea su contraseña. Al confirmar, se activa su cuenta y queda vinculado a la comunidad.

---

## Flujo de sesión (SSR-safe)

La sesión vive en cookies httpOnly — nunca expuesta a JavaScript del browser. En cada request, el [[middleware]] llama a `updateSession()` que:
1. Lee la cookie de sesión.
2. Si el JWT está próximo a expirar, llama silenciosamente a Supabase para renovarlo.
3. Actualiza la cookie con los nuevos tokens.
4. Si no hay sesión válida → redirect a `/login`.

Esto garantiza que los Server Components siempre reciben una sesión fresca sin hacer nada especial.

---

## Archivos clave

- **[[middleware]]** — Primera barrera. Refresca tokens y redirige a /login si no hay sesión.
- **[[lib-require-user]]** — Guards usados al inicio de cada página protegida.
- **[[lib-get-user]]** — Helpers para obtener user, profile y memberships desde Server Components y Actions.

---

## Conexiones

**Sistema:** [[gestionfinca]] · [[supabase]]
**Archivos:** [[middleware]] · [[lib-get-user]] · [[lib-require-user]]
**Flujo:** [[flow-auth]]
