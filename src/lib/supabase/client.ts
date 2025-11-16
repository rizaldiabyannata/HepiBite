import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in Client Components and browser contexts.
 * This client is used for:
 * - Client-side authentication (login, logout, sign up)
 * - Real-time subscriptions
 * - Direct database queries from the browser
 * 
 * @returns A configured Supabase client instance for browser use
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
