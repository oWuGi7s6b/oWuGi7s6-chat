const mysql = require('mysql2/promise');

let connectionPool;

async function getConnection() {
  const requiredEnvs = ['TIDB_HOST', 'TIDB_USER', 'TIDB_PASSWORD', 'TIDB_DATABASE'];
  const missing = requiredEnvs.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  if (!connectionPool) {
    console.log('Creating TiDB connection pool...');
    connectionPool = await mysql.createPool({
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT || 4000,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      // 删掉 keepAliveInitialDelayMs: 0 这一行！
      ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });
    console.log('Connection pool created successfully');
  }
  return connectionPool;
}

async function initializeDatabase(pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      content LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_created_at (created_at)
    )
  `);
}

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
    path: event.path
  });

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const pool = await getConnection();
    await initializeDatabase(pool);

    // 修复NaN问题：先取值，再转数字，不存在则赋值0
    let limit = event.queryStringParameters?.limit;
    let offset = event.queryStringParameters?.offset;
    limit = limit ? Math.min(Number(limit), 100) : 50;
    offset = offset ? Number(offset) : 0;

    // 强制转为整数，防止小数/NaN
    limit = Math.floor(limit);
    offset = Math.floor(offset);
    // 最小不能小于0
    limit = Math.max(limit, 1);
    offset = Math.max(offset, 0);

    const [messages] = await pool.execute(
      'SELECT id, username, content, created_at FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: true,
        data: messages.reverse()
      })
    };
  } catch (error) {
    // 打印完整错误堆栈，方便排查
    console.error('Database full error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
