import pool from '@/lib/db';

let ensuredBlockedColumn = false;

/** Adds is_blocked when missing (legacy DBs without Prisma migrate). */
export async function ensureAdminBlockedColumn() {
  if (ensuredBlockedColumn) return;
  try {
    await pool.execute(
      'ALTER TABLE admin_users ADD COLUMN is_blocked TINYINT(1) NOT NULL DEFAULT 0'
    );
  } catch (e) {
    if (e.errno !== 1060 && e.code !== 'ER_DUP_FIELDNAME') throw e;
  }
  ensuredBlockedColumn = true;
}

export async function isAdminUserBlocked(userId) {
  await ensureAdminBlockedColumn();
  const [rows] = await pool.query(
    'SELECT is_blocked FROM admin_users WHERE id = ? LIMIT 1',
    [userId]
  );
  if (!rows.length) return true;
  return Number(rows[0].is_blocked) === 1;
}
