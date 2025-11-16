import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth callback route handler for Supabase OAuth flows.
 * This endpoint is called by Supabase after OAuth provider authentication.
 * It exchanges the auth code for a session and redirects to the intended destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        // In development, redirect to localhost
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // In production with forwarded host (e.g., Vercel)
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        // Fallback to origin
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
