# Supabase Authentication Integration

## 📋 Overview

Project ini sekarang menggunakan **Supabase Authentication** sebagai sistem auth utama menggantikan JWT manual. Supabase menyediakan:

- ✅ Session management otomatis dengan refresh tokens
- ✅ Secure cookie handling
- ✅ OAuth providers support (Google, GitHub, dll)
- ✅ Email confirmation & password reset
- ✅ Row Level Security (RLS) untuk database
- ✅ User metadata & roles

## 🚀 Setup Instructions

### 1. Create Supabase Project

1. Pergi ke [supabase.com](https://supabase.com)
2. Buat project baru atau gunakan existing
3. Dari project dashboard, ambil credentials:
   - `Project URL` → untuk `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → untuk `SUPABASE_SERVICE_ROLE_KEY`

### 2. Environment Variables

Update file `.env` dengan credentials Supabase:

```bash
# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Setup

Jika menggunakan Supabase PostgreSQL:

```bash
# Update DATABASE_URL di .env
DATABASE_URL=postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

# Jalankan migrations
npm run prisma:migrate
```

### 4. Migrate Existing Admins

Jika sudah ada admin di database lokal, migrate ke Supabase Auth:

```bash
npm run migrate:admins
```

Script ini akan:

- Membaca semua admin dari Prisma database
- Membuat user di Supabase Auth dengan temporary password
- Menyimpan metadata (name, role, prisma_id)
- Menampilkan temporary passwords untuk setiap admin

**⚠️ PENTING:** Simpan temporary passwords yang ditampilkan!

### 5. Create First Admin Manually (Optional)

Jika ingin membuat admin baru langsung di Supabase:

1. Buka Supabase Dashboard → Authentication → Users
2. Klik "Add User"
3. Masukkan email & password
4. Confirm email automatically
5. Tambahkan metadata di tab "User Metadata":
   ```json
   {
     "name": "Admin Name",
     "role": "SUPER_ADMIN"
   }
   ```

## 🏗️ Architecture

### File Structure

```
src/
├── lib/
│   └── supabase/
│       ├── client.ts      # Client-side Supabase (Client Components)
│       ├── server.ts      # Server-side Supabase (Server Components, API Routes)
│       └── middleware.ts  # Middleware Supabase (untuk auth checks)
├── app/
│   └── api/
│       └── auth/
│           └── callback/  # OAuth callback handler
└── components/
    ├── login-form.tsx     # Login dengan Supabase
    └── nav-user.tsx       # Logout dengan Supabase
```

### Authentication Flow

#### Login Flow

1. User submit email/password di `login-form.tsx`
2. Client memanggil `supabase.auth.signInWithPassword()`
3. Supabase set auth cookies otomatis
4. Middleware verify session dan redirect ke dashboard
5. Admin layout fetch user data dari Supabase

#### Protected Routes

1. Middleware intercept request ke `/admin/*`
2. Call `supabase.auth.getUser()` untuk verify & refresh session
3. Check user metadata untuk role (ADMIN/SUPER_ADMIN)
4. Allow atau redirect ke `/login`

#### Logout Flow

1. User klik logout di `nav-user.tsx`
2. Client memanggil `supabase.auth.signOut()`
3. Supabase clear auth cookies
4. Redirect ke `/login`

## 🔐 User Roles & Metadata

User metadata disimpan di Supabase Auth:

```typescript
{
  name: string;           // Display name
  role: "ADMIN" | "SUPER_ADMIN";
  prisma_id?: string;     // Reference ke Prisma admin.id (jika migrasi)
  migrated_from_prisma?: boolean;
  avatar_url?: string;
}
```

### Access Role in Code

**Server Component:**

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
const role = user?.user_metadata?.role; // "ADMIN" | "SUPER_ADMIN"
```

**Client Component:**

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
const role = user?.user_metadata?.role;
```

## 🧪 Testing

### Test Login

1. Jalankan dev server: `npm run dev`
2. Buka `http://localhost:3000/login`
3. Gunakan credentials:
   - Email dari Supabase user
   - Password yang di-set saat create user

### Test Protected Routes

1. Akses `http://localhost:3000/admin/dashboard` tanpa login
2. Should redirect ke `/login?next=/admin/dashboard`
3. Login, then redirect kembali ke dashboard

### Test Session Refresh

1. Login dan biarkan idle 10+ menit
2. Refresh page atau navigate
3. Middleware akan auto-refresh session
4. User tetap logged in

### Test Logout

1. Klik avatar di sidebar
2. Klik "Log out"
3. Should redirect ke `/login`
4. Coba akses admin page → redirect kembali

## 🔄 Migration Path

Jika sudah ada sistem auth JWT lama:

1. ✅ Setup Supabase (langkah 1-3)
2. ✅ Migrate existing admins (langkah 4)
3. ⚠️ **Parallel run** - both auth systems work
4. 🧪 Test Supabase auth thoroughly
5. 🗑️ Remove old JWT auth code:
   - Delete `src/lib/auth.ts` (JWT functions)
   - Delete old `/api/auth/login` & `/api/auth/logout` routes
   - Remove `AUTH_SECRET` from .env

## 🚨 Security Notes

### Service Role Key

- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Only use in server-side code (API routes, Server Components)
- Store in `.env` (not `.env.example`)

### Anon Key

- Safe to expose `NEXT_PUBLIC_SUPABASE_ANON_KEY` to client
- RLS policies protect data even with anon key

### Cookie Security

- Supabase uses `HttpOnly` cookies automatically
- Cookies are signed & encrypted
- Auto-refresh before expiration

## 📚 Additional Features

### Email Confirmation (Optional)

Enable di Supabase Dashboard → Authentication → Settings:

```
Email Confirm: Enabled
```

Update signup flow:

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${location.origin}/api/auth/callback`,
  },
});
```

### OAuth Providers (Optional)

Enable provider di Supabase Dashboard → Authentication → Providers:

- Google
- GitHub
- Azure
- etc.

Add login button:

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${location.origin}/api/auth/callback`,
  },
});
```

### Password Reset

```typescript
// Request reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${location.origin}/reset-password`,
});

// Update password
await supabase.auth.updateUser({
  password: newPassword,
});
```

## 🐛 Troubleshooting

### "User not authenticated"

- Check cookies are being set (DevTools → Application → Cookies)
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check middleware matcher includes the route

### "Invalid credentials"

- Verify user exists in Supabase Dashboard
- Check user metadata has `role` field
- Password might need reset

### Session not refreshing

- Ensure middleware calls `supabase.auth.getUser()` (not `getSession()`)
- Check middleware matcher includes all protected routes
- Verify no logic between `createClient()` and `getUser()`

### CORS errors

- Check Supabase project URL is correct
- Verify site URL in Supabase Dashboard → Authentication → URL Configuration

## 📖 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router + Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

## ✅ Checklist

- [x] Supabase project created
- [x] Environment variables set
- [x] Database connected (optional)
- [x] Migration script ready
- [x] Client utilities created
- [x] Middleware updated
- [x] Login form integrated
- [x] Logout implemented
- [x] Admin layout fetches user
- [ ] Test all flows
- [ ] Migrate production admins
- [ ] Remove old JWT code
- [ ] Setup email confirmation (optional)
- [ ] Setup OAuth providers (optional)
