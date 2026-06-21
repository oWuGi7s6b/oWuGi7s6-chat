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
      keepAliveInitialDelayMs: 0,
      ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });
    console.log('Connection pool created successfully');
  }
  return connectionPool;
}

async function initializeDatabase() {
  const pool = await getConnection();
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

exports.handler = async (event, context) => {
  console.log('Send message function called:', {
    method: event.httpMethod
  });

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, content } = JSON.parse(event.body);

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

    await initializeDatabase();
    const pool = await getConnection();
    
    const [result] = await pool.execute(
      'INSERT INTO messages (username, content) VALUES (?, ?)',
      [username.trim(), content.trim()]
    );

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
    console.error('Database error:', error.message);
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
