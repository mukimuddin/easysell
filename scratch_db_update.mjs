import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: true }
    });
    try {
        const [rows] = await connection.query("SHOW COLUMNS FROM admin_users LIKE 'role'");
        console.log(rows);
        
        // Try to alter it
        const alterQuery = "ALTER TABLE admin_users MODIFY COLUMN role ENUM('main', 'sub', 'employee') DEFAULT 'main'";
        console.log('Running:', alterQuery);
        await connection.query(alterQuery);
        console.log('Success!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

run();
