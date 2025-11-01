# Production Deployment Guide

## Dokploy Deployment

After the application is deployed, you need to initialize the database.

### Initial Setup (Run Once)

Access the Dokploy container terminal and run:

```bash
# Option 1: Use the setup script
sh scripts/setup-production.sh

# Option 2: Manual steps
npx prisma migrate deploy
npm run seed:admin
```

### What This Does:

1. **`npx prisma migrate deploy`** - Runs all pending migrations to create database tables
2. **`npm run seed:admin`** - Creates the default admin user

### Default Admin Credentials:

- **Email**: `admin@example.com`
- **Password**: Check your `DEFAULT_ADMIN_PASSWORD` environment variable in Dokploy

### Environment Variables Required:

Make sure these are set in Dokploy:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret key
- `DEFAULT_ADMIN_PASSWORD` - Admin user password
- `GOWA_ADMIN` - WhatsApp API admin username
- `GOWA_PASSWORD` - WhatsApp API password
- `GOWA_URL` - WhatsApp API URL
- `MINIO_*` - MinIO/S3 configuration
- `DANA_NUMBER` - DANA payment number
- `ADMIN_GROUP_JID` - Admin WhatsApp group ID

### Troubleshooting:

**Error: "Cannot use import statement outside a module"**
- Don't run `node seed.ts` directly
- Use `npm run seed:admin` instead

**Error: "Table does not exist"**
- Run migrations first: `npx prisma migrate deploy`

**Error: "Database connection failed"**
- Check `DATABASE_URL` environment variable
- Ensure database is accessible from the container
