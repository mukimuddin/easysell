const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true }
  });
  
  console.log('Pool created');
  try {
    const [rows] = await pool.query('SHOW COLUMNS FROM channels LIKE "gmail"');
    if (rows.length > 0) {
      console.log('Column gmail already exists');
    } else {
      console.log('Adding gmail...');
      await pool.query('ALTER TABLE channels ADD COLUMN gmail VARCHAR(255) NULL');
      console.log('gmail added');
    }

    const [rows2] = await pool.query('SHOW COLUMNS FROM channels LIKE "password"');
    if (rows2.length > 0) {
      console.log('Column password already exists');
    } else {
      console.log('Adding password...');
      await pool.query('ALTER TABLE channels ADD COLUMN password VARCHAR(255) NULL');
      console.log('password added');
    }
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
