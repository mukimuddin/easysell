import mysql from 'mysql2/promise';

// Use a single connection URL (standard for Vercel & TiDB Cloud)
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
