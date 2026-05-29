-- =====================================================================
-- 0001 — Extensions, enums and utility functions
-- =====================================================================
-- All enums representing stable domain values. Adding a new value later
-- requires ALTER TYPE; assumed acceptable given the regulated nature of
-- the domain (Ley de Propiedad Horizontal).
-- =====================================================================

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";
create extension if not exists citext;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

create type public.member_role as enum (
  'superadmin',
  'admin_finca',
  'junta',
  'propietario',
  'inquilino'
);

create type public.member_status as enum ('active', 'invited', 'inactive');

create type public.unit_type as enum ('vivienda', 'local', 'garaje', 'trastero');

create type public.issue_category as enum (
  'ascensor',
  'fontaneria',
  'electricidad',
  'limpieza',
  'ruido',
  'seguridad',
  'jardineria',
  'obras',
  'otros'
);

create type public.issue_priority as enum ('baja', 'media', 'alta', 'urgente');

create type public.issue_status as enum (
  'abierta',
  'en_revision',
  'en_curso',
  'resuelta',
  'cerrada',
  'descartada'
);

create type public.poll_type as enum ('binary', 'multiple', 'budget');

create type public.poll_status as enum ('draft', 'active', 'closed', 'cancelled');

create type public.vote_choice as enum ('favor', 'contra', 'abstencion');

create type public.announcement_type as enum (
  'aviso',
  'convocatoria',
  'resolucion',
  'urgente'
);

create type public.document_folder as enum (
  'actas',
  'estatutos',
  'seguros',
  'contratos',
  'certificados',
  'otros'
);

create type public.budget_kind as enum ('presupuestado', 'ejecutado');

create type public.plan_tier as enum ('free', 'pro', 'enterprise');

-- ---------------------------------------------------------------------
-- Generic trigger: maintain updated_at
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
