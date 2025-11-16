# Quick Start: Supabase Storage

## Setup (5 menit)

### 1. Create Bucket

Dashboard → Storage → New Bucket → Name: `products`, Public: ✅

### 2. Setup RLS Policies

SQL Editor → Run:

```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated uploads to products bucket"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow public read from products bucket"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'products');

CREATE POLICY "Allow authenticated update in products bucket"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'products') WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow authenticated delete in products bucket"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'products');
```

### 3. Next.js Image Config

✅ **Already configured!** `next.config.ts` sudah memiliki:

```typescript
hostname: "*.supabase.co";
```

### 4. Environment Variables

Tambahkan ke `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Required!
```

### 5. Test

```bash
npm run dev
# Login → Products → Upload image
# Check console: "✅ Uploaded to Supabase Storage"
```

## Troubleshooting

### Error: "hostname not configured in next.config.js"

→ ✅ Already fixed! Restart dev: `npm run dev`

### Error: "row-level security policy"

→ Run SQL policies (step 2)

### Error: "bucket not found"

→ Create bucket (step 1)

### Error: "Storage not configured"

→ Set `SUPABASE_SERVICE_ROLE_KEY` in `.env`

---

📖 **Detailed guide:** `docs/SUPABASE_STORAGE_SETUP.md`
