import pool from '@/lib/db';

let ensured = false;

export async function ensureEmployeeApplicationTable() {
  if (ensured) return;

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS employee_applications (
      id INT NOT NULL AUTO_INCREMENT,
      full_name VARCHAR(120) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      email VARCHAR(150) NOT NULL,
      password VARCHAR(255) NOT NULL,
      work_preference ENUM('online', 'field', 'hybrid') NOT NULL DEFAULT 'hybrid',
      job_reference VARCHAR(80) NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      reviewed_by INT NULL,
      reviewed_at DATETIME NULL,
      created_admin_id INT NULL,
      assigned_username VARCHAR(50) NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_employee_apps_status (status),
      KEY idx_employee_apps_email (email)
    )
  `);

  ensured = true;
}
