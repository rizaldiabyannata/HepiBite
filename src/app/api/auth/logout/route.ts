import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { signOut } from '@/lib/auth';

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out an admin user
 *     description: |
 *       Logs out the current user by clearing the Supabase session.
 *       This endpoint does not require a request body.
 *     tags:
 *       - Authentication
 *     responses:
 *       '200':
 *         description: Logout successful. The session is cleared.
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase logout error:', error);
      return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
