#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database with admin user..."
node prisma/seed.js

echo "✅ Production setup complete!"
