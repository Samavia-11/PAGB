/**
 * Password Migration Script
 * 
 * This script finds all users with plaintext passwords and hashes them with bcrypt.
 * 
 * SECURITY: Run this script ONCE in a secure environment, then delete it.
 * 
 * Usage:
 *   npx ts-node scripts/migrate-passwords.ts
 * 
 * Or add to package.json scripts:
 *   "migrate:passwords": "ts-node scripts/migrate-passwords.ts"
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Database configuration - use environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'armyjournal',
};

// Bcrypt cost factor (12 is recommended for production)
const BCRYPT_ROUNDS = 12;

interface User {
  id: number;
  username: string;
  password: string;
}

async function migratePasswords() {
  console.log('🔐 Password Migration Script');
  console.log('============================\n');

  let connection: mysql.Connection | null = null;

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully\n');

    // Find users with plaintext passwords (not starting with $2a$ or $2b$)
    console.log('🔍 Finding users with plaintext passwords...');
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT id, username, password FROM users 
       WHERE password IS NOT NULL 
       AND password != '' 
       AND password NOT LIKE '$2a$%' 
       AND password NOT LIKE '$2b$%'`
    );

    const users = rows as User[];

    if (users.length === 0) {
      console.log('✅ No plaintext passwords found. All passwords are already hashed.\n');
      return;
    }

    console.log(`⚠️  Found ${users.length} user(s) with plaintext passwords:\n`);

    // List users (without showing passwords)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. User ID: ${user.id}, Username: ${user.username}`);
    });
    console.log('');

    // Confirm before proceeding
    console.log('🔄 Starting password migration...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Hash the plaintext password
        const hashedPassword = await bcrypt.hash(user.password, BCRYPT_ROUNDS);

        // Update the user's password in the database
        await connection.execute(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id]
        );

        console.log(`   ✅ User ${user.id} (${user.username}): Password hashed successfully`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ User ${user.id} (${user.username}): Failed to hash password`);
        console.error(`      Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    console.log('\n============================');
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📝 Total processed: ${users.length}`);
    console.log('============================\n');

    if (errorCount === 0) {
      console.log('🎉 All passwords have been securely hashed!');
      console.log('');
      console.log('⚠️  IMPORTANT: Delete this script after running it.');
      console.log('   It should not remain in your production codebase.\n');
    } else {
      console.log('⚠️  Some passwords failed to migrate. Please investigate the errors above.\n');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Database connection closed.\n');
    }
  }
}

// Verification function to check migration status
async function verifyMigration() {
  console.log('\n🔍 Verifying migration status...\n');

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Count total users
    const [totalRows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users'
    );
    const totalUsers = totalRows[0].count;

    // Count users with hashed passwords
    const [hashedRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM users 
       WHERE password LIKE '$2a$%' OR password LIKE '$2b$%'`
    );
    const hashedUsers = hashedRows[0].count;

    // Count users with plaintext passwords
    const [plaintextRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM users 
       WHERE password IS NOT NULL 
       AND password != '' 
       AND password NOT LIKE '$2a$%' 
       AND password NOT LIKE '$2b$%'`
    );
    const plaintextUsers = plaintextRows[0].count;

    // Count users with no password
    const [noPasswordRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM users 
       WHERE password IS NULL OR password = ''`
    );
    const noPasswordUsers = noPasswordRows[0].count;

    console.log('📊 Password Status Report:');
    console.log('============================');
    console.log(`   Total users:              ${totalUsers}`);
    console.log(`   ✅ Hashed passwords:      ${hashedUsers}`);
    console.log(`   ⚠️  Plaintext passwords:  ${plaintextUsers}`);
    console.log(`   ❓ No password set:       ${noPasswordUsers}`);
    console.log('============================\n');

    if (plaintextUsers === 0) {
      console.log('✅ All passwords are properly hashed!\n');
    } else {
      console.log(`⚠️  ${plaintextUsers} user(s) still have plaintext passwords.`);
      console.log('   Run the migration again to fix this.\n');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--verify')) {
    await verifyMigration();
  } else if (args.includes('--help')) {
    console.log('Password Migration Script');
    console.log('');
    console.log('Usage:');
    console.log('  npx ts-node scripts/migrate-passwords.ts          Run migration');
    console.log('  npx ts-node scripts/migrate-passwords.ts --verify Check status');
    console.log('  npx ts-node scripts/migrate-passwords.ts --help   Show this help');
    console.log('');
    console.log('Environment Variables:');
    console.log('  DB_HOST     Database host (default: localhost)');
    console.log('  DB_PORT     Database port (default: 3306)');
    console.log('  DB_USER     Database user (default: root)');
    console.log('  DB_PASSWORD Database password');
    console.log('  DB_NAME     Database name (default: armyjournal)');
  } else {
    await migratePasswords();
    await verifyMigration();
  }
}

main().catch(console.error);
