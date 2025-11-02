import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Test if we can create a simple notification
    const testUserId = 1; // Assuming user ID 1 exists
    
    const sql = `INSERT INTO notifications (user_id, type, title, message) 
                 VALUES (?, ?, ?, ?)`;
    
    const result = await query(sql, [
      testUserId,
      'test',
      'Test Notification',
      'This is a test notification to verify the system works'
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Test notification created successfully',
      result: result
    });
    
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json({
      error: 'Failed to create test notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Test fetching notifications
    const testUserId = 1;
    
    const sql = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5';
    const notifications = await query(sql, [testUserId]);
    
    return NextResponse.json({
      success: true,
      notifications: notifications
    });
    
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({
      error: 'Failed to fetch notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
