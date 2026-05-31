'use client';

import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

/**
 * Supabase client for Client Components and browser-side Realtime.
 * Safe to use the singleton pattern: re-renders won't create new clients.
 */
let client: ReturnType<typeof createSSRBrowserClient<Database, 'public'>> | undefined;

export function createBrowserClient() {
  if (client) return client;
  client = createSSRBrowserClient<Database, 'public'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return client;
}
