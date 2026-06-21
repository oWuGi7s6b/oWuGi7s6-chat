const mysql = require('mysql2/promise');

let connectionPool;

async function getConnection() {
  if (!connectionPool) {
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
  }
  return connectionPool;
}

// 初始化数据库表
async function initializeDatabase() {
  const pool = await getConnection();
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_created_at (created_at)
    )
  `);
}

module.exports = {
  getConnection,
  initializeDatabase
};
