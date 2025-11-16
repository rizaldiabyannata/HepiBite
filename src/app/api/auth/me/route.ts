import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current user details
 *     description: |
 *       Retrieves the details of the currently authenticated admin user from Supabase session.
 *       This is a protected endpoint.
 *     tags:
 *       - Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: The details of the current user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginSuccessResponse'
 *       '401':
 *         description: Unauthorized, authentication session is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
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
        },
      }
    );

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const role = (user.user_metadata?.role as 'ADMIN' | 'SUPER_ADMIN') || 'ADMIN';
    const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Admin';

    return NextResponse.json({
      id: user.id,
      name,
      email: user.email,
      role
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch current user' }, { status: 500 });
  }
}
