import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr';

import type { Database } from '@/types/database';

/**
 * Supabase client for use in Server Components, Server Actions, Route Handlers.
 * Reads/writes auth cookies via next/headers so the session stays in sync.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component → set() throws. Safe to ignore
            // because middleware refreshes the session.
          }
        },
      },
    },
  );
}
