/**
 * Truncate all tables in the Prisma schema.
 *
 * Usage:
 *   npx tsx src/scripts/truncate-all-tables.ts
 *
 * WARNING: This will delete ALL data in the database!
 */

import { prisma } from './src/lib/prisma';

async function main() {
    // Disable referential integrity to allow truncation in any order
    await prisma.$executeRawUnsafe(`SET session_replication_role = 'replica';`);

    // Truncate all tables (order doesn't matter with referential integrity off)
    await prisma.$executeRawUnsafe(`
        TRUNCATE TABLE
            "verification",
            "account",
            "session",
            "user_credit_purchase",
            "user_license",
            "user"
        RESTART IDENTITY CASCADE;
    `);

    // Restore referential integrity
    await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin';`);

    console.log('✅ All tables truncated.');
}

main()
    .catch((e) => {
        console.error('❌ Error truncating tables:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
