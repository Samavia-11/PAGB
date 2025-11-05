import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all review requests
    const allRequests: any = await query('SELECT * FROM review_requests');
    
    // Get all users
    const allUsers: any = await query('SELECT id, username, full_name, role FROM users');
    
    // Check if table exists
    const tableExists: any = await query("SHOW TABLES LIKE 'review_requests'");
    
    return NextResponse.json({
      tableExists: Array.isArray(tableExists) && tableExists.length > 0,
      totalRequests: Array.isArray(allRequests) ? allRequests.length : 0,
      allRequests: Array.isArray(allRequests) ? allRequests : [],
      allUsers: Array.isArray(allUsers) ? allUsers : [],
      message: 'Debug data retrieved successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
