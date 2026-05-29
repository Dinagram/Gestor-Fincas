/**
 * Seed users in auth.users using the Supabase admin client.
 * Runs against the LOCAL Supabase stack (NEXT_PUBLIC_SUPABASE_URL).
 * Idempotent: tries to update if the user already exists.
 *
 * Usage:
 *   pnpm db:seed-users
 *
 * Run BEFORE supabase/seed.sql (which references these UUIDs in profiles
 * via the on_auth_user_created trigger; profiles get created automatically
 * with empty full_name and the seed.sql then upserts the friendly names).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type SeedUser = {
  id: string;
  email: string;
  full_name: string;
  password: string;
};

// Stable UUIDs make seed.sql deterministic across resets.
const USERS: SeedUser[] = [
  { id: 'aaaa0001-0000-0000-0000-000000000001', email: 'miguel.fortes@dinagram.es',     full_name: 'Miguel Fortes',          password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000002', email: 'admin@dr-domagk-2.com',         full_name: 'Carlos Ruiz Vázquez',    password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000003', email: 'maria.garcia@example.com',       full_name: 'María García López',     password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000004', email: 'pedro.fernandez@example.com',    full_name: 'Pedro Fernández Soto',   password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000005', email: 'beatriz.romero@example.com',     full_name: 'Beatriz Romero Díaz',    password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000006', email: 'juan.martinez@example.com',      full_name: 'Juan Martínez Ruiz',     password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000007', email: 'isabel.sanchez@example.com',     full_name: 'Isabel Sánchez Moreno',  password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000008', email: 'antonio.lopez@example.com',      full_name: 'Antonio López Gil',      password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000009', email: 'carmen.diaz@example.com',        full_name: 'Carmen Díaz Castillo',   password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000010', email: 'francisco.gomez@example.com',    full_name: 'Francisco Gómez Ortega', password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000011', email: 'lucia.jimenez@example.com',      full_name: 'Lucía Jiménez Romero',   password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000012', email: 'david.alvarez@example.com',      full_name: 'David Álvarez Núñez',    password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000013', email: 'pilar.molina@example.com',       full_name: 'Pilar Molina Vargas',    password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000014', email: 'javier.serrano@example.com',     full_name: 'Javier Serrano Pardo',   password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000015', email: 'elena.castro@example.com',       full_name: 'Elena Castro Hidalgo',   password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000016', email: 'manuel.ortiz@example.com',       full_name: 'Manuel Ortiz Lara',      password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000017', email: 'rosa.delgado@example.com',       full_name: 'Rosa Delgado Marín',     password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000018', email: 'sergio.iglesias@example.com',    full_name: 'Sergio Iglesias Pena',   password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000019', email: 'monica.parra@example.com',       full_name: 'Mónica Parra Bravo',     password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000020', email: 'inquilino1@example.com',         full_name: 'Andrea Vidal Cano',      password: 'demo-Pass-1234' },
  { id: 'aaaa0001-0000-0000-0000-000000000021', email: 'inquilino2@example.com',         full_name: 'Raúl Méndez Sanz',       password: 'demo-Pass-1234' },
];

async function ensureUser(u: SeedUser) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    user_id: u.id,
    email_confirm: true,
    user_metadata: { full_name: u.full_name },
  } as Parameters<typeof admin.auth.admin.createUser>[0] & { user_id: string });

  if (error) {
    if (error.message.includes('already') || error.status === 422) {
      // Already exists — update password and metadata to keep deterministic.
      const { error: upErr } = await admin.auth.admin.updateUserById(u.id, {
        password: u.password,
        email: u.email,
        user_metadata: { full_name: u.full_name },
        email_confirm: true,
      });
      if (upErr) throw upErr;
      console.log(`↻ updated ${u.email}`);
      return;
    }
    throw error;
  }
  console.log(`+ created ${u.email} (id=${data.user?.id})`);
}

async function main() {
  console.log(`Seeding ${USERS.length} users into ${SUPABASE_URL}...`);
  for (const u of USERS) {
    try {
      await ensureUser(u);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`✗ ${u.email}: ${msg}`);
      process.exitCode = 1;
    }
  }
  console.log('Done.');
}

main();
