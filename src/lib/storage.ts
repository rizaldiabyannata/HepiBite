import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Default bucket name - can be overridden via env
const DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'products';

export function isStorageEnabled(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

export async function uploadToStorage(file: File | Buffer, key: string, contentType?: string): Promise<string> {
  if (!isStorageEnabled()) {
    throw new Error("Supabase Storage not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  // Create admin client for storage operations
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Convert Buffer to Uint8Array for upload
  let fileToUpload: File | Uint8Array;
  if (Buffer.isBuffer(file)) {
    fileToUpload = new Uint8Array(file);
  } else {
    fileToUpload = file;
  }

  const bucket = DEFAULT_BUCKET;
  
  console.log(`[Storage] Uploading ${key} to bucket: ${bucket}`);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(key, fileToUpload, {
      contentType: contentType || 'application/octet-stream',
      upsert: false,
      cacheControl: '3600'
    });

  if (error) {
    console.error(`[Storage] Upload failed for ${key}:`, error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  console.log(`[Storage] Upload successful:`, data);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(key);

  console.log(`[Storage] Public URL generated: ${urlData.publicUrl}`);
  
  return urlData.publicUrl;
}

export async function deleteFromStorage(key: string, bucketName?: string): Promise<void> {
  if (!isStorageEnabled()) {
    throw new Error("Storage not configured");
  }

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const bucket = bucketName || DEFAULT_BUCKET;
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([key]);

  if (error) throw error;
}

export async function getPublicUrl(key: string, bucketName?: string): Promise<string> {
  if (!isStorageEnabled()) {
    throw new Error("Storage not configured");
  }

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const bucket = bucketName || DEFAULT_BUCKET;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(key);

  return data.publicUrl;
}

// Legacy function for backward compatibility
export const uploadToMinio = uploadToStorage;
export const isMinioEnabled = isStorageEnabled;