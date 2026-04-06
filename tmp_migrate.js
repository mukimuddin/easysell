import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function migrate() {
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log('Connected to DB');
  try {
    console.log('Adding gmail column...');
    try {
      await connection.execute('ALTER TABLE channels ADD COLUMN gmail VARCHAR(255) DEFAULT NULL;');
      console.log('Gmail column added.');
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') console.log('Gmail already exists.');
      else throw e;
    }

    console.log('Adding password column...');
    try {
      await connection.execute('ALTER TABLE channels ADD COLUMN password VARCHAR(255) DEFAULT NULL;');
      console.log('Password column added.');
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') console.log('Password already exists.');
      else throw e;
    }
    console.log('Migration completed!');
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    await connection.end();
  }
}

migrate();
