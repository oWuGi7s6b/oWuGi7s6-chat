const { getConnection, initializeDatabase } = require('./db-connect');

exports.handler = async (event, context) => {
  // 只允许GET请求
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    await initializeDatabase();
    
    const pool = await getConnection();
    const limit = parseInt(event.queryStringParameters?.limit) || 50;
    const offset = parseInt(event.queryStringParameters?.offset) || 0;

    const [messages] = await pool.execute(
      'SELECT * FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    // 反转数组以显示正确的时间顺序
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: messages.reverse()
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
