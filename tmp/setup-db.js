const mysql = require('mysql2/promise');

const DATABASE_URL = "mysql://SW62n4S6YfW5wSz.root:vvY0htEqzqbGuDJH@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test";

async function setup() {
  try {
    const connection = await mysql.createConnection({
      uri: DATABASE_URL,
      ssl: {
        rejectUnauthorized: true,
      },
    });

    console.log('Connected to TiDB Cloud. Creating tables...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS channels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        channel_name VARCHAR(255) NOT NULL,
        channel_link VARCHAR(255) NOT NULL,
        niche VARCHAR(100) NOT NULL,
        subscribers INT NOT NULL,
        earnings INT DEFAULT 0,
        price INT NOT NULL,
        description TEXT,
        whatsapp VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT PRIMARY KEY,
        username VARCHAR(50),
        password VARCHAR(255)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip VARCHAR(45) NOT NULL,
        attempts INT DEFAULT 1,
        last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (ip)
      )
    `);

    console.log('Tables created successfully!');
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

setup();
