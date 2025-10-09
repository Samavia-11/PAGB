import { NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/db';

export async function GET() {
  try {
    // Test connection
    const connected = await testConnection();
    
    if (!connected) {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        config: {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || '3306',
          database: process.env.DB_NAME || 'armyjournal',
          user: process.env.DB_USER || 'root',
          hasPassword: !!process.env.DB_PASSWORD,
        }
      }, { status: 500 });
    }

    // Try to query users
    const users: any = await query('SELECT id, username, role, email FROM users LIMIT 5');
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      userCount: users.length,
      users: users,
      config: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '3306',
        database: process.env.DB_NAME || 'armyjournal',
        user: process.env.DB_USER || 'root',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Error testing database',
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
