const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'stpauls_card_dept',
  user:     process.env.DB_USER     || 'stpauls_admin',
  password: process.env.DB_PASSWORD || 'StPauls@2024!',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err);
});

module.exports = pool;
