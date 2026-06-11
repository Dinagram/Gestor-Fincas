-- =====================================================================
-- Bootstrap Superadmin
-- =====================================================================
-- Script operacional para crear el primer superadministrador.
-- NO es una migración — ejecútalo manualmente desde el SQL editor
-- de Supabase Dashboard o con psql.
--
-- Requisitos previos:
--   1. El usuario debe haber aceptado una invitación normal (con cualquier
--      rol) o haber sido añadido de otra forma → su email existe en
--      auth.users y en public.profiles.
--   2. Debe existir al menos una comunidad en la tabla communities.
--
-- El rol superadmin en community_members.role permite al usuario:
--   · Bypass de todas las políticas RLS (is_platform_admin() = true)
--   · Acceso a todas las comunidades
--   · Asignar cualquier rol (solo mediante este script o SQL directo)
-- =====================================================================

-- PASO 1: Encuentra el profile_id del usuario que será superadmin.
-- SELECT id, email FROM public.profiles WHERE email = 'admin@tudominio.es';

-- PASO 2: Encuentra (o anota) la community_id a la que lo asociarás.
-- SELECT id, name FROM public.communities;

-- PASO 3: Inserta o actualiza el registro de community_members.
-- Sustituye los valores de ejemplo por los UUIDs reales.

-- ⚠️  SUSTITUYE ESTOS VALORES ANTES DE EJECUTAR ⚠️
DO $$
DECLARE
  v_profile_id  uuid := '00000000-0000-0000-0000-000000000000'; -- ← UUID del perfil
  v_community_id uuid := '00000000-0000-0000-0000-000000000000'; -- ← UUID de la comunidad
BEGIN
  INSERT INTO public.community_members (
    community_id,
    profile_id,
    role,
    status,
    joined_at
  )
  VALUES (
    v_community_id,
    v_profile_id,
    'superadmin',
    'active',
    now()
  )
  ON CONFLICT (community_id, profile_id, unit_id)
  DO UPDATE SET
    role      = 'superadmin',
    status    = 'active';

  RAISE NOTICE 'Superadmin asignado correctamente para profile_id=%', v_profile_id;
END $$;

-- VERIFICACIÓN — ejecuta esto después para confirmar:
-- SELECT cm.role, cm.status, p.email
--   FROM public.community_members cm
--   JOIN public.profiles p ON p.id = cm.profile_id
--  WHERE cm.role = 'superadmin'
--  ORDER BY cm.joined_at;
