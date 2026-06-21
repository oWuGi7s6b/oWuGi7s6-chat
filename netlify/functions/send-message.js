const { getConnection, initializeDatabase } = require('./db-connect');

// CORS处理
function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

exports.handler = async (event, context) => {
  console.log('Send message function called:', {
    method: event.httpMethod,
    path: event.path,
    body: event.body ? '...' : 'empty'
  });

  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: ''
    };
  }

  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      console.error('Invalid JSON body:', event.body);
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { username, content } = body;

    // 验证输入
    if (!username || !content) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Username and content are required' })
      };
    }

    if (username.length > 50 || content.length > 5000) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Input too long' })
      };
    }

    console.log('Initializing database...');
    await initializeDatabase();
    
    console.log('Getting connection pool...');
    const pool = await getConnection();
    
    console.log(`Inserting message from ${username}...`);
    
    const [result] = await pool.execute(
      'INSERT INTO messages (username, content) VALUES (?, ?)',
      [username.trim(), content.trim()]
    );

    console.log(`Message inserted with ID: ${result.insertId}`);

    return {
      statusCode: 201,
      headers: corsHeaders(),
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
