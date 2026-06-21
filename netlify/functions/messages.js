const { getConnection, initializeDatabase } = require('./db-connect');

// CORS处理
function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

exports.handler = async (event, context) => {
  console.log('Messages function called:', {
    method: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters
  });

  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: ''
    };
  }

  // 只允许GET请求
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Initializing database...');
    await initializeDatabase();
    
    console.log('Getting connection pool...');
    const pool = await getConnection();
    
    const limit = Math.min(parseInt(event.queryStringParameters?.limit) || 50, 100);
    const offset = parseInt(event.queryStringParameters?.offset) || 0;

    console.log(`Fetching messages: limit=${limit}, offset=${offset}`);
    
    const [messages] = await pool.execute(
      'SELECT id, username, content, created_at FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    console.log(`Successfully fetched ${messages.length} messages`);

    // 反转数组以显示正确的时间顺序
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: true,
        data: messages.reverse(),
        count: messages.length
      })
    };
  } catch (error) {
    console.error('Database error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
