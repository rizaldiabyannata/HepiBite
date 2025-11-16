import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
};

// Get current authenticated user from Supabase session
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return null;
    }

    return extractUserFromSession(session);
  } catch {
    return null;
  }
}

// Extract user information from Supabase session
function extractUserFromSession(session: Session): AuthUser {
  const user = session.user;
  const role = (user.user_metadata?.role as 'ADMIN' | 'SUPER_ADMIN') || 'ADMIN';

  return {
    id: user.id,
    email: user.email!,
    role
  };
}

// Sign in with email and password
export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return {
    user: data.user ? extractUserFromSession(data.session!) : null,
    session: data.session
  };
}

// Sign up new user
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) throw error;

  return {
    user: data.user && data.session ? extractUserFromSession(data.session) : null,
    session: data.session
  };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// Update user metadata
export async function updateUser(updates: { data?: Record<string, any> }) {
  const { data, error } = await supabase.auth.updateUser(updates);
  if (error) throw error;
  return data;
}

// Verify user authentication using Supabase session
export async function verifyToken(token?: string): Promise<AuthUser | null> {
  // If token provided, try to set it as session (for backward compatibility)
  if (token) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: '' // Refresh token not available in old format
      });
      if (!error && data.session) {
        const user = data.session.user;
        const role = (user.user_metadata?.role as 'ADMIN' | 'SUPER_ADMIN') || 'ADMIN';
        return {
          id: user.id,
          email: user.email!,
          role
        };
      }
    } catch {
      // Fall back to current session
    }
  }

  return getCurrentUser();
}

// Sign token (for backward compatibility - returns access token)
export async function signToken(payload: AuthUser, expiresIn = '7d'): Promise<string> {
  // This is kept for backward compatibility during migration
  // In full Supabase implementation, this won't be needed
  return `supabase-auth-${payload.id}`;
}

// Set auth cookie (Supabase handles this automatically)
export function setAuthCookieOnResponse(res: any, token: string) {
  // Supabase handles session cookies automatically
  // This is kept for backward compatibility
}

// Clear auth cookies by signing out from Supabase
export async function clearAuthCookieOnResponse(res: any) {
  await supabase.auth.signOut();
}

export async function getAuthCookie(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

// Legacy function for backward compatibility
export function parseExpiry(input: string): number {
  const match = input.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60;
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
  }
  return 7 * 24 * 60 * 60;
}

// Legacy constants for backward compatibility
export const AUTH_COOKIE_NAME = 'sb-access-token'; // Supabase's cookie name
