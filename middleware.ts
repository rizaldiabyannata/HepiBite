import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

// Protect specific API routes/methods:
// - /api/admins/* (all methods)
// - /api/categories/* (all methods)
// - /api/products/* (all methods except GET)
// - /api/orders (POST only)
// - /api/vouchers/* (all methods)
// Allow all /api/auth/*
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();

  const isApi = pathname.startsWith('/api/');
  const isAuthApi = pathname.startsWith('/api/auth');
  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/login';

  // Always allow auth API endpoints without checks
  if (isAuthApi) return NextResponse.next();

  // Create Supabase middleware client and response
  const { supabase, response } = await createClient(req);

  // IMPORTANT: You *must* call getUser() or getSession() here to ensure
  // the auth cookies are refreshed if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If hitting login page while authenticated -> redirect to dashboard
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  // Protect admin pages (SSR / RSC) - redirect to /login if not authenticated
  if (isAdminPage && !user) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname); // preserve intended destination
    return NextResponse.redirect(url);
  }

  // Non-API paths (other pages) -> allow
  if (!isApi) return response;

  // Decide if this API request should be protected
  const protectApi =
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/admins') ||
    pathname.startsWith('/api/categories') ||
    pathname.startsWith('/api/deliveries') ||
    pathname.startsWith('/api/vouchers') ||
    (pathname.startsWith('/api/products') && method !== 'GET')
    ;

  if (!protectApi) return response;

  if (!user) {
    // Return JSON for API unauthorized
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/login'],
};
