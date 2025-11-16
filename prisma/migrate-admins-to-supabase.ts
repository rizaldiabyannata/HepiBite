import { PrismaClient } from '@prisma/client';
import { supabaseAdmin } from '../src/lib/supabase';

const prisma = new PrismaClient();

async function migrateAdminsToSupabase() {
  console.log('🚀 Starting admin migration to Supabase Auth...\n');

  try {
    // Get all admins from database
    const admins = await prisma.admin.findMany();
    console.log(`📊 Found ${admins.length} admin(s) to migrate\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const admin of admins) {
      try {
        console.log(`Processing: ${admin.email} (${admin.name})`);

        // Check if user already exists in Supabase
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === admin.email);

        if (existingUser) {
          console.log(`  ℹ️  User already exists, updating metadata...`);

          // Update user metadata
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            user_metadata: {
              name: admin.name,
              role: admin.role,
              prisma_id: admin.id,
              migrated_from_prisma: true,
              updated_at: new Date().toISOString()
            }
          });
          console.log(`  ✅ Updated user: ${existingUser.id}\n`);
        } else {
          console.log(`  🆕 Creating new user in Supabase...`);

          // Generate a temporary password
          const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}!`;

          // Create user in Supabase Auth
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: admin.email,
            password: tempPassword,
            user_metadata: {
              name: admin.name,
              role: admin.role,
              prisma_id: admin.id,
              migrated_from_prisma: true,
              migrated_at: new Date().toISOString()
            },
            email_confirm: true // Auto-confirm email
          });

          if (error) {
            console.error(`  ❌ Failed to create user:`, error.message);
            errorCount++;
            continue;
          }

          console.log(`  ✅ Created user: ${data.user.id}`);
          console.log(`  🔑 Temporary password: ${tempPassword}\n`);
        }

        successCount++;
      } catch (error: any) {
        errorCount++;
        console.error(`  ❌ Failed to migrate ${admin.email}:`, error.message || error);
        console.log('');
      }
    }

    console.log('━'.repeat(60));
    console.log('📋 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('━'.repeat(60));

    console.log('\n🎉 Admin migration completed!');
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('   1. All new users have been created with temporary passwords (shown above)');
    console.log('   2. Admins should change their passwords on first login');
    console.log('   3. You can manage users via Supabase Dashboard');
    console.log('   4. User metadata includes: name, role, and prisma_id\n');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateAdminsToSupabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});