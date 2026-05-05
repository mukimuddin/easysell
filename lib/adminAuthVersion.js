import pool from '@/lib/db';

let ensuredAuthVersionColumn = false;

/** Adds auth_version when missing (invalidates JWTs when bumped). */
export async function ensureAdminAuthVersionColumn() {
  if (ensuredAuthVersionColumn) return;
  try {
    await pool.execute(
      'ALTER TABLE admin_users ADD COLUMN auth_version INT NOT NULL DEFAULT 0'
    );
  } catch (e) {
    if (e.errno !== 1060 && e.code !== 'ER_DUP_FIELDNAME') throw e;
  }
  ensuredAuthVersionColumn = true;
}

export async function getAdminAuthVersion(userId) {
  await ensureAdminAuthVersionColumn();
  const [rows] = await pool.query(
    'SELECT COALESCE(auth_version, 0) AS v FROM admin_users WHERE id = ? LIMIT 1',
    [userId]
  );
  if (!rows.length) return 0;
  return Number(rows[0].v) || 0;
}

export async function bumpAdminAuthVersion(userId) {
  await ensureAdminAuthVersionColumn();
  await pool.execute(
    'UPDATE admin_users SET auth_version = COALESCE(auth_version, 0) + 1 WHERE id = ?',
    [userId]
  );
}
