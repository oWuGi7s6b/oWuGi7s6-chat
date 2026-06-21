const { getConnection, initializeDatabase } = require('./db-connect');

exports.handler = async (event, context) => {
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, content } = JSON.parse(event.body);

    // 验证输入
    if (!username || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username and content are required' })
      };
    }

    if (username.length > 50 || content.length > 5000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Input too long' })
      };
    }

    await initializeDatabase();
    
    const pool = await getConnection();
    
    const [result] = await pool.execute(
      'INSERT INTO messages (username, content) VALUES (?, ?)',
      [username.trim(), content.trim()]
    );

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: {
          id: result.insertId,
          username,
          content,
          created_at: new Date().toISOString()
        }
      })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
