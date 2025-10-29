import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Simple comments API called for article:', params.id);
    
    const body = await request.json();
    console.log('Request body received:', body);
    
    // Just return success without doing any database operations
    return NextResponse.json({
      success: true,
      message: 'Simple test successful - comments would be sent to author',
      received_data: {
        article_id: params.id,
        from_user_id: body.from_user_id,
        from_role: body.from_role,
        comments: body.comments?.substring(0, 50) + '...'
      }
    });
    
  } catch (error) {
    console.error('Simple comments API error:', error);
    return NextResponse.json({
      error: 'Simple test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
