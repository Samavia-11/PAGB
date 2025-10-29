import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic database connection
    const testQuery = 'SELECT 1 as test';
    const testResult = await query(testQuery);
    console.log('Database connection test:', testResult);
    
    // Test articles table
    const articlesTest = 'SELECT COUNT(*) as count FROM articles';
    const articlesResult = await query(articlesTest);
    console.log('Articles table test:', articlesResult);
    
    // Test users table
    const usersTest = 'SELECT COUNT(*) as count FROM users';
    const usersResult = await query(usersTest);
    console.log('Users table test:', usersResult);
    
    // Test notifications table structure
    const notificationsTest = 'DESCRIBE notifications';
    const notificationsResult = await query(notificationsTest);
    console.log('Notifications table structure:', notificationsResult);
    
    return NextResponse.json({
      success: true,
      tests: {
        database: testResult,
        articles: articlesResult,
        users: usersResult,
        notifications_structure: notificationsResult
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
