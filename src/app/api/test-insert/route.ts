import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Create table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS review_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        editor_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert a test request
    const result: any = await query(
      'INSERT INTO review_requests (editor_id, reviewer_id, status) VALUES (?, ?, ?)',
      [1, 2, 'pending'] // Editor ID 1 sending request to Reviewer ID 2
    );

    // Get all requests to verify
    const allRequests: any = await query('SELECT * FROM review_requests');

    return NextResponse.json({
      success: true,
      message: 'Test request inserted',
      insertId: result.insertId,
      allRequests: allRequests
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error inserting test request:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
