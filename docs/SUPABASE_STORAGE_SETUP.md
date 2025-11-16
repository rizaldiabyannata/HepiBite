# Supabase Storage Setup Guide

## 📦 Overview

Project ini menggunakan **Supabase Storage** untuk menyimpan file uploads (product images, dll) dengan automatic fallback ke local storage jika Supabase belum dikonfigurasi.

## 🔧 Setup Steps

### 1️⃣ Create Storage Bucket

Di **Supabase Dashboard**:

1. Buka **Storage** → **Buckets**
2. Klik **New Bucket**
3. Konfigurasi:
   ```
   Name: products
   Public bucket: ✅ (centang untuk public access)
   File size limit: 5 MB (opsional)
   Allowed MIME types: image/* (opsional)
   ```
4. Klik **Create Bucket**

### 2️⃣ Setup Row Level Security (RLS) Policies

Supabase Storage memerlukan RLS policies untuk izinkan upload/read.

#### Option A: Via SQL Editor (Recommended)

Buka **SQL Editor** dan jalankan:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads to products bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Policy 2: Allow public read access
CREATE POLICY "Allow public read from products bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Policy 3: Allow authenticated users to update
CREATE POLICY "Allow authenticated update in products bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Policy 4: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete in products bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'products');
```

#### Option B: Via Dashboard UI

1. **Storage** → **Policies** → Select bucket `products`
2. Klik **New Policy**
3. Buat 4 policies:

**Policy 1: Upload (INSERT)**

```
Policy Name: Allow authenticated uploads
Operation: INSERT
Target roles: authenticated
WITH CHECK expression: bucket_id = 'products'
```

**Policy 2: Read (SELECT)**

```
Policy Name: Allow public read
Operation: SELECT
Target roles: public
USING expression: bucket_id = 'products'
```

**Policy 3: Update**

```
Policy Name: Allow authenticated update
Operation: UPDATE
Target roles: authenticated
USING & WITH CHECK: bucket_id = 'products'
```

**Policy 4: Delete**

```
Policy Name: Allow authenticated delete
Operation: DELETE
Target roles: authenticated
USING expression: bucket_id = 'products'
```

### 3️⃣ Configure Next.js Image Domains

Update `next.config.ts` untuk allow Supabase Storage images:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ... existing patterns
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};
```

**✅ Already configured!** File sudah diupdate dengan wildcard `*.supabase.co` untuk support semua Supabase projects.

### 4️⃣ Environment Variables

Pastikan `.env` sudah memiliki:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optional - default: 'products'
NEXT_PUBLIC_SUPABASE_BUCKET=products
```

**⚠️ PENTING:**

- `SUPABASE_SERVICE_ROLE_KEY` diperlukan untuk server-side uploads
- Jangan expose service role key ke client!

### 5️⃣ Test Upload

Setelah setup:

```bash
# Restart dev server
npm run dev

# Test:
# 1. Login ke admin dashboard
# 2. Buka Products → Create Product
# 3. Upload image
# 4. Check console untuk log upload
# 5. Image URL seharusnya dari Supabase (bukan /uploads/)
```

## 🔍 Verify Setup

### Check Console Logs

Saat upload, kamu akan lihat:

```
✅ Uploaded to Supabase Storage: https://xxxxx.supabase.co/storage/v1/object/public/products/...
```

Atau jika ada error:

```
❌ Supabase Storage upload failed: new row violates row-level security policy
⚠️  Falling back to local storage...
```

### Check Bucket Files

Di **Supabase Dashboard** → **Storage** → **products**:

- Kamu akan lihat uploaded files dengan nama seperti: `1234567890-abc123.jpg`

### Check Public URL

URL format:

```
https://[project-ref].supabase.co/storage/v1/object/public/products/[filename]
```

Test akses langsung di browser (harus bisa buka tanpa auth).

## 🐛 Troubleshooting

### Error: "hostname is not configured under images in next.config.js"

**Error lengkap:**

```
Invalid src prop (https://xxxxx.supabase.co/storage/v1/object/public/products/...)
on `next/image`, hostname "xxxxx.supabase.co" is not configured
```

**Penyebab:** Next.js Image component memerlukan whitelist hostname.

**Solusi:** ✅ **Already fixed!** `next.config.ts` sudah dikonfigurasi dengan:

```typescript
{
  protocol: "https",
  hostname: "*.supabase.co",
  pathname: "/storage/v1/object/public/**",
}
```

**Jika masih error:**

1. Restart dev server: `npm run dev`
2. Clear Next.js cache: `rm -rf .next` atau `rmdir /s .next` (Windows)
3. Rebuild: `npm run dev`

### Error: "new row violates row-level security policy"

**Penyebab:** RLS policies belum dibuat atau salah konfigurasi.

**Solusi:**

1. Cek policies di **Storage** → **Policies** → bucket `products`
2. Pastikan ada policy untuk `INSERT` dengan target `authenticated`
3. Re-run SQL script di atas
4. Restart dev server

**Verify dengan SQL:**

```sql
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

### Error: "bucket not found"

**Penyebab:** Bucket `products` belum dibuat.

**Solusi:**

```sql
-- Create bucket via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);
```

Atau buat via Dashboard (step 1 di atas).

### Error: "Storage not configured"

**Penyebab:** Environment variables belum set.

**Solusi:**

```bash
# Check .env
cat .env | grep SUPABASE

# Must have:
# NEXT_PUBLIC_SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
```

### Upload berhasil tapi file tidak muncul

**Penyebab:** Bucket tidak public atau policy SELECT tidak ada.

**Solusi:**

1. **Storage** → **Buckets** → `products` → **Settings**
2. Pastikan "Public bucket" = ✅
3. Atau tambah SELECT policy (lihat step 2)

### Error: "Access denied"

**Penyebab:** Service role key salah atau tidak ada.

**Solusi:**

1. Dashboard → **Settings** → **API**
2. Copy **service_role** key (bukan anon!)
3. Update `SUPABASE_SERVICE_ROLE_KEY` di `.env`
4. Restart dev server

### Upload lambat atau timeout

**Penyebab:** File terlalu besar atau network issue.

**Solusi:**

1. Reduce `MAX_FILE_SIZE` di `upload/route.ts` (default 5MB)
2. Compress images before upload
3. Check Supabase project region (pilih yang dekat)

## 📊 Usage in Code

### Upload File (Server-side)

```typescript
import { uploadToStorage, isStorageEnabled } from "@/lib/storage";

if (isStorageEnabled()) {
  const url = await uploadToStorage(buffer, filename, "image/jpeg");
  console.log("Uploaded:", url);
}
```

### Delete File

```typescript
import { deleteFromStorage } from "@/lib/storage";

await deleteFromStorage("1234567890-abc123.jpg");
```

### Get Public URL

```typescript
import { getPublicUrl } from "@/lib/storage";

const url = await getPublicUrl("1234567890-abc123.jpg");
```

### Check if Enabled

```typescript
import { isStorageEnabled } from "@/lib/storage";

if (isStorageEnabled()) {
  // Use Supabase Storage
} else {
  // Fallback to local storage
}
```

## 🔐 Security Best Practices

### 1. RLS Policies

**Current Setup (Permissive):**

- ✅ Any authenticated user can upload
- ✅ Anyone can read (public)

**More Restrictive (Optional):**

```sql
-- Only ADMIN/SUPER_ADMIN can upload
CREATE POLICY "Admin only uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products'
  AND (auth.jwt()->>'role')::text IN ('ADMIN', 'SUPER_ADMIN')
);
```

### 2. File Validation

Already implemented in `upload/route.ts`:

- ✅ Max size: 5MB
- ✅ Allowed types: JPEG, PNG, WebP, GIF
- ✅ Filename sanitization

### 3. Service Role Key

- ❌ **NEVER** commit `.env` to git
- ❌ **NEVER** expose in client code
- ✅ Only use in API routes & server components
- ✅ Rotate periodically in production

### 4. Bucket Configuration

Production tips:

- Set file size limits per bucket
- Enable versioning for important files
- Setup lifecycle rules to auto-delete old files
- Use CDN for better performance

## 📚 Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage Security](https://supabase.com/docs/guides/storage/security/access-control)
- [RLS Policy Examples](https://supabase.com/docs/guides/storage/security/access-control#policy-examples)

## ✅ Checklist

Setup completion checklist:

- [ ] Bucket `products` created
- [ ] Bucket is public (or has SELECT policy)
- [ ] RLS policies created (INSERT, SELECT, UPDATE, DELETE)
- [ ] Environment variables set (`SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Dev server restarted
- [ ] Test upload successful
- [ ] Image accessible via public URL
- [ ] Console shows "✅ Uploaded to Supabase Storage"

---

**Need Help?** Check console logs untuk detailed error messages dan lihat Troubleshooting section di atas.
