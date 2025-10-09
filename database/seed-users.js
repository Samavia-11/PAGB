const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'armyjournal',
};

const defaultUsers = [
  {
    username: 'author',
    email: 'author@armyjournal.com',
    password: 'author123',
    fullName: 'Author User',
    role: 'author',
  },
  {
    username: 'reviewers',
    email: 'reviewers@armyjournal.com',
    password: 'reviewers123',
    fullName: 'Reviewer User',
    role: 'reviewer',
  },
  {
    username: 'editor',
    email: 'editor@armyjournal.com',
    password: 'editor123',
    fullName: 'Editor User',
    role: 'editor',
  },
  {
    username: 'administrator',
    email: 'admin@armyjournal.com',
    password: 'admin123',
    fullName: 'Administrator User',
    role: 'administrator',
  },
];

async function seedUsers() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    for (const user of defaultUsers) {
      console.log(`\n🔄 Processing user: ${user.username}`);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [user.username]
      );

      if (existing.length > 0) {
        // Update existing user
        await connection.execute(
          'UPDATE users SET email = ?, password = ?, full_name = ?, role = ? WHERE username = ?',
          [user.email, hashedPassword, user.fullName, user.role, user.username]
        );
        console.log(`✅ Updated user: ${user.username}`);
      } else {
        // Insert new user
        await connection.execute(
          'INSERT INTO users (username, email, password, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [user.username, user.email, hashedPassword, user.fullName, user.role]
        );
        console.log(`✅ Created user: ${user.username}`);
      }
    }

    console.log('\n✅ All users seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    defaultUsers.forEach(user => {
      console.log(`${user.role.toUpperCase().padEnd(15)} | ${user.username.padEnd(15)} | ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the seeder
seedUsers();
