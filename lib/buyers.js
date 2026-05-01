import pool from '@/lib/db';

let ensured = false;

export async function ensureBuyerTable() {
  if (ensured) return;

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS buyer_accounts (
      id INT NOT NULL AUTO_INCREMENT,
      full_name VARCHAR(120) NOT NULL,
      company_name VARCHAR(150) NULL,
      phone VARCHAR(30) NOT NULL,
      email VARCHAR(150) NOT NULL,
      password VARCHAR(255) NOT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      reviewed_by INT NULL,
      reviewed_at DATETIME NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY ux_buyer_email (email)
    )
  `);

  ensured = true;
}
