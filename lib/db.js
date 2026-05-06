import mysql from 'mysql2/promise';

let pool;

if (process.env.NODE_ENV === 'production') {
  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    timezone: 'Z',
    ssl: false,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });
} else {
  // In development, use a global variable to preserve the pool across HMR
  if (!global.mysqlPool) {
    global.mysqlPool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      timezone: 'Z',
      ssl: false,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      maxIdle: 10,
      idleTimeout: 60000,
    });
  }
  pool = global.mysqlPool;
}

export default pool;

