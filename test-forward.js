const mysql = require('mysql2/promise');

async function testForward() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'armyjournal'
    });

    console.log('✅ Connected to database');

    // Test if we can insert a notification with a valid editor ID
    const [editors] = await connection.execute("SELECT id FROM users WHERE role = 'editor' LIMIT 1");
    const editorId = editors.length > 0 ? editors[0].id : 3;
    
    console.log(`Found editor ID: ${editorId}`);

    // Test notification insert
    try {
      await connection.execute(
        `INSERT INTO notifications (
          user_id, type, title, message, 
          article_id, is_read, created_at
        ) VALUES (
          ?, 'review_submitted', 'TEST: Article Forwarded by Reviewer',
          ?, ?, FALSE, NOW()
        )`,
        [
          editorId,
          'Test article "Sample Article" has been reviewed and forwarded with recommendation: ACCEPT. Reviewer comments: Test comments',
          1
        ]
      );
      console.log('✅ Notification insert test successful');
      
      // Clean up test record
      await connection.execute(
        `DELETE FROM notifications WHERE title = 'TEST: Article Forwarded by Reviewer'`
      );
      console.log('✅ Test cleanup completed');
      
    } catch (error) {
      console.error('❌ Notification insert failed:', error.message);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

testForward();
