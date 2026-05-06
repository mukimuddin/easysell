import pool from '@/lib/db';

let ensuredAuthVersionColumn = false;

/** Adds auth_version when missing (invalidates JWTs when bumped). */
export async function getAdminAuthVersion(userId) {
  const [rows] = await pool.query(
    'SELECT COALESCE(auth_version, 0) AS v FROM admin_users WHERE id = ? LIMIT 1',
    [userId]
  );
  if (!rows.length) return 0;
  return Number(rows[0].v) || 0;
}

export async function bumpAdminAuthVersion(userId) {
  await pool.execute(
    'UPDATE admin_users SET auth_version = COALESCE(auth_version, 0) + 1 WHERE id = ?',
    [userId]
  );
}
