# Change: Migrate to Supabase Stack

## Why
The current system uses a custom stack with PostgreSQL, MinIO for storage, GOWA for WhatsApp notifications, and custom JWT authentication with database-stored tokens. This migration consolidates the infrastructure to use Supabase as a unified backend platform, providing better scalability, security, and developer experience. Supabase offers built-in authentication, database, storage, and real-time capabilities that can replace the current disparate services.

## What Changes
- **BREAKING**: Replace custom JWT authentication with Supabase Auth
- **BREAKING**: Replace MinIO storage with Supabase Storage
- **BREAKING**: Update database connection to use Supabase PostgreSQL
- **BREAKING**: Remove GOWA integration (Supabase doesn't provide WhatsApp services)
- Update environment variables and configuration
- Modify authentication middleware and API routes
- Update file upload/download logic to use Supabase Storage
- Migrate existing admin users to Supabase Auth system

## Impact
- Affected specs: authentication, file-storage, database
- Affected code: All auth-related files, storage utilities, API routes, middleware
- Migration required: Admin users need to be recreated in Supabase Auth
- Downtime: Minimal, but auth system will be unavailable during deployment