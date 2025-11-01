#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database with admin user..."
npm run seed:admin

echo "✅ Production setup complete!"
