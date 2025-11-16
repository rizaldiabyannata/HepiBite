import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signInWithPassword, signUp } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate an admin user
 *     description: |
 *       Authenticates an admin user with email and password.
 *       On success, it returns user details in the response body and sets an `auth_token` cookie for session management.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful. The auth cookie is set.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginSuccessResponse'
 *       '400':
 *         description: Bad request, invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized, invalid email or password.
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
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const { issues } = parsed.error;
      return NextResponse.json({ error: 'Invalid request', details: issues }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // First check if admin exists in database for role information
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Attempt to sign in with Supabase Auth
    try {
      const result = await signInWithPassword(email, password);

      return NextResponse.json({
        id: result.user?.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      });
    } catch (error: any) {
      // If Supabase auth fails, try to migrate the user
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('Email not confirmed')) {
        try {
          // User doesn't exist in Supabase, create them
          await signUp(email, password, {
            name: admin.name,
            role: admin.role
          });

          // Try signing in again after signup
          const result = await signInWithPassword(email, password);

          return NextResponse.json({
            id: result.user?.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            migrated: true
          });
        } catch (signUpError: any) {
          return NextResponse.json({ error: 'Failed to migrate user to Supabase Auth' }, { status: 500 });
        }
      }

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
